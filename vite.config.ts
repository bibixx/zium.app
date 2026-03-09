import { defineConfig, resolvePackageData } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import posthogRollupPlugin from "@posthog/rollup-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const packageJsonPath = resolvePackageData("bitmovinf-player", process.cwd());
  if (packageJsonPath?.data) {
    process.env.VITE_BITMOVIN_PLAYER_VERSION = packageJsonPath.data.version;
  }

  return {
    plugins: [
      react(),
      svgr(),
      posthogRollupPlugin({
        apiKey: process.env.POSTHOG_API_KEY,
        host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
      }),
    ],
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
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            const includes = (text: string, search: string) => text.indexOf(search) > 0;

            if (includes(id, "node_modules/bitmovin-player") || includes(id, "node_modules/bitmovin-player-ui")) {
              return "bitmovin";
            }

            if (includes(id, "node_modules/lottie-react") || includes(id, "node_modules/lottie-web")) {
              return "lottie";
            }

            if (id.indexOf("node_modules") > 0) {
              return "vendor";
            }
          },
        },
      },
    },
  };
});
