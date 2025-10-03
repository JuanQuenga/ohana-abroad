import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./auth";

export const list = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    return await ctx.db
      .query("accommodations")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    name: v.string(),
    address: v.optional(v.string()),
    checkIn: v.string(),
    checkOut: v.string(),
    confirmationNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    return await ctx.db.insert("accommodations", {
      ...args,
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    accommodationId: v.id("accommodations"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    confirmationNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    const { accommodationId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(accommodationId, filteredUpdates);
  },
});

export const remove = mutation({
  args: { accommodationId: v.id("accommodations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    await ctx.db.delete(args.accommodationId);
  },
});
