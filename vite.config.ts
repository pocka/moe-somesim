import { defineConfig } from "vite"

export default defineConfig({
  root: new URL("./src", import.meta.url).pathname,
  publicDir: new URL("./publiic", import.meta.url).pathname,
  server: {
    port: 3000
  }
})