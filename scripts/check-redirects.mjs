#!/usr/bin/env node
// Verify every vercel.json redirect against a deployed origin.
// Usage: node scripts/check-redirects.mjs https://<your-preview>.vercel.app
//
// For each redirect it requests the source path (no auto-follow) and checks:
//   - status is a permanent redirect (308, or 301)
//   - the Location resolves to the configured destination
// Wildcard sources (e.g. /highlights/tag/:slug*) are probed with a sample segment.
// Exits non-zero if any redirect is wrong, so it can gate Go/No-Go.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const base = process.argv[2];
if (!base) {
  console.error("Usage: node scripts/check-redirects.mjs <baseUrl>");
  process.exit(2);
}
const origin = base.replace(/\/$/, "");

const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, "..", "vercel.json"), "utf8"));

// Replace Vercel path params (:slug, :slug*) with a concrete sample segment.
const sampleSource = (source) => source.replace(/\/:[^/]+/g, "/Accessibility");

const normalize = (u) => {
  try {
    return new URL(u, origin).pathname;
  } catch {
    return u;
  }
};

let failures = 0;

for (const r of cfg.redirects) {
  const testPath = sampleSource(r.source);
  const url = origin + testPath;
  let line = `${testPath}  ->  ${r.destination}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const location = res.headers.get("location");
    const gotPath = location ? normalize(location) : null;
    const wantPath = normalize(r.destination);
    const okStatus = res.status === 308 || res.status === 301;
    const okTarget = gotPath === wantPath;
    if (okStatus && okTarget) {
      console.log(`  ok   ${res.status}  ${line}`);
    } else {
      failures += 1;
      console.log(`  FAIL ${res.status}  ${line}  (got Location: ${gotPath ?? "none"})`);
    }
  } catch (err) {
    failures += 1;
    console.log(`  ERR        ${line}  (${err.message})`);
  }
}

console.log(
  failures === 0
    ? `\nAll ${cfg.redirects.length} redirects OK against ${origin}`
    : `\n${failures} of ${cfg.redirects.length} redirects FAILED against ${origin}`
);
process.exit(failures === 0 ? 0 : 1);
