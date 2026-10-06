# Release Checklist

## Before deploy

1. Run `npm ci`.
2. Run `npm run build`.
3. Run `npm run check:links`.
4. Run `npm run check:security`.
5. Validate core routes locally: `/`, `/tips/`, `/resources/`, `/examples/`, `/about/`, `/contribute/`.
6. Run `npm run check:sitemap` and `node --test scripts/*.test.mjs`.

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

## Google indexing after a release

1. Confirm the live `/robots.txt` references
   `https://www.datavizstyleguide.com/sitemap-index.xml`, and both that index and
   `/sitemap-0.xml` return HTTP 200.
2. In Google Search Console, select the verified `datavizstyleguide.com` domain
   property or the `https://www.datavizstyleguide.com/` URL-prefix property.
   Domain verification requires a DNS TXT record only if the property is not
   already verified; do not change nameservers or remove unrelated DNS records.
3. Open **Sitemaps**, submit `https://www.datavizstyleguide.com/sitemap-index.xml`,
   and confirm Google reports success. Record the submission date and status.
4. Use **URL inspection** for the homepage, Resources, Checklist, and Getting
   Started pages. Request indexing for changed pages when available. Check a
   representative legacy redirect and confirm it resolves to the canonical page.
5. Monitor sitemap processing and Page indexing reports over the following days.
   Submission is not an immediate re-index or a request to remove old URLs.
   Keep permanent legacy redirects in place.
