import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const SITE = "https://www.datavizstyleguide.com";

// Pages that must never appear in the sitemap: the isolated scratch page and the
// redirect stubs that only bounce to a canonical route.
const SITEMAP_EXCLUDE = [
  `${SITE}/text-texture-test/`,
  `${SITE}/videos/`,
  `${SITE}/highlights/`
];

export default defineConfig({
  site: SITE,
  output: "static",
  compressHTML: true,
  devToolbar: {
    enabled: false
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !SITEMAP_EXCLUDE.includes(page) && !page.startsWith(`${SITE}/highlights/`)
    })
  ]
});
