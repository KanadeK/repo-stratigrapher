import type { StratigraphyReport } from "./types";

export function renderMarkdownReport(report: StratigraphyReport): string {
  const lines = [
    `# Repo Stratigraphy Report`,
    ``,
    `Generated: ${report.generatedAt}`,
    `Repository: ${report.repositoryRoot}`,
    ``,
    `## Summary`,
    ``,
    `- Commits analyzed: ${report.commitCount}`,
    `- Authors: ${report.authorCount}`,
    `- Renames detected: ${report.renameCount}`,
    `- Failure records: ${report.failureCount}`,
    ``,
    `## Top Hotspots`,
    ``,
    `| Rank | Path | Hotspot | Fragility | Changes | Rationale |`,
    `| --- | --- | ---: | ---: | ---: | --- |`,
    ...report.hotspots
      .slice(0, 10)
      .map((file, index) =>
        [
          `| ${index + 1}`,
          file.path,
          String(file.hotspotScore),
          String(file.fragilityScore),
          String(file.changes),
          file.rationale.join("<br>"),
          `|`,
        ].join(" | "),
      ),
    ``,
    `## New Contributor Reading Route`,
    ``,
    ...report.readingRoute.flatMap((step) => [
      `### ${step.title}`,
      ``,
      `Path: \`${step.path}\``,
      ``,
      step.reason,
      ``,
      step.relatedFiles.length > 0
        ? `Related files: ${step.relatedFiles.map((file) => `\`${file}\``).join(", ")}`
        : `Related files: none`,
      ``,
    ]),
  ];

  return `${lines.join("\n")}\n`;
}

export function renderJsonReport(report: StratigraphyReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
