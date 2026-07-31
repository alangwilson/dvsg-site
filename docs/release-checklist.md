# Release Checklist

## Before deploy

1. Run `npm ci`.
2. Run `npm run build`.
3. Run `npm run check:links`.
4. Run `npm run check:security`.
5. Validate core routes locally: `/`, `/tips/`, `/resources/`, `/examples/`, `/about/`, `/contribute/`.

## Environment and integrations

1. Confirm Vercel environment variables are present:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL` (optional)
   - `CONTACT_SUBJECT_PREFIX` (optional)
   - `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` (optional but recommended)
   - `ALLOWED_ORIGINS` (optional; include staging domains when needed)
2. Submit one test message from `/about/` and one from `/contribute/`.

## Post-deploy verification

1. Confirm `/admin` returns 404.
2. Confirm security headers are present on live pages.
3. Confirm embedded YouTube content renders on tips/resources detail pages.
4. Confirm mobile nav, footer links, and contact/contribute forms all function on production.
