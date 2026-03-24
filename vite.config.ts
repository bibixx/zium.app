import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vite";
// eslint-disable-next-line
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import posthogRollupPlugin from "@posthog/rollup-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const shakaPackageJsonPath = fileURLToPath(import.meta.resolve("shaka-player/package.json"));
  const shakaPackageJsonData = JSON.parse(readFileSync(shakaPackageJsonPath, "utf-8"));
  if (shakaPackageJsonData) {
    process.env.VITE_SHAKA_PLAYER_VERSION = shakaPackageJsonData.version;
  }

  const posthogProjectId = process.env.POSTHOG_PROJECT_ID;
  const posthogPersonalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;

  return {
    plugins: [
      react(),
      svgr(),
      {
        name: "images-404",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith("/images/")) {
              const filePath = resolve(__dirname, "public", req.url.slice(1).split("?")[0]);
              if (!existsSync(filePath)) {
                res.statusCode = 404;
                res.end();
                return;
              }
            }
            next();
          });
        },
      },
      ...(posthogProjectId && posthogPersonalApiKey
        ? [
            posthogRollupPlugin({
              projectId: posthogProjectId,
              personalApiKey: posthogPersonalApiKey,
              host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
            }),
          ]
        : []),
    ],
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
        generateScopedName: mode === "development" ? "[name]__[local]___[hash:base64:5]" : undefined,
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@use "mixins.scss" as *;`,
          loadPaths: [resolve(__dirname, "src", "styles")],
        },
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            const includes = (text: string, search: string) => text.indexOf(search) > 0;

            if (includes(id, "node_modules/shaka-player")) {
              return "shaka";
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
