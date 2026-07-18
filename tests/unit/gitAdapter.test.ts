import { describe, expect, it } from "vitest";
import { parseGitLog } from "../../src/adapters/gitAdapter";

const field = "\u001f";
const record = "\u001e";

describe("parseGitLog", () => {
  it("parses numstat, modifications, and renames", () => {
    const output = [
      `${record}abc123${field}abc${field}Ari${field}ari@example.test${field}2025-01-01T00:00:00.000Z${field}add file`,
      "10\t2\tsrc/old.ts",
      "A\tsrc/old.ts",
      `${record}def456${field}def${field}Ari${field}ari@example.test${field}2025-01-02T00:00:00.000Z${field}rename file`,
      "0\t0\tsrc/new.ts",
      "R100\tsrc/old.ts\tsrc/new.ts",
    ].join("\n");

    const commits = parseGitLog(output);

    expect(commits).toHaveLength(2);
    expect(commits[0].files[0]).toMatchObject({
      path: "src/old.ts",
      status: "added",
      additions: 10,
      deletions: 2,
    });
    expect(commits[1].files[0]).toMatchObject({
      path: "src/new.ts",
      previousPath: "src/old.ts",
      status: "renamed",
    });
  });
});
