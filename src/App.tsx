import {
  DownloadSimple,
  FileCode,
  GitBranch,
  GitCommit,
  MagnifyingGlass,
  ShieldCheck,
} from "@phosphor-icons/react";
import * as d3 from "d3";
import { useMemo, useState } from "react";
import { renderJsonReport, renderMarkdownReport } from "./core/report";
import type { FileScore, StratigraphyReport, TreeNode } from "./core/types";
import { sampleReport } from "./sampleReport";
import "./styles.css";

type ViewMode = "hotspots" | "timeline" | "route";

export default function App() {
  const [report, setReport] = useState<StratigraphyReport>(sampleReport);
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("all");
  const [mode, setMode] = useState<ViewMode>("hotspots");
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const authors = useMemo(
    () => ["all", ...new Set(report.files.flatMap((file) => file.authors))],
    [report.files],
  );
  const files = useMemo(
    () =>
      report.files.filter((file) => {
        const queryMatch = file.path
          .toLowerCase()
          .includes(query.toLowerCase());
        const authorMatch = author === "all" || file.authors.includes(author);
        return queryMatch && authorMatch;
      }),
    [author, query, report.files],
  );
  const snapshot =
    report.snapshots[Math.min(snapshotIndex, report.snapshots.length - 1)];

  async function importReport(file: File) {
    setError(null);
    try {
      const parsed = JSON.parse(await file.text()) as StratigraphyReport;
      if (
        !Array.isArray(parsed.files) ||
        !Array.isArray(parsed.hotspots) ||
        !Array.isArray(parsed.readingRoute)
      ) {
        throw new Error(
          "The JSON does not look like a Repo Stratigrapher report.",
        );
      }
      setReport(parsed);
      setSnapshotIndex(0);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Unable to import report.",
      );
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <nav className="nav" aria-label="Primary">
          <div className="brand">
            <GitBranch size={24} weight="duotone" />
            <span>Repo Stratigrapher</span>
          </div>
          <a href="https://github.com/KanadeK/repo-stratigrapher">GitHub</a>
        </nav>
        <section className="heroGrid">
          <div>
            <p className="eyebrow">Local-first repository archaeology</p>
            <h1>
              Interactive code stratigraphy for repositories with history.
            </h1>
            <p className="lede">
              Layer commits, renames, directory evolution, test failures,
              hotspots, and reading routes into one inspectable map.
            </p>
            <div className="heroActions">
              <label className="button primary">
                Import report.json
                <input
                  aria-label="Import report JSON"
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void importReport(file);
                  }}
                />
              </label>
              <button
                className="button"
                onClick={() =>
                  download(
                    "report.md",
                    renderMarkdownReport(report),
                    "text/markdown",
                  )
                }
              >
                <DownloadSimple size={18} />
                Markdown
              </button>
              <button
                className="button"
                onClick={() =>
                  download(
                    "report.json",
                    renderJsonReport(report),
                    "application/json",
                  )
                }
              >
                <DownloadSimple size={18} />
                JSON
              </button>
            </div>
            {error ? <p className="error">{error}</p> : null}
          </div>
          <Overview report={report} />
        </section>
      </header>

      <section className="toolbar" aria-label="Analysis controls">
        <div className="searchBox">
          <MagnifyingGlass size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by path"
          />
        </div>
        <select
          aria-label="Filter by author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        >
          {authors.map((name) => (
            <option key={name} value={name}>
              {name === "all" ? "All authors" : name}
            </option>
          ))}
        </select>
        <div className="segmented" role="tablist" aria-label="View mode">
          {(["hotspots", "timeline", "route"] as const).map((item) => (
            <button
              key={item}
              className={mode === item ? "active" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {mode === "hotspots" ? <HotspotTable files={files} /> : null}
      {mode === "timeline" ? (
        <TimelineView
          report={report}
          snapshotIndex={snapshotIndex}
          setSnapshotIndex={setSnapshotIndex}
          snapshot={snapshot}
        />
      ) : null}
      {mode === "route" ? <ReadingRoute report={report} /> : null}
    </main>
  );
}

function Overview({ report }: { report: StratigraphyReport }) {
  return (
    <aside className="overview" aria-label="Repository summary">
      <Metric
        icon={<GitCommit size={22} />}
        label="Commits"
        value={report.commitCount}
      />
      <Metric
        icon={<GitBranch size={22} />}
        label="Renames"
        value={report.renameCount}
      />
      <Metric
        icon={<FileCode size={22} />}
        label="Hotspots"
        value={report.hotspots.length}
      />
      <Metric
        icon={<ShieldCheck size={22} />}
        label="Emails masked"
        value="on"
      />
    </aside>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HotspotTable({ files }: { files: FileScore[] }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>Hotspot Ranking</h2>
        <p>{files.length} files match the active filters.</p>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Path</th>
              <th>Hotspot</th>
              <th>Fragility</th>
              <th>Changes</th>
              <th>Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.path}>
                <td className="pathCell">{file.path}</td>
                <td>{file.hotspotScore}</td>
                <td>{file.fragilityScore}</td>
                <td>{file.changes}</td>
                <td>{file.rationale[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TimelineView({
  report,
  snapshotIndex,
  setSnapshotIndex,
  snapshot,
}: {
  report: StratigraphyReport;
  snapshotIndex: number;
  setSnapshotIndex: (value: number) => void;
  snapshot: StratigraphyReport["snapshots"][number];
}) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>Directory Timeline</h2>
        <p>
          {snapshot?.shortHash ?? "none"} at{" "}
          {snapshot
            ? new Date(snapshot.authoredAt).toLocaleDateString()
            : "no snapshot"}
        </p>
      </div>
      <input
        aria-label="Timeline snapshot"
        className="slider"
        type="range"
        min={0}
        max={Math.max(0, report.snapshots.length - 1)}
        value={snapshotIndex}
        onChange={(event) => setSnapshotIndex(Number(event.target.value))}
      />
      {snapshot ? (
        <Treemap tree={snapshot.tree} />
      ) : (
        <p>No snapshots available.</p>
      )}
    </section>
  );
}

function Treemap({ tree }: { tree: TreeNode }) {
  const leaves = useMemo(() => {
    const hierarchy = d3
      .hierarchy(tree)
      .sum((node) =>
        node.type === "file" ? Math.max(1, node.hotspotScore ?? 1) : 0,
      )
      .sort((left, right) => (right.value ?? 0) - (left.value ?? 0));
    return d3
      .treemap<TreeNode>()
      .size([960, 360])
      .paddingInner(5)
      .paddingOuter(2)(hierarchy)
      .leaves();
  }, [tree]);

  return (
    <svg
      className="treemap"
      viewBox="0 0 960 360"
      role="img"
      aria-label="Directory tree hotspot treemap"
    >
      {leaves.map((leaf) => (
        <g key={leaf.data.path}>
          <rect
            x={leaf.x0}
            y={leaf.y0}
            width={leaf.x1 - leaf.x0}
            height={leaf.y1 - leaf.y0}
            rx={6}
            fill={`hsl(190 72% ${Math.max(25, 78 - (leaf.data.hotspotScore ?? 0) / 4)}%)`}
          />
          <text x={leaf.x0 + 10} y={leaf.y0 + 22}>
            {leaf.data.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ReadingRoute({ report }: { report: StratigraphyReport }) {
  return (
    <section className="routeList">
      {report.readingRoute.map((step) => (
        <article className="routeItem" key={step.path}>
          <h2>{step.title}</h2>
          <p className="pathCell">{step.path}</p>
          <p>{step.reason}</p>
          <div className="chips">
            {step.relatedFiles.map((file) => (
              <span key={file}>{file}</span>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function download(name: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
