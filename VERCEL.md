# Deploying to Vercel

The project is Vercel-ready out of the box. Next.js 16 + Prisma 6 +
Neon Postgres is Vercel's native stack — no special workarounds.

## One-time setup (≈5 min)

### 1. Connect the repo

1. Sign in at https://vercel.com (use the same email as your Neon
   account if you can — makes the integrations panel cleaner).
2. **Add New… → Project → Import Git Repository**.
3. Pick this repo. Vercel auto-detects Next.js — leave Framework
   Preset as **Next.js**, don't override the build settings (the
   committed `vercel.json` handles them).

### 2. Set environment variables

In the import flow Vercel will show an "Environment Variables"
section. Add these **before** the first deploy — otherwise the build
will fail when `prisma migrate deploy` runs.

| Variable | Value | Where to get it |
|---|---|---|
| `DATABASE_URL` | Neon **pooled** URL (the one with `-pooler` in the hostname) — add `?pgbouncer=true&connect_timeout=10` if your copied URL doesn't have it | Neon dashboard → Connection details → **"Pooled connection"** toggle on |
| `DIRECT_URL` | Same Neon URL but with the `-pooler` segment removed | Neon dashboard → Connection details → "Pooled connection" toggle off |
| `AUTH_SECRET` | 32+ random chars | Generate: `openssl rand -base64 32` |
| `ADMIN_EMAILS` | `your-email@example.com,coworker@example.com` | comma-separated, whitespace OK |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` (or your custom domain) | optional but recommended for OG tags |

Apply to **Production**, **Preview**, and **Development** (Vercel's
checkboxes). The Preview env lets your PR deploys hit the same Neon
DB — if you'd rather isolate previews, point preview's
`DATABASE_URL` at a Neon **branch** of the prod DB (Neon branches
are instant + free).

### 3. Deploy

Click **Deploy**. Watch the build log:

- `npm install` → triggers `postinstall: prisma generate` → Prisma
  client generated against the committed schema.
- `npm run build:prod` → runs `prisma migrate deploy` (applies any
  pending migrations from `prisma/migrations/`) → then
  `next build`.
- Vercel uploads the build → assigns a `.vercel.app` URL.

First build takes ~3-5 min. Subsequent builds ~1-2 min thanks to
Vercel's caching.

## What's wired in `vercel.json`

```json
{
  "buildCommand": "npm run build:prod",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

- **`buildCommand`** — `npm run build:prod` = `prisma migrate deploy
  && next build`. Schema changes ship with the commit; zero manual
  SQL on deploy.
- **`installCommand`** — keep as `npm install` (not `npm ci`) so the
  `postinstall: prisma generate` script always fires. `npm ci`
  sometimes skips lifecycle scripts depending on the lockfile.
- **`regions: ["iad1"]`** — US East (Washington DC), same region as
  default Neon `us-east-1`. Cuts Prisma round-trip latency from ~80ms
  cross-region to ~5ms same-region. Change if your DB region moves.
  Available codes: https://vercel.com/docs/edge-network/regions
- **`functions.maxDuration: 30`** — Hobby plan default is 10s; Prisma
  cold-starts + first query can flirt with that. 30s gives headroom.
  Bump to 60+ on Pro if cart/checkout ever times out.

## Continuous deployment

Once connected, every push to `main` → production deploy. Every PR →
preview deploy with its own URL.

### Schema changes

```bash
# 1. Edit prisma/schema.prisma locally
# 2. Generate the migration
npm run db:migrate -- --name <describe-the-change>
# 3. Commit BOTH schema.prisma AND the new prisma/migrations/ folder
git add prisma/
git commit -m "schema: <describe>"
# 4. Push — Vercel auto-applies via `prisma migrate deploy`
git push
```

### Rolling back

Vercel keeps every deploy. If a deploy goes bad:

1. Vercel dashboard → Deployments → find the last green one →
   **"Promote to Production"**.

That handles the code rollback. If the bad deploy also applied a
migration, you'll need a follow-up commit that reverts the schema
(Prisma doesn't auto-down-migrate — that's by design).

## Branch + preview strategy

The typical safe-on-prod flow:

| Branch | Vercel env | Neon DB |
|---|---|---|
| `main` | Production | Neon prod branch |
| `feature/*` | Preview | Neon `dev` branch (free, instant) |

To wire it: in Vercel → Settings → Environment Variables → set
`DATABASE_URL` separately for **Preview** to point at the Neon dev
branch URL. Production keeps the prod URL.

## Differences from the Netlify setup (`netlify.toml`)

Both configs are committed in this repo. They don't conflict — each
host only reads its own file.

| Concern | Vercel | Netlify |
|---|---|---|
| Build command | `vercel.json → buildCommand` | `netlify.toml → [build] command` |
| Node version | Default (matches package.json `engines`) | Pinned to 22 in `netlify.toml` |
| Next.js plugin | Native first-class | `@netlify/plugin-nextjs` (added in `netlify.toml`) |
| Region | `iad1` (pinned in vercel.json) | Netlify decides per-CDN |
| Serverless fn timeout | 30s here; 10s default Hobby | 10s default; up to 26s |
| Edge runtime support | Native | Via plugin |

If you commit to one host long-term, delete the other config.

## Troubleshooting

**Build fails with `Environment variable not found: DATABASE_URL`**
→ env vars weren't added before the first deploy. Set them in
Vercel → Project Settings → Environment Variables, then redeploy.

**Build fails with `P3009 — migrate found failed migration`**
→ A previous deploy partially applied a migration. Fix locally:
`npm run db:reset` (dev only — wipes data) or manually edit Neon
to mark the failed migration as resolved, then redeploy.

**Runtime errors `Prisma needs to know which database engine`**
→ `postinstall: prisma generate` didn't run. Check that
`installCommand` is `npm install`, not `npm ci`.

**Slow first request after deploy** → expected. Cold-start +
Prisma client init + first DB connection ≈ 800ms-2s. Subsequent
requests on the same warm function are sub-100ms.
