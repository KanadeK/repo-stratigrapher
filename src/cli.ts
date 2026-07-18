import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { analyzeRepository } from "./core/analyze";
import { renderJsonReport, renderMarkdownReport } from "./core/report";
import { readFailureRecords, readGitHistory } from "./adapters/gitAdapter";

const args = process.argv.slice(2);
const command = args[0];

if (command !== "analyze") {
  console.error(
    "Usage: repo-stratigrapher analyze --repo <path> --out <directory> [--author <name>] [--path <prefix>]",
  );
  process.exit(1);
}

const repo = readFlag("--repo") ?? process.cwd();
const out = readFlag("--out") ?? path.join(process.cwd(), "dist-demo");
const author = readFlag("--author");
const pathPrefix = readFlag("--path");

try {
  const repositoryRoot = path.resolve(repo);
  const commits = await readGitHistory(repositoryRoot);
  const failures = await readFailureRecords(repositoryRoot);
  const report = analyzeRepository(repositoryRoot, commits, failures, {
    maskEmails: true,
    now: new Date(
      process.env.REPO_STRATIGRAPHER_NOW ?? "2026-01-31T00:00:00.000Z",
    ),
    author,
    pathPrefix,
  });

  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, "report.json"), renderJsonReport(report));
  await writeFile(path.join(out, "report.md"), renderMarkdownReport(report));
  console.log(
    `Analyzed ${report.commitCount} commits, ${report.renameCount} renames, ${report.hotspots.length} hotspots.`,
  );
  console.log(
    `Wrote ${path.relative(process.cwd(), path.join(out, "report.md"))}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function readFlag(name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}
