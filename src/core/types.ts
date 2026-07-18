export type CommitRecord = {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  authoredAt: string;
  subject: string;
  files: FileChange[];
};

export type FileChange = {
  path: string;
  previousPath?: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
};

export type FailureRecord = {
  commit?: string;
  path: string;
  testName: string;
  failedAt: string;
  message: string;
};

export type AnalysisOptions = {
  maskEmails: boolean;
  now: Date;
  author?: string;
  pathPrefix?: string;
  since?: Date;
  until?: Date;
};

export type FileScore = {
  path: string;
  changes: number;
  authors: string[];
  additions: number;
  deletions: number;
  firstSeen: string;
  lastSeen: string;
  renameCount: number;
  failureCount: number;
  coupledWith: CouplingScore[];
  hotspotScore: number;
  fragilityScore: number;
  recentActivityScore: number;
  rationale: string[];
};

export type CouplingScore = {
  path: string;
  count: number;
  strength: number;
};

export type DirectorySnapshot = {
  commit: string;
  shortHash: string;
  authoredAt: string;
  tree: TreeNode;
};

export type TreeNode = {
  name: string;
  path: string;
  type: "directory" | "file";
  children: TreeNode[];
  hotspotScore?: number;
};

export type ReadingRouteStep = {
  title: string;
  path: string;
  reason: string;
  relatedFiles: string[];
};

export type StratigraphyReport = {
  generatedAt: string;
  repositoryRoot: string;
  commitCount: number;
  authorCount: number;
  renameCount: number;
  failureCount: number;
  filters: {
    author?: string;
    pathPrefix?: string;
    since?: string;
    until?: string;
  };
  files: FileScore[];
  hotspots: FileScore[];
  snapshots: DirectorySnapshot[];
  readingRoute: ReadingRouteStep[];
};
