# Content Operations Guide

This file defines the editorial and migration standards used by this repository's markdown content workflow.

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
