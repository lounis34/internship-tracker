import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    company: v.string(),
    role: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    await ctx.db.insert("applications", {
      ...args,
      dateApplied: Date.now(),
      userId: identity.subject,
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("applications"), status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const app = await ctx.db.get(args.id);
    if (!app || app.userId !== identity.subject) {
        throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteApp = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const app = await ctx.db.get(args.id);
    if (!app || app.userId !== identity.subject) {
        throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});
