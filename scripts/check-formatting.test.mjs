import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Getting Started links to the guide and checklist rather than tips", async () => {
  const home = await readFile("dist/index.html", "utf8");
  const section = home.split('aria-label="Getting started"')[1].split("</section>")[0];
  assert.ok(section.includes('href="/resources/getting-started/"'));
  assert.ok(section.includes('href="/resources/checklist/"'));
  assert.ok(!section.includes('href="/tips/"'));
});

test("Checklist is clearly named in both resource listings and guides link to one another", async () => {
  const resources = await readFile("dist/resources/index.html", "utf8");
  assert.equal(resources.split("Data Visualization Style Guide Checklist").length - 1, 2);
  for (const [id, relatedId] of [["checklist", "getting-started"], ["getting-started", "checklist"]]) {
    const guide = await readFile(`dist/resources/${id}/index.html`, "utf8");
    assert.ok(guide.includes(`href="/resources/${relatedId}/"`));
  }
});

test("Source and author link text has no leading or trailing whitespace", async () => {
  for (const path of ["index.html", "about/index.html", "examples/index.html", "tips/index.html",
    "resources/index.html", "tips/chart-smarter-with-a-chart-library/index.html"]) {
    const html = await readFile(`dist/${path}`, "utf8");
    for (const [, label] of html.matchAll(/<a\b[^>]*href="https:[^"]*"[^>]*>([^<]+)<\/a>/g)) {
      assert.equal(label, label.trim(), `Whitespace in ${path}: ${label}`);
    }
  }
});
