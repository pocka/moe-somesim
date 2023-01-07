import { defineConfig } from "vite";
import elmPlugin from "vite-plugin-elm";

import pkg from "./package.json";

function normalizePackageJsonPerson(
  person: string | { name: string; email?: string | null; url?: string | null }
): { name: string; email: string | null; url: string | null } {
  if (typeof person === "string") {
    return { name: person, email: null, url: null };
  }

  return {
    name: person.name,
    email: person.email || null,
    url: person.url || null,
  };
}

export default defineConfig({
  root: new URL("./src", import.meta.url).pathname,
  publicDir: new URL("./data", import.meta.url).pathname,
  build: {
    outDir: new URL("./dist", import.meta.url).pathname,
  },
  server: {
    port: 3000,
  },
  plugins: [elmPlugin()],
  define: {
    __AUTHORS__: JSON.stringify(
      [pkg.author, ...pkg.contributors].map(normalizePackageJsonPerson)
    ),
    __BUG_REPORT_URL__: JSON.stringify(pkg.bugs.url),
    __REPOSITORY_URL__: JSON.stringify(pkg.repository.url),
    __MANUAL_URL__: JSON.stringify(pkg.config.manual.url),
    __VERSION__: JSON.stringify(pkg.version),
  },
});
