import { describe, expect, it } from "vitest";
import { renderJsonReport, renderMarkdownReport } from "../../src/core/report";
import { sampleReport } from "../../src/sampleReport";

describe("report rendering", () => {
  it("renders Markdown with summary, hotspots, and reading route", () => {
    const markdown = renderMarkdownReport(sampleReport);

    expect(markdown).toContain("Commits analyzed: 24");
    expect(markdown).toContain("src/payments/ledger.ts");
    expect(markdown).toContain("New Contributor Reading Route");
  });

  it("renders JSON that round trips to the report shape", () => {
    const parsed = JSON.parse(renderJsonReport(sampleReport));

    expect(parsed.commitCount).toBe(24);
    expect(parsed.hotspots[0].path).toBe("src/payments/ledger.ts");
  });
});
