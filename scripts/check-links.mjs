import { access } from "node:fs/promises";

const INTERNAL_ROUTE_FILES = [
  "dist/index.html",
  "dist/about/index.html",
  "dist/tips/index.html",
  "dist/resources/index.html",
  "dist/examples/index.html",
  "dist/contribute/index.html"
];

const KEY_EXTERNAL_URLS = [
  "https://www.datavizstyleguide.com/",
  "https://fonts.googleapis.com/",
  "https://fonts.gstatic.com/",
  "https://challenges.cloudflare.com/"
];

const EXTERNAL_SUCCESS = new Set([200, 204, 301, 302, 307, 308, 403, 404]);

const checkInternalRoutes = async () => {
  const missing = [];

  for (const path of INTERNAL_ROUTE_FILES) {
    try {
      await access(path);
    } catch {
      missing.push(path);
    }
  }

  if (missing.length > 0) {
    console.error("Missing built route files:", missing.join(", "));
    process.exit(1);
  }
};

const checkExternalUrl = async (url) => {
  const methodChain = ["HEAD", "GET"];

  for (const method of methodChain) {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow"
      });

      if (EXTERNAL_SUCCESS.has(response.status)) {
        return;
      }
    } catch {
      // Continue and try next method.
    }
  }

  throw new Error(`Unable to verify external URL: ${url}`);
};

const checkExternalUrls = async () => {
  for (const url of KEY_EXTERNAL_URLS) {
    await checkExternalUrl(url);
  }
};

await checkInternalRoutes();
await checkExternalUrls();

console.log("Link checks passed.");
