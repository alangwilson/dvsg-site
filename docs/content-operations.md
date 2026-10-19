# Content Operations Guide

This file defines the editorial and migration standards used by this repository's markdown content workflow.

Collections use Astro's Content Layer glob loaders. Entry IDs honor existing
frontmatter slugs; pages use `entry.id` for URLs and `render(entry)` for markdown.
Existing content filenames and public routes remain unchanged.

## Editorial QA Gate

All `highlights` and `resources` entries must include `editorialReview` with:

- `factChecked: true`
- `linkChecked: true`
- `styleChecked: true`
- `reviewedBy` (name or initials)
- `reviewedAt` (date)

Build validation in `src/content.config.ts` enforces these values.

## Formatting Conventions

- Author IDs and tags must use lowercase-hyphen format (`alan-wilson`, `chart-library`)
- External URLs must use `https://`
- Highlights should include a short excerpt suitable for list cards
- Resources must include `summary`, `source`, and `byline`

## Migration Notes

Content has been normalized to match current schema:

- Added `editorialReview` to all existing highlights and resources
- Aligned inconsistent byline names (`Jon` -> `Jonathan`, `Max` -> `Maxene`)
- Aligned highlight date metadata with filename conventions

When importing new content, match these standards before publishing.

## Resource Link Checks

After `npm run build`, run `npm run check:links` to verify core routes and
the "Visit original source" destinations on all built resource detail pages.
To check only edited entries, pass their slugs:

```bash
npm run check:links -- oth-04-data-viz-guides oth-06-core-dataviz-style-guide-components oth-07-developing-annual-surveys
```

Same-site destinations are checked against the local build. External destinations
must return a successful response after redirects; HEAD requests fall back to GET,
with a 15-second timeout per request. Broken links, blocked requests (including
403), and network errors fail the check and include diagnostics. Review blocked
links manually rather than treating them as verified.

Automated checks cannot establish whether a working URL is the correct article.
Before updating editorial-review metadata, confirm the destination's title,
author, publisher, and relevance to the resource summary. Use direct article URLs,
not publisher homepages or email tracking links.

Run the link-checker's regression tests with `node --test scripts/check-links.test.mjs`.

## Resource Media Provenance

The retained legacy site is <https://heron-platinum-895d.squarespace.com/>.
Compare both its homepage and `/resources` when migrating media: the homepage
includes the Outlier 2025 video and additional article thumbnails.

The five video URLs in the initial repository commit were unrelated placeholders,
not valid imports. Restored on October 18, 2026 using the legacy embeds and YouTube
metadata:

| Resource | YouTube ID |
| --- | --- |
| Fireside Chat: Data Viz Style Guides | `o7DtZbsZdks` |
| More than a Style Guide: Data Visualization for Design Systems | `UqXqO4zx34s` |
| Why Data Viz Needs a Style Guide | `SkATiaTJXFU` |
| Why Your Organization Needs a Data Visualization Style Guide | `QTvFaNyQOKk` |
| 15 Style Guide Tips in 20 Minutes (Outlier 2025) | `6iyUJiZHGug` |

Keep existing resource filenames/routes stable, including the two `brand-colors`
video slugs whose titles were corrected. Alan Wilson's talk is within the
VisInPractice invited-talks recording, as confirmed by its YouTube description.
Its source link and embedded player start at 1,116 seconds (18:36), as supplied
by Alan. The DVS community resource points to `/resource-library/`, not the
outdated `/resources` destination.

The four existing article image files match the legacy images' decoded pixels;
they were not overwritten. The two missing images were restored from the legacy
homepage into `public/images/uploads/resources/` as lossless WebP files:

- `article-core-components.webp`: Squarespace asset
  `2d85cfdf-f8e3-4c12-8ebb-764e71cd1280/Core+Dataviz+Style+Guide+Comonents`
- `article-annual-surveys.webp`: Squarespace asset
  `57de6b21-fb4f-47c0-858d-01810e8bcee0/Data+Viz+Style+Guide+Survey`

These assets are under
`https://images.squarespace-cdn.com/content/v1/61744f7442c1fd05ceb7cb8d/`.
The previously orphaned `article-what-are-guidelines.png` belongs only to
Amy Cesal's "What Are Data Visualization Style Guidelines?" article, restored at
`/resources/oth-01-what-are-guidelines/`.

Only display a resource's explicitly assigned image; do not use an unrelated
article image as a fallback. Video pages use the correct YouTube player's own
thumbnail. For article links, retain the legacy direct destination rather than a
publisher homepage.

After building, run `node --test scripts/resource-media.test.mjs` to check the
restored video mappings, article images, and absence of unrelated fallback images.
