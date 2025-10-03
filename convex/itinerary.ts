import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./auth";

export const list = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    if (!userId) return [];
    
    return await ctx.db
      .query("itineraryItems")
      .withIndex("by_trip_and_date", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    date: v.string(),
    time: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.union(v.literal("activity"), v.literal("transport"), v.literal("meal"), v.literal("accommodation")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.db.insert("itineraryItems", {
      ...args,
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    itemId: v.id("itineraryItems"),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(v.union(v.literal("activity"), v.literal("transport"), v.literal("meal"), v.literal("accommodation"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    if (!userId) throw new Error("Not authenticated");
    
    const { itemId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(itemId, filteredUpdates);
  },
});

export const remove = mutation({
  args: { itemId: v.id("itineraryItems") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.delete(args.itemId);
  },
});
