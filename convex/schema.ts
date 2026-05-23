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
      scannedHardware: v.optional(v.array(v.string())),
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
    lightingConfig: v.optional(v.array(v.object({
      name: v.string(),
      hex: v.string(),
      description: v.string(),
    }))),
    challengeId: v.optional(v.id("challenges")),
  }).index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_competition", ["inCompetition", "voteCount"])
    .index("by_challenge", ["challengeId"]),

  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    active: v.boolean(),
    date: v.string(),
    type: v.string(),
  }).index("by_active", ["active"])
    .index("by_date", ["date"]),

  votes: defineTable({
    userId: v.id("users"),
    setupId: v.id("setups"),
  }).index("by_user_and_setup", ["userId", "setupId"])
    .index("by_setup", ["setupId"]),

  wishlist: defineTable({
    userId: v.id("users"),
    item: v.string(),
    category: v.string(),
    price: v.string(),
    link: v.string(),
    source: v.optional(v.string()),
    setupId: v.optional(v.id("setups")),
  }).index("by_user", ["userId"])
    .index("by_user_and_link", ["userId", "link"]),
});
