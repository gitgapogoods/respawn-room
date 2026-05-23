import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addToWishlist = mutation({
  args: {
    item: v.string(),
    category: v.string(),
    price: v.string(),
    link: v.string(),
    source: v.optional(v.string()),
    setupId: v.optional(v.id("setups")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authenticate to save loot");

    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_link", (q) =>
        q.eq("userId", userId).eq("link", args.link)
      )
      .unique();

    if (existing) {
      throw new Error("Item already in wishlist");
    }

    await ctx.db.insert("wishlist", {
      ...args,
      userId,
    });
    return null;
  },
});

export const removeFromWishlist = mutation({
  args: { wishlistId: v.id("wishlist") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const item = await ctx.db.get(args.wishlistId);
    if (!item || item.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.wishlistId);
    return null;
  },
});

export const listWishlist = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
