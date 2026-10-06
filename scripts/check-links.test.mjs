import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkExternalUrl, checkSourceUrl, readResourceLinks } from "./check-links.mjs";

test("accepts successful requests and follows redirects", async () => {
  await checkExternalUrl("https://example.com/article/", async (_, options) => {
    assert.equal(options.method, "HEAD");
    assert.equal(options.redirect, "follow");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(null, { status: 200 });
  });
});

test("falls back to GET when HEAD is unsupported or blocked", async () => {
  const methods = [];
  await checkExternalUrl("https://example.com/article/", async (_, { method }) => {
    methods.push(method);
    return new Response(null, { status: method === "HEAD" ? 403 : 200 });
  });
  assert.deepEqual(methods, ["HEAD", "GET"]);
});

test("reports broken, blocked, and server-error destinations", async () => {
  for (const status of [404, 403, 500]) {
    await assert.rejects(
      checkExternalUrl("https://example.com/article/", async () =>
        new Response(null, { status })),
      new RegExp(`HEAD: HTTP ${status}; GET: HTTP ${status}`)
    );
  }
});

test("reports network failures after trying both methods", async () => {
  await assert.rejects(
    checkExternalUrl("https://example.com/article/", async () => {
      throw new Error("network unavailable");
    }),
    /HEAD: network unavailable; GET: network unavailable/
  );
});

test("reads resource links and checks same-site destinations against the build", async () => {
  const dist = await mkdtemp(join(tmpdir(), "dvsg-links-"));
  try {
    await mkdir(join(dist, "resources", "article"), { recursive: true });
    await mkdir(join(dist, "resources", "guide"), { recursive: true });
    await mkdir(join(dist, "tips", "chart-library"), { recursive: true });
    await writeFile(join(dist, "tips", "chart-library", "index.html"), "<h1>Chart library</h1>");
    await writeFile(join(dist, "resources", "article", "index.html"),
      '<a class="dv-button" href="https://example.com/?a=1&amp;b=2" target="_blank"> Visit original source </a>');
    await writeFile(join(dist, "resources", "guide", "index.html"), "<h1>On-site guide</h1>");
    assert.deepEqual(await readResourceLinks(dist), [
      { slug: "article", url: "https://example.com/?a=1&b=2" }
    ]);
    assert.equal((await readResourceLinks(dist, ["article"])).length, 1);
    await assert.rejects(readResourceLinks(dist, ["missing"]), /Missing built resource/);
    await assert.rejects(readResourceLinks(dist, ["guide"]), /Missing original source link/);
    await checkSourceUrl("https://www.datavizstyleguide.com/tips/chart-library/", dist, () => {
      assert.fail("Same-site destinations should not make network requests");
    });
    await checkSourceUrl("https://www.datavizstyleguide.com/tips/chart-library", dist);
    await mkdir(join(dist, "tips", "empty"), { recursive: true });
    await assert.rejects(checkSourceUrl("https://www.datavizstyleguide.com/tips/empty", dist), /ENOENT/);
    await assert.rejects(checkSourceUrl("https://www.datavizstyleguide.com/tips/missing/", dist), /ENOENT/);
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});
