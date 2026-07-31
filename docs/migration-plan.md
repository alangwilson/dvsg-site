# DVSG Site Migration Plan

Cutover of the **DataViz Style Guide** from the existing **Squarespace** site to this Astro
build on **Vercel**, keeping the live domain **www.datavizstyleguide.com**.

This is a living runbook and complements `docs/release-checklist.md` and
`docs/security-performance-checklist.md` — run those as the operational gates at deploy time.

## Roles & scope

- **Cutover owner / decision-maker:** Alan Wilson.
- **Backup decision-maker:** Amy Cesal.
- **Content freeze:** not required. The site is static and no new content is planned for the
  cutover; content is versioned in the repo under `src/content/**`.
- **Production host:** Vercel. Plan is to validate on the Vercel preview URL, then attach
  `www.datavizstyleguide.com` (+ apex) to the same Vercel project. The contact form
  (`/api/contact`) and the redirects in `vercel.json` are Vercel features and only work if
  production is served from Vercel.

## Site facts

- Astro `^5.18`, `output: "static"`, `site: https://www.datavizstyleguide.com`.
- Node `>=20.11 <23`.
- One serverless function: `/api/contact` → Resend email, optional Cloudflare Turnstile,
  honeypot + timing + rate limit (5/min) + Origin/Referer allowlist.
- Secrets: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`,
  `CONTACT_SUBJECT_PREFIX`, `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`,
  `ALLOWED_ORIGINS`.
- Canonical routes: `/`, `/about/`, `/contact/`, `/contribute/`, `/examples/`,
  `/resources/` + `/resources/{slug}/`, `/tips/` + `/tips/{slug}/`.
  Note: `/highlights/` and `/highlights/{slug}` **301 to `/tips/`**, and `/videos/`
  redirects to `/resources/` — so `/tips/` is the canonical home for highlight/tip posts.

## Already done in this repo

- **Tip URLs are now title-based.** Each file in `src/content/highlights/` has a `slug:`
  frontmatter key derived from its title; all routes/links read `entry.slug`, so this drives
  the canonical page, the listing links, and the `/highlights → /tips` redirect.
  - Two posts share the title "Chart Smarter with a Chart Library"; the earlier (Nov 2024)
    keeps `chart-smarter-with-a-chart-library`, the later (Oct 2025) uses
    `chart-smarter-with-a-chart-library-2`. Rename a title + its `slug:` to remove the `-2`.
- **Redirect map from the old Squarespace URLs is implemented** in `vercel.json`
  (`redirects[]`), pointing each old `/highlights/<old-slug>` at the new title-based
  `/tips/<slug>/`, plus `/cart → /`. Vercel emits these as 308 (permanent; SEO-equivalent
  to 301).

## Open decisions (needed before final cutover)

Both resolved as **first-party on-site pages** and scaffolded in the repo. A new `guides`
content collection (`src/content.config.ts`) hosts self-contained pages (no external `url`
required), rendered by `src/components/GuidePage.astro` via two routes:

- **`/checklist`** → 301 → **`/resources/checklist/`** ("DataViz Style Guide Checklist").
  ✅ **Live.** Content ported from the old Squarespace page and rendered as a hierarchical
  **tree** (`src/components/ChecklistTree.astro`, data in `src/pages/resources/checklist.astro`,
  metadata in `src/content/guides/checklist.md`, `draft: false`). Indexable + in the sitemap.
- **`/getting-started`** → 301 → **`/resources/getting-started/`** ("Guide to Making a Data Viz
  Style Guide"). ✅ **Live.** Long-form article ported from the old Squarespace page as markdown
  (`src/content/guides/getting-started.md`, `draft: false`), rendered in the tips prose style
  via `GuidePage` (no author, no images), content column widened (66% desktop / 75% tablet /
  full mobile — the `wide` prop). Indexable + in the sitemap.

Both redirects are in `vercel.json`; both routes build and their targets resolve. Nothing in
`SITEMAP_EXCLUDE` is guide-related anymore.

Both guides are also listed in the **/resources index table** via optional `listing` metadata
in their frontmatter (`source`, `author`, `type`) — kept separate from `byline` so the author
shows in the table but not on the page header. Source: "Data Visualization Style Guides";
author: "Maxene Graze, Alan Wilson, Jonathan Schwabish, and Amy Cesal"; type: article. The
checklist's display title was set to Title Case ("What to Consider When Creating a Data
Visualization Style Guide") for table consistency — this drives its page h1 too. (Also fixed an
unrelated byline typo in `vid-01-fireside-chat.md`: "Minerva Graze" → "Maxene Graze".)

> **Small editorial note (getting-started):** a few obvious source typos were corrected on
> import — "east-to-remember" → "easy-to-remember", a doubled "This is will have" → "This will
> have", "medims" → "mediums", "Hexidecimal" → "hexadecimal", and a missing sentence-final
> period. A handful of resource links had stray `#` fragments cleaned and Adobe Color points at
> its canonical (non-locale) URL. Revert any of these if strict source fidelity is preferred.

> **Shared CSS fix:** the tip-body opening drop-cap rule
> (`.tip-detail-body.prose p:first-child::first-letter`) was over-matching the `<p>` inside
> loose list items, giving every numbered/bulleted item a giant leading capital. Narrowed to a
> direct child (`> p:first-child`) in `src/styles/base.css` — tips keep their opening drop-cap;
> list items no longer get one.

## Phase 1 — Safety net

