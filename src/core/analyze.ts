import { sanitizeText } from "./privacy";
import { buildTree } from "./tree";
import type {
  AnalysisOptions,
  CommitRecord,
  CouplingScore,
  DirectorySnapshot,
  FailureRecord,
  FileScore,
  ReadingRouteStep,
  StratigraphyReport,
} from "./types";

export function analyzeRepository(
  repositoryRoot: string,
  commits: CommitRecord[],
  failures: FailureRecord[],
  options: AnalysisOptions,
): StratigraphyReport {
  const filteredCommits = commits
    .filter((commit) => !options.author || commit.authorName === options.author)
    .filter((commit) => {
      const authoredAt = new Date(commit.authoredAt);
      return (
        (!options.since || authoredAt >= options.since) &&
        (!options.until || authoredAt <= options.until)
      );
    })
    .map((commit) => ({
      ...commit,
      authorEmail: sanitizeText(commit.authorEmail, options.maskEmails),
      subject: sanitizeText(commit.subject, options.maskEmails),
      files: commit.files.filter(
        (file) =>
          !options.pathPrefix || file.path.startsWith(options.pathPrefix),
      ),
    }))
    .filter((commit) => commit.files.length > 0);

  const files = scoreFiles(filteredCommits, failures, options.now);
  const fileScoreMap = new Map(files.map((file) => [file.path, file]));
  const snapshots = buildSnapshots(filteredCommits, fileScoreMap);
  const hotspots = [...files]
    .sort((left, right) => right.hotspotScore - left.hotspotScore)
    .slice(0, 10);

  return {
    generatedAt: options.now.toISOString(),
    repositoryRoot,
    commitCount: filteredCommits.length,
    authorCount: new Set(filteredCommits.map((commit) => commit.authorName))
      .size,
    renameCount: filteredCommits
      .flatMap((commit) => commit.files)
      .filter((file) => file.status === "renamed").length,
    failureCount: failures.length,
    filters: {
      author: options.author,
      pathPrefix: options.pathPrefix,
      since: options.since?.toISOString(),
      until: options.until?.toISOString(),
    },
    files,
    hotspots,
    snapshots,
    readingRoute: buildReadingRoute(hotspots),
  };
}

function scoreFiles(
  commits: CommitRecord[],
  failures: FailureRecord[],
  now: Date,
): FileScore[] {
  const byFile = new Map<string, FileScore>();
  const coupling = new Map<string, Map<string, number>>();

  for (const commit of commits) {
    const paths = [
      ...new Set(
        commit.files
          .filter((file) => file.status !== "deleted")
          .map((file) => file.path),
      ),
    ];
    for (const path of paths) {
      const peerMap = coupling.get(path) ?? new Map<string, number>();
      for (const peer of paths) {
        if (peer !== path) peerMap.set(peer, (peerMap.get(peer) ?? 0) + 1);
      }
      coupling.set(path, peerMap);
    }

    for (const file of commit.files) {
      if (file.status === "deleted") continue;
      if (file.previousPath)
        transferCoupling(coupling, file.previousPath, file.path);
      const existing =
        byFile.get(file.path) ??
        (file.previousPath ? byFile.get(file.previousPath) : undefined);
      if (existing && file.previousPath) byFile.delete(file.previousPath);
      const created = existing ?? {
        path: file.path,
        changes: 0,
        authors: [],
        additions: 0,
        deletions: 0,
        firstSeen: commit.authoredAt,
        lastSeen: commit.authoredAt,
        renameCount: 0,
        failureCount: 0,
        coupledWith: [],
        hotspotScore: 0,
        fragilityScore: 0,
        recentActivityScore: 0,
        rationale: [],
      };

      created.path = file.path;
      created.changes += 1;
      created.additions += file.additions;
      created.deletions += file.deletions;
      created.firstSeen = minIso(created.firstSeen, commit.authoredAt);
      created.lastSeen = maxIso(created.lastSeen, commit.authoredAt);
      created.renameCount += file.status === "renamed" ? 1 : 0;
      if (!created.authors.includes(commit.authorName))
        created.authors.push(commit.authorName);
      byFile.set(file.path, created);
    }
  }

  for (const failure of failures) {
    const file = byFile.get(failure.path);
    if (file) file.failureCount += 1;
  }

  return [...byFile.values()]
    .map((file) => {
      const daysSinceChange = Math.max(
        0,
        (now.getTime() - new Date(file.lastSeen).getTime()) / 86_400_000,
      );
      const recentActivityScore = Math.max(
        0,
        100 - Math.round(daysSinceChange * 1.4),
      );
      const churn = file.additions + file.deletions;
      const coupledWith = topCouplings(coupling.get(file.path), file.changes);
      const hotspotScore = Math.round(
        file.changes * 9 +
          Math.log10(churn + 1) * 18 +
          recentActivityScore * 0.35,
      );
      const fragilityScore = Math.round(
        file.failureCount * 22 + file.renameCount * 10 + coupledWith.length * 4,
      );
      const rationale = [
        `${file.changes} real commits touched this file`,
        `${churn} added or removed lines contributed to churn`,
        `${file.failureCount} linked failure records affect fragility`,
      ];
      if (file.renameCount > 0)
        rationale.push(
          `${file.renameCount} rename events indicate path evolution`,
        );
      if (coupledWith.length > 0)
        rationale.push(
          `Changes with ${coupledWith[0].path} in ${coupledWith[0].count} commits`,
        );

      return {
        ...file,
        authors: file.authors.sort(),
        coupledWith,
        hotspotScore,
        fragilityScore,
        recentActivityScore,
        rationale,
      };
    })
    .sort((left, right) => right.hotspotScore - left.hotspotScore);
}

