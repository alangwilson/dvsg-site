import { defineCollection, z } from "astro:content";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "URL must use https://");

const youtubeUrlSchema = httpsUrlSchema.refine((value) => {
  try {
    const host = new URL(value).hostname.replace(/^www\./i, "").toLowerCase();
    return host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be";
  } catch {
    return false;
  }
}, "URL must be a valid YouTube link.");

const editorialReviewSchema = z.object({
  factChecked: z.literal(true),
  linkChecked: z.literal(true),
  styleChecked: z.literal(true),
  reviewedBy: z.string().trim().min(2),
  reviewedAt: z.coerce.date()
});

const highlights = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().trim().min(8),
    date: z.coerce.date(),
    author: z.string().regex(slugPattern, "Author ID must use lowercase-hyphen format."),
    excerpt: z.string().trim().min(24),
    coverImage: z.string().optional(),
    youtubeUrl: youtubeUrlSchema.optional(),
    tags: z
      .array(z.string().trim().regex(slugPattern, "Tags must be lowercase-hyphen."))
      .default([]),
    sourceLinks: z
      .array(
        z.object({
          label: z.string().trim().min(2),
          url: httpsUrlSchema
        })
      )
      .optional(),
    editorialReview: editorialReviewSchema
  })
});

const resources = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().trim().min(3),
    type: z.enum(["article", "video", "tool", "example"]),
    homeCategory: z.enum(["examples", "videos", "other"]).default("other"),
    url: httpsUrlSchema,
    youtubeUrl: youtubeUrlSchema.optional(),
    summary: z.string().trim().min(12),
    source: z.string().trim().min(2),
    byline: z.string().trim().min(2),
    image: z.string().optional(),
    editorialReview: editorialReviewSchema
  })
});

// First-party, on-site guide pages (e.g. the DataViz Style Guide Checklist and the
// "Guide to Making a Data Viz Style Guide"). Unlike `resources`, these host their own
// content and do not link out, so no external `url`/`source` is required.
const guides = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().trim().min(3),
    summary: z.string().trim().min(12),
    byline: z.string().trim().min(2).optional(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    // Optional metadata for the /resources index table. Independent of the page header
    // (which uses `byline`), so a guide can list an author here without showing one on the page.
    listing: z
      .object({
        source: z.string().trim().min(2),
        author: z.string().trim().min(2),
        type: z.enum(["article", "video", "tool", "example"]).default("article")
      })
      .optional()
  })
});

const authors = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string().trim().min(2),
    authorId: z.string().regex(slugPattern, "Author ID must use lowercase-hyphen format."),
    role: z.string().trim().min(2).optional(),
    shortBio: z.string().trim().min(10).optional(),
    longBio: z.string().trim().min(10).optional(),
    bio: z.string().trim().min(10).optional(),
    linkedin: httpsUrlSchema.optional(),
    headshot: z.string().optional()
  })
});

const pages = defineCollection({
  type: "content",
  schema: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("home"),
      heroIntro: z.string().trim().min(24),
      gettingStartedHeading: z.string().trim().min(3),
      gettingStartedItems: z
        .array(
          z.object({
            number: z.string().trim().min(2),
            title: z.string().trim().min(3),
            body: z.string().trim().min(8)
          })
        )
        .length(4),
      gettingStartedCtaLabel: z.string().trim().min(3),
      examplesHeading: z.string().trim().min(3),
      examplesCtaLabel: z.string().trim().min(3),
      videosHeading: z.string().trim().min(3),
      videosCtaLabel: z.string().trim().min(3),
      otherResourcesHeading: z.string().trim().min(3),
      otherResourcesCtaLabel: z.string().trim().min(3),
      whoWeAreHeading: z.string().trim().min(3),
      contributeLabel: z.string().trim().min(3),
      footerPrompt: z.string().trim().min(12)
    }),
    z.object({
      kind: z.literal("contact"),
      heading: z.string().trim().min(6)
    })
  ])
});

export const collections = {
  highlights,
  resources,
  guides,
  authors,
  pages
};
