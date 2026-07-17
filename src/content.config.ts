import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        slug: z.string(),
        access: z.enum(["free", "preview", "premium"]),
        summary: z.string(),
        category: z.string(),
        last_verified_at: z.union([z.string(), z.date()]),
      }),
    }),
  }),
};
