import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), svgr()],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: mode === "development" ? "[name]__[local]___[hash:base64:5]" : undefined,
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/mixins.scss";`,
      },
    },
  },
}));
