import { describe, expect, it } from "vitest";
import { analyzeRepository } from "../../src/core/analyze";
import type { CommitRecord } from "../../src/core/types";

const commits: CommitRecord[] = [
  commit("1", "2025-01-01T00:00:00.000Z", "Ari", [
    { path: "src/a.ts", status: "added", additions: 10, deletions: 0 },
  ]),
  commit("2", "2025-01-02T00:00:00.000Z", "Ari", [
    { path: "src/a.ts", status: "modified", additions: 5, deletions: 2 },
    { path: "src/b.ts", status: "added", additions: 6, deletions: 0 },
  ]),
  commit("3", "2025-01-03T00:00:00.000Z", "Mika", [
    {
      path: "src/core/a.ts",
      previousPath: "src/a.ts",
      status: "renamed",
      additions: 0,
      deletions: 0,
    },
    { path: "src/b.ts", status: "modified", additions: 1, deletions: 1 },
  ]),
];

describe("analyzeRepository", () => {
  it("computes hotspots, renames, couplings, and reading route from real commits", () => {
    const report = analyzeRepository(
      "/repo",
      commits,
      [
        {
          path: "src/core/a.ts",
          testName: "fails",
          failedAt: "2025-01-03T01:00:00.000Z",
          message: "boom",
        },
      ],
      { maskEmails: true, now: new Date("2025-01-04T00:00:00.000Z") },
    );

    expect(report.commitCount).toBe(3);
    expect(report.renameCount).toBe(1);
    expect(report.hotspots[0].path).toBe("src/core/a.ts");
    expect(report.hotspots[0].failureCount).toBe(1);
    expect(report.readingRoute[0].relatedFiles).toContain("src/b.ts");
  });

  it("applies author and path filters without fixed results", () => {
    const report = analyzeRepository("/repo", commits, [], {
      maskEmails: true,
      now: new Date("2025-01-04T00:00:00.000Z"),
      author: "Mika",
      pathPrefix: "src/core",
    });

    expect(report.commitCount).toBe(1);
    expect(report.files).toHaveLength(1);
    expect(report.files[0].path).toBe("src/core/a.ts");
  });
});

function commit(
  hash: string,
  authoredAt: string,
  authorName: string,
  files: CommitRecord["files"],
): CommitRecord {
  return {
    hash,
    shortHash: hash,
    authorName,
    authorEmail: `${authorName.toLowerCase()}@example.test`,
    authoredAt,
    subject: `commit ${hash}`,
    files,
  };
}
