# Privacy And Security

Repo Stratigrapher is designed for local repository understanding.

## Defaults

- The CLI reads only the repository path passed with `--repo`.
- Reports are written only to the directory passed with `--out`.
- Commit emails are masked in generated reports by default.
- Common token patterns are redacted in commit subjects and other text passed through privacy helpers.
- The Pages demo contains synthetic repository data only.

## Data Not Collected

Repo Stratigrapher does not collect analytics, upload source code, or send repository content to a hosted service.

## User Responsibility

Reports can still contain file paths, author display names, commit subjects, and directory names. Review reports before publishing them outside your team.

## CI And Pages

GitHub Pages deploys static build artifacts through official Pages actions. Workflows do not commit generated files back to `main`.
