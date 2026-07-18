# Repo Stratigrapher

[![CI](https://github.com/KanadeK/repo-stratigrapher/actions/workflows/ci.yml/badge.svg)](https://github.com/KanadeK/repo-stratigrapher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/KanadeK/repo-stratigrapher)](https://github.com/KanadeK/repo-stratigrapher/releases)

Repo Stratigrapher layers Git history, directory evolution, test failures, and file hotspots into an interactive code stratigraphy map. It helps maintainers, consultants, and new contributors understand how a repository evolved before they make changes.

![Repo Stratigrapher screenshot](docs/assets/screenshot.svg)

## Why It Exists

- Finds hotspot files from real commit churn, authorship, recency, rename, and failure data.
- Replays directory evolution as a timeline so structure changes are visible.
- Exports Markdown and JSON reports with a new contributor reading route.

## Quick Start

```bash
npm ci
npm run fixture
node bin/repo-stratigrapher.mjs analyze --repo examples/fixture-repo --out dist-demo
npm run dev
```

Open the local app and import `dist-demo/report.json`, or inspect `dist-demo/report.md` directly.

## Real Input To Output

```bash
npm run demo
```

The demo generates a deterministic synthetic Git repository with more than 20 commits, 3 renames, linked failure records, and repeated changes in the payment module. The report then ranks `src/payments/ledger.ts` and `src/payments/reconcile.ts` from real fixture history rather than static counts.

## Features

- Local Git import through `simple-git`
- Commit, author, path, rename, and numstat parsing
- Hotspot, fragility, recent activity, and change coupling scores
- Timeline snapshots of directory trees
- D3 treemap visualization in the browser UI
- Markdown and JSON report export
- SQLite-compatible cache serialization with SQL.js
- Web Worker entry for heavy browser analysis tasks
- Default email masking and secret redaction helpers

## Non Goals

- Repo Stratigrapher does not upload private repository contents.
- It does not replace full static analysis or security scanning.
- It does not use AI to infer architecture from source code.
- It does not commit generated Pages artifacts back to the repository.

## Architecture

The domain core lives in `src/core/` and can be tested without UI or network access. External IO lives in `src/adapters/`. The React interface in `src/App.tsx` consumes the same report shape produced by the CLI. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## CLI

```bash
node bin/repo-stratigrapher.mjs analyze --repo <path-to-git-repo> --out <output-dir>
node bin/repo-stratigrapher.mjs analyze --repo examples/fixture-repo --out dist-demo --path src/payments
```

Outputs:

- `report.md`
- `report.json`

## UI

Run:

```bash
npm run dev
```

The UI includes path filtering, author filtering, hotspot ranking, timeline replay, reading route inspection, and Markdown/JSON downloads.

## Sample Data

`scripts/generate_fixture_repo.mjs` creates `examples/fixture-repo/` locally. The generated repository is deterministic and uses `.example.test` identities. The fixture directory is ignored so its nested Git history is not uploaded as project history.

## Testing

```bash
npm run lint
npm run format
npm run typecheck
npm run test:coverage
npm run test:e2e
npm run build
npm run package
make verify
make demo
make package
make release-check
```

Core coverage is configured to require at least 80 percent line coverage for `src/core/` and `src/adapters/`.

## Privacy And Security

Repo Stratigrapher runs locally by default. It masks commit emails in generated reports, redacts common token shapes, and ships the Pages demo with synthetic data only. See [docs/PRIVACY_AND_SECURITY.md](docs/PRIVACY_AND_SECURITY.md).

## Status

Current release: `v0.1.0`.

## Adjacent Projects

Public repository sampling did not find an active project with the same name, slug, and highly similar MVP. Adjacent tools include Code Maat, CodeScene, Gource, GitHub repo-visualizer, and AI-oriented repo mappers. Repo Stratigrapher differentiates itself by combining local-first Git history parsing, directory replay, failure records, hotspot explanations, and reading-route export in one small TypeScript project. See [docs/COMPETITOR_SCAN.md](docs/COMPETITOR_SCAN.md).

## Roadmap

- Larger repository performance profiling
- Additional report importers for CI failure feeds
- More timeline layouts
- Optional branch comparison mode

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT. See [LICENSE](LICENSE).
