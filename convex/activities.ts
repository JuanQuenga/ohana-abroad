import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./auth";

export const list = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    return await ctx.db
      .query("activities")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    cost: v.optional(v.string()),
    bookingRequired: v.boolean(),
    status: v.union(v.literal("planned"), v.literal("booked"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    return await ctx.db.insert("activities", {
      ...args,
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    activityId: v.id("activities"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    cost: v.optional(v.string()),
    bookingRequired: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("planned"), v.literal("booked"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    const { activityId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(activityId, filteredUpdates);
  },
});

export const remove = mutation({
  args: { activityId: v.id("activities") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    await ctx.db.delete(args.activityId);
  },
});
