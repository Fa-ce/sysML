import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: /^@antv\/x6$/,
        replacement: fileURLToPath(
          new URL("./node_modules/@antv/x6/es/index.js", import.meta.url),
        ),
      },
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
