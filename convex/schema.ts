import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  setups: defineTable({
    userId: v.id("users"),
    originalImageId: v.id("_storage"),
    resultImageId: v.optional(v.id("_storage")),
    wallpaperImageId: v.optional(v.id("_storage")),
    style: v.string(),
    games: v.string(),
    budget: v.string(),
    platform: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    voteCount: v.optional(v.number()),
    inCompetition: v.optional(v.boolean()),
    analysis: v.optional(v.object({
      rating: v.string(),
      feedback: v.string(),
      roast: v.optional(v.string()),
      totalCost: v.optional(v.string()),
      recommendations: v.array(v.object({
        category: v.string(),
        item: v.string(),
        price: v.string(),
        link: v.string(),
        why: v.optional(v.string()),
        source: v.optional(v.string()), // 'gapo' | 'amazon' | 'shopify'
      }))
    })),
    socialCaptions: v.optional(v.object({
      tiktok: v.string(),
      instagram: v.string(),
    })),
  }).index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_competition", ["inCompetition", "voteCount"]),

  votes: defineTable({
    userId: v.id("users"),
    setupId: v.id("setups"),
  }).index("by_user_and_setup", ["userId", "setupId"])
    .index("by_setup", ["setupId"]),
});
