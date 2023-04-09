import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: "./src/background.ts",
        "content-script-f1": "./src/content-script-f1.ts",
        "content-script-zium": "./src/content-script-zium.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    minify: false,
  },
});
