import { access, readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";

const INTERNAL_ROUTE_FILES = [
  "dist/index.html",
  "dist/about/index.html",
  "dist/tips/index.html",
  "dist/resources/index.html",
  "dist/examples/index.html",
  "dist/contribute/index.html"
];

const SITE_ORIGIN = "https://www.datavizstyleguide.com";

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

export const checkExternalUrl = async (url, fetchUrl = fetch) => {
  const methodChain = ["HEAD", "GET"];
  const failures = [];

  for (const method of methodChain) {
    try {
      const response = await fetchUrl(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(15000)
      });
      await response.body?.cancel();

      if (response.ok) {
        return;
      }
      failures.push(`${method}: HTTP ${response.status}`);
    } catch (error) {
      failures.push(`${method}: ${error.message}`);
    }
  }

  throw new Error(`Unable to verify external URL: ${url} (${failures.join("; ")})`);
};

export const readResourceLinks = async (dist = "dist", slugs = []) => {
  const directory = join(dist, "resources");
  const entries = await readdir(directory, { withFileTypes: true });
  const selected = entries.filter((entry) => entry.isDirectory() &&
    (slugs.length === 0 || slugs.includes(entry.name)));
  for (const slug of slugs) {
    if (!selected.some((entry) => entry.name === slug)) {
      throw new Error(`Missing built resource: ${slug}`);
    }
  }
  const links = [];
  for (const entry of selected) {
    const html = await readFile(join(directory, entry.name, "index.html"), "utf8");
    const match = html.match(/<a\b[^>]*href="([^"]+)"[^>]*>\s*Visit original source\s*<\/a>/);
    if (match) {
      links.push({ slug: entry.name, url: match[1].replaceAll("&amp;", "&") });
    } else if (slugs.includes(entry.name)) {
      throw new Error(`Missing original source link: ${entry.name}`);
    }
  }
  return links;
};

export const checkSourceUrl = async (url, dist = "dist", fetchUrl = fetch) => {
  const parsed = new URL(url);
  if (parsed.origin === SITE_ORIGIN) {
    const path = decodeURIComponent(parsed.pathname);
    await access(join(dist, path, extname(path) ? "" : "index.html"));
    return;
  }
  await checkExternalUrl(url, fetchUrl);
};

const main = async () => {
  await checkInternalRoutes();
  const links = await readResourceLinks("dist", process.argv.slice(2));
  const checked = new Map();
  let failures = 0;
  for (const { slug, url } of links) {
    if (!checked.has(url)) {
      checked.set(url, checkSourceUrl(url));
    }
    try {
      await checked.get(url);
      console.log(`OK ${slug}: ${url}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${slug}: ${error.message}`);
    }
  }
  if (failures > 0) {
    throw new Error(`${failures} resource source links failed. Blocked requests require manual review.`);
  }
  console.log(`Link checks passed (${links.length} resource source links).`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
