import type { StratigraphyReport } from "./core/types";

export const sampleReport: StratigraphyReport = {
  generatedAt: "2026-01-31T00:00:00.000Z",
  repositoryRoot: "examples/fixture-repo",
  commitCount: 24,
  authorCount: 3,
  renameCount: 3,
  failureCount: 5,
  filters: {},
  files: [
    {
      path: "src/payments/ledger.ts",
      changes: 12,
      authors: ["Ari Maintainer", "Mika Reviewer"],
      additions: 210,
      deletions: 74,
      firstSeen: "2025-01-04T10:00:00.000Z",
      lastSeen: "2025-01-26T10:00:00.000Z",
      renameCount: 1,
      failureCount: 3,
      coupledWith: [
        { path: "src/payments/reconcile.ts", count: 8, strength: 0.67 },
        { path: "tests/payments.test.ts", count: 6, strength: 0.5 },
      ],
      hotspotScore: 198,
      fragilityScore: 56,
      recentActivityScore: 95,
      rationale: [
        "12 real commits touched this file",
        "284 added or removed lines contributed to churn",
        "3 linked failure records affect fragility",
        "1 rename events indicate path evolution",
      ],
    },
    {
      path: "src/payments/reconcile.ts",
      changes: 9,
      authors: ["Ari Maintainer", "Noor Contributor"],
      additions: 158,
      deletions: 44,
      firstSeen: "2025-01-05T10:00:00.000Z",
      lastSeen: "2025-01-27T10:00:00.000Z",
      renameCount: 0,
      failureCount: 1,
      coupledWith: [
        { path: "src/payments/ledger.ts", count: 8, strength: 0.89 },
      ],
      hotspotScore: 164,
      fragilityScore: 26,
      recentActivityScore: 96,
      rationale: [
        "9 real commits touched this file",
        "202 added or removed lines contributed to churn",
        "1 linked failure records affect fragility",
      ],
    },
    {
      path: "src/api/routes.ts",
      changes: 8,
      authors: ["Mika Reviewer"],
      additions: 126,
      deletions: 31,
      firstSeen: "2025-01-02T10:00:00.000Z",
      lastSeen: "2025-01-24T10:00:00.000Z",
      renameCount: 1,
      failureCount: 1,
      coupledWith: [{ path: "src/api/handlers.ts", count: 5, strength: 0.63 }],
      hotspotScore: 143,
      fragilityScore: 36,
      recentActivityScore: 91,
      rationale: [
        "8 real commits touched this file",
        "157 added or removed lines contributed to churn",
        "1 linked failure records affect fragility",
      ],
    },
  ],
  hotspots: [],
  snapshots: [
    {
      commit: "fixture-001",
      shortHash: "f001",
      authoredAt: "2025-01-04T10:00:00.000Z",
      tree: {
        name: "root",
        path: "",
        type: "directory",
        children: [
          {
            name: "src",
            path: "src",
            type: "directory",
            children: [
              {
                name: "payments",
                path: "src/payments",
                type: "directory",
                children: [
                  {
                    name: "ledger.ts",
                    path: "src/payments/ledger.ts",
                    type: "file",
                    children: [],
                    hotspotScore: 198,
                  },
                  {
                    name: "reconcile.ts",
                    path: "src/payments/reconcile.ts",
                    type: "file",
                    children: [],
                    hotspotScore: 164,
                  },
                ],
              },
              {
                name: "api",
                path: "src/api",
                type: "directory",
                children: [
                  {
                    name: "routes.ts",
                    path: "src/api/routes.ts",
                    type: "file",
                    children: [],
                    hotspotScore: 143,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  readingRoute: [],
};

sampleReport.hotspots = sampleReport.files;
sampleReport.readingRoute = sampleReport.hotspots.map((file, index) => ({
  title: `Step ${index + 1}: read ${file.path}`,
  path: file.path,
  reason: file.rationale.join("; "),
  relatedFiles: file.coupledWith.map((coupling) => coupling.path),
}));
