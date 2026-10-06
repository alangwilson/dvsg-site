import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const SITE = "https://www.datavizstyleguide.com";
const readLocations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const index = await readFile("dist/sitemap-index.xml", "utf8");
const sitemapUrls = readLocations(index);
assert.ok(sitemapUrls.length > 0, "Sitemap index must list a sitemap");
const pages = [];

for (const sitemapUrl of sitemapUrls) {
  const url = new URL(sitemapUrl);
  assert.equal(url.origin, SITE, "Sitemap must use the production origin");
  pages.push(...readLocations(await readFile(join("dist", url.pathname), "utf8")));
}

assert.equal(new Set(pages).size, pages.length, "Sitemap must not contain duplicate URLs");
for (const page of pages) {
  const url = new URL(page);
  assert.equal(url.origin, SITE, "Pages must use the canonical production origin");
  assert.ok(url.pathname.endsWith("/"), `Page must use a trailing slash: ${page}`);
  assert.ok(!url.search && !url.hash, `Page must not contain query or fragment: ${page}`);
  assert.ok(!["/contact/", "/videos/", "/text-texture-test/"].includes(url.pathname) &&
    !url.pathname.startsWith("/highlights/"), `Redirect or scratch page in sitemap: ${page}`);
  const html = await readFile(join("dist", url.pathname, "index.html"), "utf8");
  assert.ok(!/<meta\b[^>]*content="[^"]*noindex/i.test(html), `Noindex page in sitemap: ${page}`);
  assert.ok(html.includes(`<link rel="canonical" href="${page}"`), `Canonical mismatch: ${page}`);
}

for (const path of ["/", "/resources/", "/examples/", "/tips/", "/resources/checklist/",
  "/resources/getting-started/", "/resources/oth-06-core-dataviz-style-guide-components/",
  "/resources/oth-07-developing-annual-surveys/"]) {
  assert.ok(pages.includes(`${SITE}${path}`), `Missing important page: ${path}`);
}
const robots = await readFile("dist/robots.txt", "utf8");
assert.ok(robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`));
await access("dist/sitemap-index.xml");
console.log(`Sitemap checks passed (${pages.length} canonical, indexable pages).`);
