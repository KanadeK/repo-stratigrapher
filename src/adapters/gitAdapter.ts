import { readFile } from "node:fs/promises";
import path from "node:path";
import simpleGit from "simple-git";
import type { CommitRecord, FailureRecord, FileChange } from "../core/types";

const FIELD = "\u001f";
const RECORD = "\u001e";

export async function readGitHistory(
  repositoryRoot: string,
): Promise<CommitRecord[]> {
  const git = simpleGit(repositoryRoot, { binary: "git" });
  const output = await git.raw([
    "log",
    "--reverse",
    "--date=iso-strict",
    "--find-renames",
    `--format=${RECORD}%H${FIELD}%h${FIELD}%an${FIELD}%ae${FIELD}%aI${FIELD}%s`,
    "--numstat",
    "--name-status",
  ]);

  return parseGitLog(output);
}

export async function readFailureRecords(
  repositoryRoot: string,
): Promise<FailureRecord[]> {
  const file = path.join(
    repositoryRoot,
    ".repo-stratigrapher",
    "failures.json",
  );
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as FailureRecord[];
    return parsed.map((record) => ({
      commit: record.commit,
      path: normalizePath(record.path),
      testName: String(record.testName),
      failedAt: String(record.failedAt),
      message: String(record.message),
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export function parseGitLog(output: string): CommitRecord[] {
  return output
    .split(RECORD)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [header, ...body] = entry.split("\n");
      const [hash, shortHash, authorName, authorEmail, authoredAt, subject] =
        header.split(FIELD);
      return {
        hash,
        shortHash,
        authorName,
        authorEmail,
        authoredAt,
        subject,
        files: parseChangeBody(body),
      };
    });
}

function parseChangeBody(lines: string[]): FileChange[] {
  const stats = new Map<string, Pick<FileChange, "additions" | "deletions">>();
  const changes = new Map<string, FileChange>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = line.split("\t");

    if (/^\d|-/.test(parts[0]) && parts.length >= 3) {
      stats.set(normalizePath(parts[2]), {
        additions: toNumber(parts[0]),
        deletions: toNumber(parts[1]),
      });
      continue;
    }

    const statusToken = parts[0];
    const status = statusToken.startsWith("R")
      ? "renamed"
      : statusToken === "A"
        ? "added"
        : statusToken === "D"
          ? "deleted"
          : "modified";
    const currentPath = normalizePath(
      status === "renamed" ? parts[2] : parts[1],
    );
    const previousPath =
      status === "renamed" ? normalizePath(parts[1]) : undefined;
    const stat = stats.get(currentPath) ?? { additions: 0, deletions: 0 };
    changes.set(currentPath, {
      path: currentPath,
      previousPath,
      status,
      additions: stat.additions,
      deletions: stat.deletions,
    });
  }

  for (const [pathKey, stat] of stats.entries()) {
    if (!changes.has(pathKey)) {
      changes.set(pathKey, {
        path: pathKey,
        status: "modified",
        additions: stat.additions,
        deletions: stat.deletions,
      });
    }
  }

  return [...changes.values()];
}

function normalizePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\{(.+) => (.+)\}$/, "$2");
}

function toNumber(value: string): number {
  return value === "-" ? 0 : Number(value);
}
