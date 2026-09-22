import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parseZefModules, zefCacheKey } from "../src/main";

describe("parseZefModules", () => {
  it("parses space-separated modules", () => {
    expect(parseZefModules("Test::META Cro::Core")).toEqual([
      "Test::META",
      "Cro::Core",
    ]);
  });

  it("parses comma-separated modules", () => {
    expect(parseZefModules("Test::META,Cro::Core")).toEqual([
      "Test::META",
      "Cro::Core",
    ]);
  });

  it("parses mixed separators and trims whitespace", () => {
    expect(parseZefModules("  Test::META ,\n Cro::Core  ")).toEqual([
      "Test::META",
      "Cro::Core",
    ]);
  });

  it("returns an empty list for empty input", () => {
    expect(parseZefModules("")).toEqual([]);
    expect(parseZefModules("   ")).toEqual([]);
  });
});

describe("zefCacheKey", () => {
  let tmpDir: string;
  let prevCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "setup-raku-"));
    prevCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(prevCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("includes a hash of META6.json when present", () => {
    fs.writeFileSync(path.join(tmpDir, "META6.json"), '{"name":"x"}');
    const key = zefCacheKey();
    expect(key).toMatch(/^zef-[a-z0-9]+-[a-z0-9_]+-[0-9a-f]{64}$/);
  });

  it("changes when META6.json changes", () => {
    fs.writeFileSync(path.join(tmpDir, "META6.json"), '{"name":"x"}');
    const key1 = zefCacheKey();
    fs.writeFileSync(path.join(tmpDir, "META6.json"), '{"name":"y"}');
    const key2 = zefCacheKey();
    expect(key1).not.toBe(key2);
  });

  it("falls back gracefully without META6.json", () => {
    const key = zefCacheKey();
    expect(key).toBe(`zef-${process.platform}-${process.arch}-`);
  });
});
