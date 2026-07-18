# Release Checklist

## Local Gates

- `npm ci`
- `npm run lint`
- `npm run format`
- `npm run typecheck`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run build`
- `npm run package`
- `make verify`
- `make demo`
- `make package`
- `make release-check`
- `git diff --check`
- `git status --short`

## Identity Gates

- `gh auth status` shows `KanadeK`
- `gh api user --jq '{login: .login, id: .id}'` returns login `KanadeK`
- Local `user.name` is `KanadeK`
- Local `user.email` is `121669563+KanadeK@users.noreply.github.com`
- All pushed author and committer entries match that identity
- No `Co-authored-by` trailers exist

## Remote Gates

- `origin` is `https://github.com/KanadeK/repo-stratigrapher.git`
- Local `main`, `origin/main`, and GitHub API default branch SHA match
- CI is green
- Pages deploys through official artifact actions
- Pages returns HTTP 200 for the app and static assets
- `v0.1.0` targets the same SHA as `main`
- Release assets match `SHA256SUMS.txt`
- Contributors API lists only `KanadeK` for the initial code release
