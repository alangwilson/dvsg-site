# DVSG Site Scaffold

This is an offline scaffold for the DataViz Style Guide redesign.

## Stack

- Astro (static site)
- Content collections for Highlights, Resources, Authors, and singleton Pages

## Run locally

```bash
npm install
npm run dev
```

To test the contact API locally:

```bash
npm run dev:vercel
```

## Build

```bash
npm run build
```

## Quality checks

```bash
npm run check:links
npm run check:security
```

## Contact Form Setup

The `/about/#contact-form` form posts to a Vercel serverless function at `/api/contact`.

1. Copy `.env.example` to `.env.local`.
2. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL`.
3. Optional: set Turnstile keys (`PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) for captcha.
4. Optional: set `ALLOWED_ORIGINS` if you need additional preview/staging origins.
5. Add the same variables in Vercel project settings for production.

If Turnstile keys are omitted, the form still uses honeypot + timing + rate limiting.

## Content workflow

- All site content is stored in markdown under `src/content/**`.
- Edit frontmatter/body directly in this repo, then run `npm run build` to validate.
- Uploaded media lives in `public/images/uploads`.
- Editorial standards are documented in `docs/content-operations.md`.

## Operations checklists

- Release checklist: `docs/release-checklist.md`
- Security and performance checklist: `docs/security-performance-checklist.md`

## Figma source

- File: `DVSG-Website`
- Target page: `FINAL MOCKS`
- Frame URL: `https://www.figma.com/design/kxDO03rv3VGfIG9tVfn4ap/DVSG-Website?node-id=97-342&t=TgGsEGiJZMVxiSgC-1`

Use `docs/figma-implementation-checklist.md` to map frame nodes to code routes/components.
