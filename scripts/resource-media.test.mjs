import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const readResourcePage = (slug) =>
  readFile(new URL(`../dist/resources/${slug}/index.html`, import.meta.url), "utf8");

// Verified against the legacy Squarespace homepage and resources page.
const videos = [
  ["vid-01-fireside-chat", "o7DtZbsZdks", "Fireside Chat: Data Viz Style Guides"],
  ["vid-02-more-than-style-guide", "UqXqO4zx34s", "More than a Style Guide: Data Visualization for Design Systems"],
  ["vid-03-brand-colors-for-guidelines", "SkATiaTJXFU", "Why Data Viz Needs a Style Guide"],
  ["vid-04-why-org-needs-style-guide", "QTvFaNyQOKk", "Why Your Organization Needs a Data Visualization Style Guide"],
  ["vid-05-create-brand-color-guidelines", "6iyUJiZHGug", "15 Style Guide Tips in 20 Minutes"]
];

for (const [slug, id, title] of videos) {
  test(`${slug} embeds the legacy video without an unrelated thumbnail`, async () => {
    const html = await readResourcePage(slug);
    assert.ok(html.includes(`<h1>${title}</h1>`));
    if (slug === "vid-02-more-than-style-guide") {
      assert.ok(html.includes(`src="https://www.youtube.com/embed/${id}?rel=0&amp;start=1116"`));
      assert.ok(html.includes(`href="https://www.youtube.com/live/${id}?si=RehyNb__ewTlW0F4&amp;t=1116"`));
    } else {
      assert.ok(html.includes(`src="https://www.youtube.com/embed/${id}?rel=0"`));
      assert.ok(html.includes(`href="https://www.youtube.com/watch?v=${id}"`));
    }
    assert.equal((html.match(/<iframe\b/g) ?? []).length, 1);
    assert.doesNotMatch(html, /<aside\b/);
    assert.doesNotMatch(html, /\/images\/uploads\/resources\/article-/);
  });
}

const articles = [
  ["oth-01-what-are-guidelines", "article-what-are-guidelines.png"],
  ["oth-02-detailed-guide-colors", "article-detailed-guide-colors.png"],
  ["oth-03-create-brand-colors-guide", "article-brand-colors.png"],
  ["chart-book", "article-why-organization-needs.png"],
  ["oth-06-core-dataviz-style-guide-components", "article-core-components.webp"],
  ["oth-07-developing-annual-surveys", "article-annual-surveys.webp"]
];

for (const [slug, image] of articles) {
  test(`${slug} uses its own legacy article image`, async () => {
    const html = await readResourcePage(slug);
    assert.ok(html.includes(`src="/images/uploads/resources/${image}"`));
    assert.equal((html.match(/<aside\b/g) ?? []).length, 1);
    assert.doesNotMatch(html, /<iframe\b/);
    const asset = await stat(new URL(`../public/images/uploads/resources/${image}`, import.meta.url));
    assert.ok(asset.size > 0);
  });
}

test("resources without an image do not inherit another article's thumbnail", async () => {
  const html = await readResourcePage("oth-05-community-resources");
  assert.ok(html.includes('href="https://datavisualizationsociety.org/resource-library/"'));
  assert.doesNotMatch(html, /<aside\b/);
  assert.doesNotMatch(html, /\/images\/uploads\/resources\/article-/);
});
