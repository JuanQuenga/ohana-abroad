import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  trips: defineTable({
    title: v.string(),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_created_by", ["createdBy"]),

  itineraryItems: defineTable({
    tripId: v.id("trips"),
    date: v.string(),
    time: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.union(v.literal("activity"), v.literal("transport"), v.literal("meal"), v.literal("accommodation")),
    createdBy: v.id("users"),
  }).index("by_trip_and_date", ["tripId", "date"]),

  accommodations: defineTable({
    tripId: v.id("trips"),
    name: v.string(),
    address: v.optional(v.string()),
    checkIn: v.string(),
    checkOut: v.string(),
    confirmationNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_trip", ["tripId"]),

  activities: defineTable({
    tripId: v.id("trips"),
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    cost: v.optional(v.string()),
    bookingRequired: v.boolean(),
    status: v.union(v.literal("planned"), v.literal("booked"), v.literal("completed")),
    createdBy: v.id("users"),
  }).index("by_trip", ["tripId"]),

  packingItems: defineTable({
    tripId: v.id("trips"),
    item: v.string(),
    category: v.string(),
    packed: v.boolean(),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
  }).index("by_trip", ["tripId"]),

  notes: defineTable({
    tripId: v.id("trips"),
    title: v.string(),
    content: v.string(),
    createdBy: v.id("users"),
  }).index("by_trip", ["tripId"]),

  reminders: defineTable({
    tripId: v.id("trips"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(),
    completed: v.boolean(),
    createdBy: v.id("users"),
  }).index("by_trip", ["tripId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
