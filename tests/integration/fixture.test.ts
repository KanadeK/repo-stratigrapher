import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("fixture repository analysis", () => {
  it("generates a deterministic repo with commits, renames, hotspots, and exports", async () => {
    const fixture = path.resolve("examples/fixture-repo");
    const out = path.resolve("dist-demo");
    await rm(out, { recursive: true, force: true });
    execFileSync("node", ["scripts/generate_fixture_repo.mjs", fixture], {
      stdio: "inherit",
    });
    execFileSync(
      "node",
      [
        "bin/repo-stratigrapher.mjs",
        "analyze",
        "--repo",
        fixture,
        "--out",
        out,
      ],
      { stdio: "inherit" },
    );

    const report = JSON.parse(
      readFileSync(path.join(out, "report.json"), "utf8"),
    );
    const markdown = readFileSync(path.join(out, "report.md"), "utf8");

    expect(report.commitCount).toBeGreaterThanOrEqual(20);
    expect(report.renameCount).toBeGreaterThanOrEqual(3);
    expect(report.hotspots.length).toBeGreaterThanOrEqual(2);
    expect(report.hotspots[0].path).toBe("src/payments/ledger.ts");
    expect(markdown).toContain("New Contributor Reading Route");
  });
});
