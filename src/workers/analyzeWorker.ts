import { analyzeRepository } from "../core/analyze";
import type { CommitRecord, FailureRecord } from "../core/types";

type AnalyzeMessage = {
  repositoryRoot: string;
  commits: CommitRecord[];
  failures: FailureRecord[];
};

self.onmessage = (event: MessageEvent<AnalyzeMessage>) => {
  const report = analyzeRepository(
    event.data.repositoryRoot,
    event.data.commits,
    event.data.failures,
    {
      maskEmails: true,
      now: new Date("2026-01-31T00:00:00.000Z"),
    },
  );
  self.postMessage(report);
};
