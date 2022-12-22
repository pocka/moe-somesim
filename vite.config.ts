import { defineConfig } from "vite";
import elmPlugin from "vite-plugin-elm";

export default defineConfig({
  root: new URL("./src", import.meta.url).pathname,
  publicDir: new URL("./data", import.meta.url).pathname,
  server: {
    port: 3000,
  },
  plugins: [elmPlugin()],
});
