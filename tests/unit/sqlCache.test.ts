import { describe, expect, it } from "vitest";
import {
  createReportCache,
  readReportCache,
} from "../../src/adapters/sqlCache";
import { sampleReport } from "../../src/sampleReport";

describe("SQL report cache", () => {
  it("stores and reads reports without network access", async () => {
    const bytes = await createReportCache(sampleReport);
    const reports = await readReportCache(bytes);

    expect(bytes.length).toBeGreaterThan(100);
    expect(reports[0].repositoryRoot).toBe("examples/fixture-repo");
  });
});
