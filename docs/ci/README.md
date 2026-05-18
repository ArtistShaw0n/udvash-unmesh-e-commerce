# CI templates

GitHub Actions workflow templates that need to be installed manually because the bot's PAT doesn't have `workflow` scope.

## To install

```bash
mkdir -p .github/workflows
cp docs/ci/figma-audit.yml.template .github/workflows/figma-audit.yml
git add .github/workflows/figma-audit.yml
git commit -m "ci: add figma-audit workflow"
git push   # pushes from your own account, which has workflow scope
```

## What's in here

- `figma-audit.yml.template` — runs `npm run audit:figma` (DOM-level)
  and `npm run audit:figma:pixel` (pixel-diff) on every PR + push to
  main. Builds the app, boots `next start`, audits, uploads
  `reports/` as a workflow artifact (retained 14 days).
