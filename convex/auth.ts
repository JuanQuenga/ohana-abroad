import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const loggedInUser = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      subject: v.string(),
    })
  ),
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find user by WorkOS subject
    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q: any) => q.eq("subject", identity.subject))
      .unique();

    return user;
  },
});

export const createUser = mutation({
  args: {
    subject: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists (double-check in case of race condition)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_subject", (q: any) => q.eq("subject", args.subject))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    return await ctx.db.insert("users", args);
  },
});

// Helper function to get current user, throwing if not authenticated
export const getCurrentUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_subject", (q: any) => q.eq("subject", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
