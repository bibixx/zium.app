import { defineConfig } from "vite";
import { JsonPlugin, ZipPlugin } from "./vite.plugins";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      input: {
        background: "./src/background.ts",
        "content-script-zium": "./src/content-script-zium.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    minify: false,
  },
  plugins: [new JsonPlugin(), mode !== "development" && new ZipPlugin()],
}));
