"use node";
import { Agent, createTool } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import Replicate from "replicate";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const roomAnalyst = new Agent((components as any).agent, {
  name: "Respawn Room Architect",
  instructions: `You are an expert gaming setup designer and interior architect for gamers. 
  
  When you receive a request to analyze a room:
  1. Use the 'transformRoom' tool to generate a visual mockup based on the user's preferred style.
  2. IDENTIFY HARDWARE: Look closely at the provided image. Try to identify specific brands or models of hardware (e.g. 'Logitech G Pro mouse', 'Herman Miller chair', 'LG UltraGear monitor').
  3. Provide a funny, gamer-slang roast of their current setup, specifically mentioning one piece of hardware you spotted.
  4. Detail the transformation analysis. Explain WHY specific changes were made, referencing the hardware the user already has.
  5. Assign a rank (S-Rank to D-Rank).
  6. Generate social media captions.
  
  ADVANCED PRODUCT RECOMMENDATIONS:
  - For each recommended item, provide a "Why" explanation that connects to their existing gear (e.g., "Since you're using a Secretlab chair, these warm LED strips will highlight the leather texture perfectly.").
  - Structure your response such that the "Why" for each item is clear.
  - Tailor recommendations to: style, games, lighting, budget, and platform.

  Always include the result of 'transformRoom' in your final response as data.
  
  Communicate like a high-level gamer. Use terms like 'raid boss', 'HP pool', 'loot', 'respawn', 'loadout'.`,
  languageModel: openrouter.chat("openai/gpt-4o"),
  maxSteps: 5,
  tools: {
    transformRoom: createTool({
      description: "Generates a redesigned version of a room image based on a style prompt.",
      args: z.object({ 
        imageUrl: z.string().describe("The URL of the original room image"),
        stylePrompt: z.string().describe("The description of the desired gaming style (e.g. 'Cyberpunk with neon cyan and purple accents')")
      }),
      handler: async (_ctx, args): Promise<string> => {
        if (!process.env.REPLICATE_API_TOKEN) {
           return "Error: REPLICATE_API_TOKEN not configured. Visual mockup failed.";
        }

        let styleEnhancement = "";
        if (args.stylePrompt.toLowerCase().includes("cozy rpg")) {
          styleEnhancement = ", nintendo switch setup, animal crossing vibes, zelda aesthetics, floor seating with fluffy pillows, warm under-glow LED lighting, natural wood shelves with wicker baskets, cozy gaming sanctuary, soft autumn colors, high-end console gaming room";
        }

        try {
          // Using a ControlNet model for interior redesign
          const output = await replicate.run(
            "jagilley/controlnet-hough:854e96b6d6ec3f9f447781b0a33a3ef9838084050d24c0d164d1f21f1d11ed52",
            {
              input: {
                image: args.imageUrl,
                prompt: `a high-end gaming room setup, ${args.stylePrompt}${styleEnhancement}, realistic, 4k, architectural photography, cinematic lighting`,
                num_samples: 1,
                image_resolution: "512",
                ddim_steps: 20,
                scale: 9,
              }
            }
          );
          
          const resultUrl = Array.isArray(output) ? output[0] : output;
          return JSON.stringify({ resultUrl });
        } catch (error) {
          console.error("Replicate error:", error);
          return "Failed to generate visual mockup.";
        }
      },
    }),
  }
});
