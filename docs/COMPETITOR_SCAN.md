# Competitor Scan

Scan date: 2026-07-18

GitHub identity check confirmed `KanadeK` before searching. Exact `Repo Stratigrapher` and `repo-stratigrapher` searches returned no repositories. `KanadeK/repo-stratigrapher` did not exist at precheck time. A later GitHub search pass hit an API rate-limit 403, so the scan combines successful GitHub CLI output with public web results.

## Relevant Public Projects

| Project                     | URL                                                       |              Stars | Updated                  | Main Function                                                  | Overlap                               | Difference                                                                                               |
| --------------------------- | --------------------------------------------------------- | -----------------: | ------------------------ | -------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Code Maat                   | https://github.com/adamtornhill/code-maat                 |               2611 | 2026-07-14               | Mines VCS data for behavioral code analysis                    | High for history metrics and coupling | Repo Stratigrapher adds browser timeline replay, fixture-first TS stack, and reading-route reports       |
| maat-scripts                | https://github.com/adamtornhill/maat-scripts              |                 84 | 2026-05-05               | Post-processes Code Maat output                                | Medium                                | Companion scripts rather than standalone interactive app                                                 |
| peternorrhall/code-maat     | https://github.com/peternorrhall/code-maat                |                 17 | 2025-06-13               | Docker packaging for Code Maat                                 | Low                                   | Packaging wrapper, no new UI or report route                                                             |
| your-code-as-a-crime-scene  | https://github.com/thiagoghisi/your-code-as-a-crime-scene |                 15 | 2025-11-06               | Tutorial and template for Code Maat analysis                   | Medium                                | Educational template rather than local-first React tool                                                  |
| docker-code-maat            | https://github.com/philips-software/docker-code-maat      |                  6 | 2026-06-08               | Code Maat Docker images                                        | Low                                   | Container packaging, not visualization                                                                   |
| CodeComplexityTrendAnalyzer | https://github.com/josiahdj/CodeComplexityTrendAnalyzer   |                  5 | 2025-11-18               | Complexity trend analysis around Code Maat                     | Medium                                | Focuses complexity trends rather than directory replay and contributor route                             |
| gradle-codemaat-plugin      | https://github.com/adamtornhill/gradle-codemaat-plugin    |                  3 | 2025-06-13               | Gradle plugin for Code Maat                                    | Low                                   | Build integration only                                                                                   |
| code-isfet                  | https://github.com/uzilan/code-isfet                      |                  1 | 2021-02-16               | Code Maat visualization                                        | Medium                                | Older visualization over Code Maat output                                                                |
| githubocto/repo-visualizer  | https://github.com/githubocto/repo-visualizer             |               1287 | 2026 sampled metadata    | GitHub Action that generates SVG repository structure diagrams | Medium                                | Visualizes file structure, not Git evolution, failures, or reading route                                 |
| Gource                      | https://github.com/acaudwell/Gource                       | Not sampled by CLI | Public project           | Animated source control visualization                          | Medium                                | Strong history animation, but not hotspot scoring or Markdown/JSON onboarding reports                    |
| CodeScene                   | https://codescene.io/docs                                 |         Commercial | Public docs updated 2026 | Hotspots, coupling, code health, and architectural analysis    | High conceptually                     | Hosted/commercial analysis; Repo Stratigrapher is small, local-first, and synthetic-fixture reproducible |
| Rassam                      | https://rassam.dev/                                       |  0 in sampled page | 2026 page                | Editable architecture graph with AI chat                       | Medium                                | Architecture graph and AI workflow rather than Git stratigraphy                                          |

## Naming Decision

The final name remains `Repo Stratigrapher` and the repository slug remains `repo-stratigrapher`.

## Differentiation

No active sampled project combined all MVP elements: local Git import, rename-aware history parsing, hotspot and fragility scoring, failure telemetry, directory timeline replay, new contributor reading route, Markdown/JSON export, and deterministic fixture generation inside a React/Vite TypeScript project.
