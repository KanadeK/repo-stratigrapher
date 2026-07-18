# Contributing

Thanks for considering a contribution to Repo Stratigrapher.

## Development

```bash
npm ci
npm run fixture
npm run verify
```

Keep domain logic in `src/core/` when possible. Put file system, Git, browser, and cache integration in `src/adapters/`, `src/workers/`, or feature-specific UI code.

## Pull Requests

- Include tests for behavior changes.
- Keep reports local-first and deterministic.
- Do not commit generated fixture repositories, `node_modules`, coverage, local caches, or release artifacts unless the release process asks for them.
- Do not include `Co-authored-by` trailers unless every listed contributor explicitly participated.

## Commit Identity

Use your own Git identity. Maintainers verify author and committer attribution before release.
