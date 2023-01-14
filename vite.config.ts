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

function resolve(path: string): string {
  return new URL(path, import.meta.url).pathname;
}

export default defineConfig({
  root: resolve("./src"),
  publicDir: resolve("./data"),
  build: {
    target: "es2022",
    outDir: resolve("./dist"),
    rollupOptions: {
      input: {
        main: resolve("./src/index.html"),
        imageConcat: resolve("./src/image-concat/index.html"),
        builder: resolve("./src/builder/index.html"),
      },
    },
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
