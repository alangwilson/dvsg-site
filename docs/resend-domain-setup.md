# Resend sending-domain setup (contact form)

The `/api/contact` function sends submission emails through **Resend**. Until a sending domain
is verified, delivery either fails or is stuck on the shared `onboarding@resend.dev` sender
(which must **not** ship to production). Do this before cutover Go/No-Go.

## 1. Add the domain in Resend

1. Resend dashboard → **Domains** → **Add Domain**.
2. Enter the domain you'll send from — recommended: a subdomain like `send.datavizstyleguide.com`
   (keeps mail DNS separate from the apex). Resend also accepts the apex `datavizstyleguide.com`.

## 2. Add the DNS records Resend gives you

Resend shows a set of records — typically:

| Type | Host (example) | Purpose |
|---|---|---|
| `MX` | `send.datavizstyleguide.com` | return-path / bounce handling |
| `TXT` (SPF) | `send.datavizstyleguide.com` | `v=spf1 include:amazonses.com ~all` |
| `TXT` (DKIM) | `resend._domainkey.datavizstyleguide.com` | message signing |
| `TXT` (DMARC, optional) | `_dmarc.datavizstyleguide.com` | `v=DMARC1; p=none;` to start |

> **Add these where DNS will be authoritative _after_ cutover.** If you're moving DNS to Vercel
> (or a registrar) during this migration, add the Resend records in that same zone so you don't
> have to redo them. If DNS stays where it is now, add them there.

Copy the exact values from the Resend UI — the table above is illustrative.

## 3. Verify

Back in Resend → **Domains**, click **Verify** once the records propagate (minutes to a few
hours). Status flips to **Verified**.

## 4. Wire up the env vars (Vercel → Settings → Environment Variables)

- `RESEND_API_KEY` — create under Resend → **API Keys** (scope: sending).
- `CONTACT_FROM_EMAIL` — a verified address on the domain, e.g.
  `DataViz Style Guide <hello@send.datavizstyleguide.com>`.
- `CONTACT_TO_EMAIL` — where submissions should land.

Set these for **Production** (and Preview, for testing). Redeploy after changing them.

## 5. Test

Submit the contact form from `/about/` and `/contribute/` on the Vercel preview; confirm the
message arrives at `CONTACT_TO_EMAIL` and that the `From:` is your verified domain, not
`onboarding@resend.dev`.
