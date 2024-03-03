import { execSync } from "child_process";
import { defineConfig, loadEnv, resolvePackageData } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { GlitchTipPlugin } from "./vite/vite.plugins";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { GLITCH_TIP_AUTH_TOKEN, GLITCH_TIP_ORG, GLITCH_TIP_PROJECT, GLITCH_TIP_URL } = loadEnv(
    mode,
    process.cwd(),
    "GLITCH_TIP",
  );

  const packageJsonPath = resolvePackageData("bitmovinf-player", process.cwd());
  if (packageJsonPath?.data) {
    process.env.VITE_BITMOVIN_PLAYER_VERSION = packageJsonPath.data.version;
  }

  let glitchTipPlugin: GlitchTipPlugin | undefined = undefined;
  if (
    mode === "production" &&
    GLITCH_TIP_AUTH_TOKEN != null &&
    GLITCH_TIP_ORG != null &&
    GLITCH_TIP_PROJECT != null &&
    GLITCH_TIP_URL != null
  ) {
    const commitHash = execSync("git rev-parse HEAD").toString().trimEnd();

    glitchTipPlugin = new GlitchTipPlugin({
      authToken: GLITCH_TIP_AUTH_TOKEN,
      org: GLITCH_TIP_ORG,
      project: GLITCH_TIP_PROJECT,
      url: GLITCH_TIP_URL,
      releaseName: commitHash,
    });
  }

  return {
    plugins: [react(), svgr(), glitchTipPlugin],
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
