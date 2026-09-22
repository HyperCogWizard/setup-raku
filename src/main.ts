import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as installer from "./installer.js";

export function parseZefModules(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
}

function zefDir(): string {
  return path.join(os.homedir(), ".zef");
}

export function zefCacheKey(): string {
  let digest = "";
  const meta = path.join(process.cwd(), "META6.json");
  try {
    digest = crypto
      .createHash("sha256")
      .update(fs.readFileSync(meta))
      .digest("hex");
  } catch {
    core.info("META6.json not found; caching zef dir without a lock hash");
  }
  return `zef-${process.platform}-${process.arch}-${digest}`;
}

async function verifyZef(): Promise<void> {
  core.startGroup("zef --version");
  try {
    await exec.exec("zef", ["--version"]);
  } catch {
    throw new Error(
      "zef was not found on PATH after installing rakudo; the rakudo.org bundle may be incomplete",
    );
  } finally {
    core.endGroup();
  }
}

async function installZefModules(modules: string[]): Promise<void> {
  if (modules.length === 0) {
    return;
  }
  core.startGroup(`zef install ${modules.join(" ")}`);
  try {
    await exec.exec("zef", ["install", ...modules]);
  } finally {
    core.endGroup();
  }
}

async function restoreZefCache(): Promise<void> {
  const key = zefCacheKey();
  const restored = await cache.restoreCache([zefDir()], key);
  core.info(
    restored
      ? `Restored zef cache from ${restored}`
      : `No zef cache found for ${key}`,
  );
}

async function saveZefCache(): Promise<void> {
  const key = zefCacheKey();
  try {
    await cache.saveCache([zefDir()], key);
  } catch (error: unknown) {
    core.warning(
      `Failed to save zef cache: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function run(): Promise<void> {
  try {
    const version = core.getInput("raku-version") || "latest";
    if (!/^(latest|\d{4}\.\d{2}(\.\d{1,2})?)$/.test(version)) {
      throw new Error(
        `Invalid raku-version "${version}". Expected "latest" or a version like "2020.06" or "2020.05.1"`,
      );
    }
    const platform =
      os.platform() === "darwin"
        ? "macos"
        : os.platform() === "win32"
          ? "win"
          : "linux";
    const arch = os.arch() === "arm64" ? "arm64" : "x86_64";

    const enableZefCache = core.getBooleanInput("enable-zef-cache");
    if (enableZefCache) {
      await restoreZefCache();
    }

    const { ver, toolPath } = await installer.getRaku(version, platform, arch);
    core.setOutput("raku-version", ver);
    core.setOutput("raku-path", toolPath);

    core.startGroup("raku -V");
    try {
      await exec.exec("raku", ["-V"]);
    } finally {
      core.endGroup();
    }

    await verifyZef();

    const modules = parseZefModules(core.getInput("zef-modules"));
    if (modules.length > 0) {
      await installZefModules(modules);
    }

    if (enableZefCache) {
      await saveZefCache();
    }
  } catch (error: unknown) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}