- [ ] Back up the current Squarespace site content and **export its DNS zone** to a file.
- [ ] Record the current live target (old host) as the rollback destination.
- [ ] Record the current known-good Vercel production deployment (for Instant Rollback).
- [ ] Tag the repo at the intended release commit.
- [ ] **Lower DNS TTL to 300s** at least 24–48h before cutover.
- [ ] Confirm registrar / DNS access.

## Phase 2 — Build & validate on a Vercel preview

- [x] `npm ci && npm run build`; build + `check:links` green. `check:security` reduced from 8
      to 3 vulns via `npm audit fix`; remaining (`sharp`/`esbuild`, high) are build-time only
      and not in the static prod artifact — they only clear via a breaking `astro@7` upgrade.
      Decide: schedule that upgrade, or accept + relax the gate for build-time-only advisories.
- [x] **Verify slugs:** `dist/tips/` folder names match the title-based URLs; all 16
      `vercel.json` redirect targets resolve to a built page (verified programmatically).
- [ ] Set all env vars in Vercel (Preview + Production).
- [ ] Set `ALLOWED_ORIGINS` to include the production domain and the preview origin.
- [ ] **Resend: verify the sending domain** (SPF/DKIM/DMARC); do not ship the
      `onboarding@resend.dev` sender to production.
- [ ] Configure Turnstile keys (recommended).
- [x] **Remove or noindex** `src/pages/text-texture-test.astro`. Done: wrapped in a full doc
      with `<meta name="robots" content="noindex, nofollow">` and `Disallow`ed in `robots.txt`.
- [x] Confirm a **sitemap** is produced and referenced. Done: `@astrojs/sitemap` wired in
      `astro.config.mjs`; emits `sitemap-index.xml` (+ `sitemap-0.xml`, 32 URLs); scratch page
      and redirect stubs (`/videos/`, `/highlights/*`) filtered out; `public/robots.txt` added
      pointing at `sitemap-index.xml`.
- [x] Capture the **complete old URL inventory** and diff against `vercel.json`. Done via the
      live Squarespace `/sitemap.xml` (49 URLs). All 15 old `/highlights/<slug>` posts + the
      first-party tool pages were already covered. **Gaps found and fixed:** ~29
      `/highlights/tag/*` pages (would 404 — added catch-all `/highlights/tag/:slug*` → `/tips/`),
      the `/highlights` index (→ `/tips/`), and `/home` (→ `/`). `/resources`, `/contact` map to
      existing pages. `vercel.json` now has 21 redirects; a coverage script confirms every old
      path resolves to a redirect or a live page. (Re-run the crawl at cutover in case new posts
      were published on Squarespace since.)

## Phase 3 — Pre-cutover testing & Go/No-Go

- [ ] Crawl the redirect list on the preview; each old URL 308s to a live `/tips/...` page
      (not a 404 or a second redirect).
- [ ] Submit a test message from `/about/` and `/contribute/`; both land in
      `CONTACT_TO_EMAIL`; cross-origin post is rejected; rate limit works.
- [ ] Content parity across tips, resources, examples, authors; YouTube embeds play.
- [ ] Security headers present (HSTS, CSP, X-Content-Type-Options, Referrer-Policy,
      Permissions-Policy, X-Frame-Options); CSP blocks nothing needed.
- [ ] `/admin` and unknown routes return 404; `npm run check:links` clean.
- [ ] Perf & a11y within target; cross-browser/mobile nav, footer, forms.
- [ ] TLS will cover www + apex; apex↔www redirect correct.

**Go/No-Go:** owner (Alan; backup Amy) confirms Phase 1 safeguards restore and all Phase 3
priority items pass. Any unresolved priority item = No-Go.

## Phase 4 — Cutover

- [ ] Promote the validated build to Vercel production.
- [ ] Attach `www.datavizstyleguide.com` + apex to the Vercel project; confirm TLS.
- [ ] Smoke test live: homepage, 3–5 top pages, one redirected old URL, one contact
      submission, analytics ping.
- [ ] Submit the sitemap to Search Console.
- [ ] Leave the old Squarespace site intact and running.

## Phase 5 — Post-migration monitoring

- [ ] First 24–72h: 404/500 logs, redirect hits, `/api/contact` function logs, uptime,
      analytics shape.
- [ ] Following weeks: Search Console coverage, Core Web Vitals, broken-link reports.
- [ ] Triage: a live 404 usually means a missing redirect — add it to `vercel.json`.
- [ ] Decommission Squarespace only after ~30 days stable; keep backups longer.

## Rollback

Triggers (decide-in-advance): homepage/priority template down, widespread 404/500, TLS
failure, contact form failing with no quick fix, or content loss.

- **Primary — Vercel Instant Rollback:** promote the previous known-good deployment;
  reverts site + function in seconds, no DNS change.
- **Secondary — DNS repoint:** point the domain back to the old host using the exported zone;
  fast because TTL was lowered in Phase 1.
- **Authority:** Alan decides (Amy backup). If not healthy within an agreed N minutes of
  cutover, roll back rather than debug live.

## Site-specific risks

| Risk | Mitigation |
|---|---|
| Contact-form email silently fails | Verify Resend sending domain; set/test env vars on preview first |
| Origin allowlist blocks form | Ensure prod (+ any staging) origins in `ALLOWED_ORIGINS` |
| Scratch page ships | Remove/noindex `src/pages/text-texture-test.astro` |
| Missing sitemap slows re-indexing | Add `@astrojs/sitemap` or confirm source; submit at cutover |
| Production not on Vercel | Then `/api/contact` and `vercel.json` redirects won't run — port both to the chosen host |
| Unlinked old pages 404 | Complete the old-URL inventory and diff against `vercel.json` |
