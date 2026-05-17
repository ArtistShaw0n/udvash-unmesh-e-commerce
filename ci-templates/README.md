# CI templates

GitHub Actions can't be created by a Personal Access Token that lacks
`workflow` scope. The CI pipeline lives here as a template instead.

## Activate

```bash
mkdir -p .github/workflows
cp ci-templates/github-actions-ci.yml .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "Enable CI"
git push        # requires a token with `workflow` scope, or push from the GitHub web UI
```

The pipeline runs on every PR + push to `main`:
- Job 1: `lint → typecheck → unit tests` (Vitest)
- Job 2: `next build` (needs Job 1)
- Job 3: `Playwright E2E` (needs Job 2)

Concurrency `cancel-in-progress` so a rebase replaces in-flight runs.
