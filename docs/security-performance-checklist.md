# Security and Performance Checklist

## Security baseline

1. Keep Astro and lockfile current (`npm audit` clean at high severity and above).
2. Confirm Vercel headers remain enabled in `vercel.json`:
   - HSTS
   - CSP
   - X-Content-Type-Options
   - Referrer-Policy
   - Permissions-Policy
   - X-Frame-Options
3. Verify contact API protection still passes:
   - Origin/Referer allowlist
   - JSON content-type enforcement
   - Honeypot + timing checks
   - Rate limiting
   - Turnstile validation when enabled

## Performance baseline

1. Keep Google Fonts loaded via `<link rel="preconnect">` and stylesheet tags in `BaseLayout`.
2. Preserve explicit `width`/`height` on key images to reduce layout shift.
3. Keep static asset caching headers active for `/_astro/*` and `/images/*`.
4. Compress new texture/image uploads before commit (prefer WebP for large photos where possible).

## Ongoing maintenance

1. Review Dependabot PRs monthly.
2. Keep CI green on build, link checks, and security audit jobs.
3. Re-run smoke tests on key pages whenever changing:
   - `src/styles/base.css`
   - `api/contact.js`
   - `src/pages/about.astro`
   - `src/pages/contribute.astro`
