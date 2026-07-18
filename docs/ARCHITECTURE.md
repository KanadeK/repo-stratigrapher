# Architecture

Repo Stratigrapher separates deterministic analysis from IO and presentation.

## Layers

- `src/core/`: pure types, privacy helpers, scoring, tree construction, and report rendering.
- `src/adapters/`: Git parsing and SQL.js cache serialization.
- `src/workers/`: browser worker entry for heavy analysis.
- `src/App.tsx`: React interface for report inspection and export.
- `bin/` and `src/cli.ts`: CLI entrypoint for local repositories.
- `scripts/`: deterministic fixture generation, verification, packaging, and release checks.

## Data Flow

1. The CLI reads Git history through `simple-git`.
2. Optional failure telemetry is loaded from `.repo-stratigrapher/failures.json`.
3. The domain core computes file scores, coupling, snapshots, and a reading route.
4. Reports are written as Markdown and JSON.
5. The UI imports the JSON report and provides filtering, D3 timeline visualization, and exports.

## Scoring

Hotspot score combines commit touches, churn, and recency. Fragility score combines linked failures, renames, and coupling breadth. Every ranked file carries textual rationale so users can inspect why it appears.

## Determinism

The fixture generator fixes commit dates, authors, commit order, and failure records. Tests inject a fixed `now` date into scoring.
