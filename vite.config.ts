import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: { localsConvention: "camelCaseOnly" },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/mixins.scss";`,
      },
    },
  },
});
