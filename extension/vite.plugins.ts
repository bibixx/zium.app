import { readFile, rename, writeFile } from "fs/promises";
import { resolve } from "path";
import { Plugin, ResolvedConfig } from "vite";
import { zip } from "zip-a-folder";

interface FileData {
  fileName: string;
  data: string;
}

export class JsonPlugin implements Plugin {
  public name = "json-plugin";
  private distPath: string;
  private publicDir: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private env: Record<string, any> = {};

  public get appDomains(): string[] {
    return this.env.VITE_APP_DOMAINS.split(",").map((d: string) => d.trim());
  }

  public get controlledDomains(): string[] {
    return this.env.VITE_CONTROLLED_DOMAINS.split(",").map((d: string) => d.trim());
  }

  configResolved = (config: ResolvedConfig) => {
    this.distPath = resolve(config.root, config.build.outDir);
    this.publicDir = config.publicDir;
    this.env = config.env;
  };

  getManifest = async (): Promise<FileData> => {
    if (this.publicDir == null) {
      throw new Error("publicDir not defined");
    }

    const fileName = "manifest.json";
    const manifest = await readFile(resolve(this.publicDir, fileName), "utf-8");
    const parsedManifest = JSON.parse(manifest);

    const domains = [...this.appDomains, ...this.controlledDomains];

    // host_permissions
    parsedManifest.host_permissions = domains.map((domain) => `*://${domain}/`);

    // content_scripts
    for (const script of parsedManifest.content_scripts) {
      if (!script.js.includes("content-script-zium.js")) {
        continue;
      }

      script.matches = this.appDomains.map((domain) => `*://${domain}/*`);
    }

    // externally_connectable
    parsedManifest.externally_connectable.matches = this.appDomains.map((domain) => `*://${domain}/`);

    return {
      fileName,
      data: JSON.stringify(parsedManifest, null, 2),
    };
  };

  getRules = async (): Promise<FileData> => {
    if (this.publicDir == null) {
      throw new Error("publicDir not defined");
    }

    const fileName = "rules.json";
    const manifest = await readFile(resolve(this.publicDir, fileName), "utf-8");
    const parsedRules = JSON.parse(manifest);

    for (const rule of parsedRules) {
      rule.condition.initiatorDomains = this.appDomains.map((domain) => domain.replace(/^\*\./, ""));
    }

    return {
      fileName,
      data: JSON.stringify(parsedRules, null, 2),
    };
  };

  closeBundle = async () => {
    if (this.distPath == null) {
      throw new Error("distPath not defined");
    }

    const [manifest, rules] = await Promise.all([this.getManifest(), this.getRules()]);
    const writeJson = (fd: FileData) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      writeFile(resolve(this.distPath!, fd.fileName), fd.data, { flag: "w" });

    await Promise.all([writeJson(manifest), writeJson(rules)]);
  };
}

export class ZipPlugin implements Plugin {
  public name = "zip-plugin";
  private distPath: string;

  configResolved = (config: ResolvedConfig) => {
    this.distPath = resolve(config.root, config.build.outDir);
  };

  closeBundle = async () => {
    const fileName = "zium-helper.zip";
    const tmpPath = resolve("/tmp/", fileName);
    const targetPath = resolve(this.distPath, fileName);

    await zip(this.distPath, tmpPath);
    await rename(tmpPath, targetPath);
  };
}