function transferCoupling(
  coupling: Map<string, Map<string, number>>,
  previousPath: string,
  currentPath: string,
): void {
  const previous = coupling.get(previousPath);
  if (previous) {
    const current = coupling.get(currentPath) ?? new Map<string, number>();
    for (const [path, count] of previous.entries()) {
      current.set(path, (current.get(path) ?? 0) + count);
    }
    coupling.set(currentPath, current);
    coupling.delete(previousPath);
  }

  for (const peerMap of coupling.values()) {
    const previousCount = peerMap.get(previousPath);
    if (previousCount) {
      peerMap.set(currentPath, (peerMap.get(currentPath) ?? 0) + previousCount);
      peerMap.delete(previousPath);
    }
  }
}

function topCouplings(
  peerMap: Map<string, number> | undefined,
  changes: number,
): CouplingScore[] {
  if (!peerMap) return [];
  return [...peerMap.entries()]
    .map(([path, count]) => ({
      path,
      count,
      strength: Number((count / Math.max(changes, 1)).toFixed(2)),
    }))
    .filter((coupling) => coupling.count > 1)
    .sort(
      (left, right) =>
        right.count - left.count || left.path.localeCompare(right.path),
    )
    .slice(0, 5);
}

function buildSnapshots(
  commits: CommitRecord[],
  scores: Map<string, FileScore>,
): DirectorySnapshot[] {
  const active = new Set<string>();
  const interval = Math.max(1, Math.floor(commits.length / 8));
  const snapshots: DirectorySnapshot[] = [];

  commits.forEach((commit, index) => {
    for (const file of commit.files) {
      if (file.previousPath) active.delete(file.previousPath);
      if (file.status === "deleted") active.delete(file.path);
      else active.add(file.path);
    }

    if (index === commits.length - 1 || index % interval === 0) {
      snapshots.push({
        commit: commit.hash,
        shortHash: commit.shortHash,
        authoredAt: commit.authoredAt,
        tree: buildTree([...active], scores),
      });
    }
  });

  return snapshots;
}

function buildReadingRoute(hotspots: FileScore[]): ReadingRouteStep[] {
  return hotspots.slice(0, 6).map((file, index) => ({
    title: `Step ${index + 1}: read ${file.path}`,
    path: file.path,
    reason: file.rationale.join("; "),
    relatedFiles: file.coupledWith.slice(0, 3).map((coupling) => coupling.path),
  }));
}

function minIso(left: string, right: string): string {
  return new Date(left) <= new Date(right) ? left : right;
}

function maxIso(left: string, right: string): string {
  return new Date(left) >= new Date(right) ? left : right;
}
