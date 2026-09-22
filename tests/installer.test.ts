import { HttpClient } from "@actions/http-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as installer from "../src/installer";
import type { Release } from "../src/installer";

function release(partial: Partial<Release>): Release {
  return {
    arch: "x86_64",
    backend: "moar",
    build_rev: 1,
    type: "archive",
    platform: "linux",
    latest: null,
    url: "https://example.invalid/rakudo.tar.gz",
    ver: "2020.06",
    ...partial,
  };
}

function mockReleases(releases: Release[]): void {
  vi.spyOn(HttpClient.prototype, "getJson").mockResolvedValue({
    result: releases,
    statusCode: 200,
    headers: {},
  } as never);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getRelease (mocked)", () => {
  it("selects the latest version", async () => {
    mockReleases([
      release({ ver: "2020.06" }),
      release({ ver: "2024.10" }),
      release({ ver: "2022.02" }),
    ]);
    const r = await installer.getRelease("latest", "linux", "x86_64");
    expect(r?.ver).toBe("2024.10");
  });

  it("prefers the highest build_rev within a version", async () => {
    mockReleases([
      release({ ver: "2020.02.1", build_rev: 1 }),
      release({ ver: "2020.02.1", build_rev: 2 }),
    ]);
    const r = await installer.getRelease("2020.02.1", "linux", "x86_64");
    expect(r?.build_rev).toBe(2);
  });

  it("prefers a numbered build_rev over null", async () => {
    mockReleases([
      release({ ver: "2020.02.1", build_rev: null }),
      release({ ver: "2020.02.1", build_rev: 1 }),
    ]);
    const r = await installer.getRelease("2020.02.1", "linux", "x86_64");
    expect(r?.build_rev).toBe(1);
  });

  it("filters by arch, platform, backend and type", async () => {
    mockReleases([
      release({ ver: "2024.10", arch: "arm64" }),
      release({ ver: "2024.10", platform: "macos" }),
      release({ ver: "2024.10", backend: "jvm" }),
      release({ ver: "2024.10", type: "src" }),
      release({ ver: "2024.09" }),
    ]);
    const r = await installer.getRelease("latest", "linux", "x86_64");
    expect(r?.ver).toBe("2024.09");
  });

  it("returns null when nothing matches", async () => {
    mockReleases([release({ ver: "2024.10", platform: "win" })]);
    const r = await installer.getRelease("latest", "linux", "x86_64");
    expect(r).toBeNull();
  });

  it("returns null when the API yields no result", async () => {
    mockReleases([]);
    const r = await installer.getRelease("latest", "linux", "x86_64");
    expect(r).toBeNull();
  });

  it("matches an exact version", async () => {
    mockReleases([release({ ver: "2020.06" }), release({ ver: "2024.10" })]);
    const r = await installer.getRelease("2020.06", "linux", "x86_64");
    expect(r?.ver).toBe("2020.06");
  });
});

describe("cacheVersion", () => {
  it("appends build_rev when present", () => {
    expect(
      installer.cacheVersion(release({ ver: "2020.06", build_rev: 1 })),
    ).toBe("2020.06-01");
  });

  it("omits build_rev when null", () => {
    expect(
      installer.cacheVersion(release({ ver: "2020.06", build_rev: null })),
    ).toBe("2020.06");
  });
});
