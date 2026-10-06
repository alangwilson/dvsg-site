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
