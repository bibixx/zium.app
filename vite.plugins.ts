import { resolve } from "path";
import { exec } from "child_process";
import { Plugin, ResolvedConfig } from "vite";

interface GlitchTipPluginConfig {
  authToken: string;
  org: string;
  project: string;
  url: string;
  releaseName: string;
}

const run = async <T>(cmd: string, pipeStd = true) =>
  new Promise<T>((resolve, reject) => {
    const child = exec(cmd, { stdio: "inherit" }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout);
    });

    if (pipeStd) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }
  });

export class GlitchTipPlugin implements Plugin {
  public name = "glitchtip-plugin";
  private distPath: string;

  constructor(private pluginConfig: GlitchTipPluginConfig) {
    process.env.VITE_GLITCH_TIP_RELEASE_NAME = pluginConfig.releaseName;
  }

  configResolved = (config: ResolvedConfig) => {
    this.distPath = resolve(config.root, config.build.outDir);
  };

  private getSentryCliProjectArgs = () => {
    const { org, project } = this.pluginConfig;
    return `--org ${org} -p ${project}`;
  };

  private getSentryCliCmd = () => {
    const { authToken, url } = this.pluginConfig;
    return `sentry-cli --auth-token ${authToken} --url ${url}`;
  };

  buildStart = async () => {
    const release = this.pluginConfig.releaseName;

    await run(`${this.getSentryCliCmd()} releases ${this.getSentryCliProjectArgs()} new ${release}`, false);
    console.log(`Created GlitchTip release: ${release}`);
    console.log();
  };

  closeBundle = async () => {
    const release = this.pluginConfig.releaseName;
    const sentryCliProjectArgs = this.getSentryCliProjectArgs();

    console.log("Uploading source maps to GlitchTip");
    await run(`${this.getSentryCliCmd()} sourcemaps ${sentryCliProjectArgs} inject ${this.distPath}`);
    console.log();
    await run(
      `${this.getSentryCliCmd()} sourcemaps ${sentryCliProjectArgs} upload --release=${release} ${this.distPath}/`,
    );
    console.log();
    await run(`${this.getSentryCliCmd()} releases ${sentryCliProjectArgs} finalize ${release}`);
  };
}
