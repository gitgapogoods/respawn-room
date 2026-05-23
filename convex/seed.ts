import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedChallenges = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("challenges").collect();
    if (existing.length > 0) return null;

    await ctx.db.insert("challenges", {
      title: "Retro Revival",
      description: "Show us your best 80s arcade inspired battlestation. Think neon pinks, chunky pixels, and CRT vibes.",
      active: true,
      date: new Date().toISOString().split('T')[0],
      type: "retro",
    });

    await ctx.db.insert("challenges", {
      title: "Cyber-Stealth",
      description: "Matte black, minimal wires, and sharp cyan accents. The ultimate hacker den.",
      active: false,
      date: "2024-05-24",
      type: "cyberpunk",
    });

    return null;
  },
});
