import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  applications: defineTable({
    company: v.string(),
    role: v.string(),
    status: v.string(),
    dateApplied: v.number(),
    notes: v.optional(v.string()),
    userId: v.string(),
  }).index("by_user", ["userId"]),
});
