import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getActiveChallenge = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db
      .query("challenges")
      .withIndex("by_active", (q) => q.eq("active", true))
      .first();
  },
});

export const listChallengeEntries = query({
  args: { challengeId: v.id("challenges") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("setups")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .order("desc")
      .collect();

    return Promise.all(
      entries.map(async (s) => ({
        ...s,
        originalImageUrl: await ctx.storage.getUrl(s.originalImageId),
        resultImageUrl: s.resultImageId ? await ctx.storage.getUrl(s.resultImageId) : null,
      }))
    );
  },
});

export const enterCompetition = mutation({
  args: { 
    setupId: v.id("setups"),
    challengeId: v.optional(v.id("challenges"))
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const setup = await ctx.db.get(args.setupId);
    if (!setup || setup.userId !== userId) {
      throw new Error("Invalid setup selection");
    }

    if (setup.status !== "completed") {
      throw new Error("Only completed respawns can enter competitions");
    }

    await ctx.db.patch(args.setupId, {
      inCompetition: true,
      challengeId: args.challengeId,
      voteCount: setup.voteCount ?? 0,
    });
    return null;
  },
});

export const vote = mutation({
  args: { setupId: v.id("setups") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Log in to vote for battle stations");

    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_user_and_setup", (q) => 
        q.eq("userId", userId).eq("setupId", args.setupId)
      )
      .unique();

    if (existingVote) {
      throw new Error("You have already voted for this setup");
    }

    const setup = await ctx.db.get(args.setupId);
    if (!setup) throw new Error("Setup not found");

    await ctx.db.insert("votes", { userId, setupId: args.setupId });
    await ctx.db.patch(args.setupId, {
      voteCount: (setup.voteCount ?? 0) + 1,
    });

    return null;
  },
});

export const listCompetitionEntries = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("setups")
      .withIndex("by_competition", (q) => q.eq("inCompetition", true))
      .order("desc")
      .collect();

    return Promise.all(
      entries.map(async (s) => ({
        ...s,
        originalImageUrl: await ctx.storage.getUrl(s.originalImageId),
        resultImageUrl: s.resultImageId ? await ctx.storage.getUrl(s.resultImageId) : null,
      }))
    );
  },
});
