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
      .query("packingItems")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    item: v.string(),
    category: v.string(),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.db.insert("packingItems", {
      ...args,
      packed: false,
      createdBy: userId,
    });
  },
});

export const togglePacked = mutation({
  args: { itemId: v.id("packingItems") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    if (!userId) throw new Error("Not authenticated");
    
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    
    await ctx.db.patch(args.itemId, { packed: !item.packed });
  },
});

export const update = mutation({
  args: {
    itemId: v.id("packingItems"),
    item: v.optional(v.string()),
    category: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
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
  args: { itemId: v.id("packingItems") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.delete(args.itemId);
  },
});
