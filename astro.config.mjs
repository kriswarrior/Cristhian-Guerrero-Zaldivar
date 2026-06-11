import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kriswarrior.github.io",
  base: "/Cristhian-Guerrero-Zaldivar",
  output: "static",
  devToolbar: {
    enabled: false,
  },
  build: {
    format: "directory",
  },
});
