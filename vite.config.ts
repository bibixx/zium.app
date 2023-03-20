import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  css: {
    modules: { localsConvention: "camelCaseOnly" },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/mixins.scss";`,
      },
    },
  },
});
