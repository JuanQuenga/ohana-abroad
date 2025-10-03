import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get trips where user is a member
    const memberships = await ctx.db
      .query("tripMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const tripIds = memberships.map((m) => m.tripId);

    if (tripIds.length === 0) {
      return [];
    }

    const trips = await Promise.all(
      tripIds.map((tripId) => ctx.db.get(tripId))
    );

    return trips.filter((trip) => trip !== null);
  },
});

export const get = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(args.tripId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const tripId = await ctx.db.insert("trips", {
      ...args,
      createdBy: userId,
    });

    // Add creator as owner of the trip
    await ctx.db.insert("tripMembers", {
      tripId,
      userId,
      role: "owner",
      invitedBy: userId,
      joinedAt: Date.now(),
    });

    return tripId;
  },
});

export const update = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.optional(v.string()),
    destination: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { tripId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(tripId, filteredUpdates);
  },
});

export const remove = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.tripId);
  },
});

// Collaboration functions
export const getMembers = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user has access to this trip
    const membership = await ctx.db
      .query("tripMembers")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("Access denied");
    }

    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get user details for each member
    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        const invitedBy = await ctx.db.get(member.invitedBy);
        return {
          ...member,
          user,
          invitedBy,
        };
      })
    );

    return membersWithUsers;
  },
});

export const inviteMember = mutation({
  args: {
    tripId: v.id("trips"),
    email: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user has permission to invite (owner or editor)
    const membership = await ctx.db
      .query("tripMembers")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.or(q.eq(q.field("role"), "owner"), q.eq(q.field("role"), "editor"))
        )
      )
      .first();

    if (!membership) {
      throw new Error("Insufficient permissions");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("tripMembers")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingMember) {
      throw new Error("User is already a member");
    }

    // Check for existing pending invitation
    const existingInvitation = await ctx.db
      .query("tripInvitations")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingInvitation) {
      throw new Error("Invitation already sent");
    }

    // Generate invitation token
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const invitationId = await ctx.db.insert("tripInvitations", {
      tripId: args.tripId,
      email: args.email,
      role: args.role,
      invitedBy: userId,
      invitedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      status: "pending",
      token,
    });

    return invitationId;
  },
});

export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invitation = await ctx.db
      .query("tripInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation expired");
    }

    // Get user to check email match
    const user = await ctx.db.get(userId);
    if (!user || user.email !== invitation.email) {
      throw new Error("Invitation email doesn't match your account");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("tripMembers")
      .withIndex("by_trip", (q) => q.eq("tripId", invitation.tripId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingMember) {
      throw new Error("Already a member of this trip");
    }

    // Add user as member
    await ctx.db.insert("tripMembers", {
      tripId: invitation.tripId,
      userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      joinedAt: Date.now(),
    });

    // Update invitation status
    await ctx.db.patch(invitation._id, { status: "accepted" });

    return invitation.tripId;
  },
});
