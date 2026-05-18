# Figma audit

A scripted check that the rendered site matches the Figma source — section by section, element by element. Built because eyeball-and-spot-fix kept missing real divergences (the search bar was 40px narrower than Figma for weeks; the home page sections were all rendering cream when Figma actually alternates white/cream bands; etc).

## How to use

```bash
# Default: against http://localhost:3000
npm run audit:figma

# Against a live deployment
AUDIT_URL=https://udvash-unmesh-e-commerce.vercel.app npm run audit:figma

# Against the dev server on a non-default port
AUDIT_URL=http://localhost:3003 npm run audit:figma
```

The runner:
1. Loads `registry.ts` — the canonical list of `{route, figmaNodeId, selector, expected}` entries.
2. Boots a headless Chromium at **1920×1080** (the Figma reference viewport).
3. For each entry, navigates to the route and reads `getComputedStyle()` + `getBoundingClientRect()` of the matching DOM element.
4. Diffs against `expected` with per-property tolerances.
5. Prints a markdown report to stdout AND writes a timestamped copy to `reports/figma-audit-<ISO>.md`.
6. Exits non-zero if any failure was found.

## Adding new audit entries

1. **Pixel-sample the Figma node** to find its true outer fill. `get_design_context`'s structured metadata sometimes mislabels a band when a prominent child paints differently — pixel-sampling the corners of the rendered Figma PNG is the source of truth.
2. **Wire `data-figma-id="<nodeId>"`** to the corresponding DOM element in the component. `data-*` attrs survive class renames and don't affect styling.
3. **Add a row to `registry.ts`** with `route`, `figmaNodeId`, `selector`, `description`, and an `expected` object containing any subset of `{bg, color, w, h, x, y, fontFamily, fontSize, fontWeight, lineHeight, borderRadius}`.
4. **Set tolerances** for sub-pixel/rounding noise. Defaults: `w/h/x/y ± 2px`, `fontSize ± 0.5`, `lineHeight ± 1`. Overrides go in the entry's `tolerance` field.
5. **Run `npm run audit:figma`** and verify the new entry passes (or document the divergence).

## When to run

- Before flagging a page as "Figma-aligned" — don't trust eyeballing.
- After any palette / spacing / typography token change.
- After a Figma update on a registered section.
- As a pre-commit / CI gate (add to `.husky/pre-commit` or GitHub Action).

## What it catches

- Wrong section background (e.g. cream where Figma wants white)
- Wrong element width / height (the search-bar bug)
- Wrong border-radius / typography size / line-height
- Wrong text or background colour
- Missing element (selector not in DOM)

## What it doesn't catch (yet)

- **Spacing between elements** (gaps, margins). Add `x` / `y` checks per element if you need this — currently only a few entries use them.
- **Visual regressions** (e.g. an icon shifted 10px to the right but everything else still matches dimensions). Pixel-diff against Figma PNG exports is the next layer — Playwright can capture and `pixelmatch` can diff. Not yet wired up.
- **Hover / focus states.** Add separate entries with `:hover` simulated via `page.hover()` if you need this.
- **Mobile / tablet viewports.** Right now the runner only checks 1920. Adding multi-viewport support is a config change in `audit.mjs`.

## Architecture decisions

- **Playwright over Puppeteer** because it's already a dep (`@playwright/test`).
- **`tsx` loader** for the TS registry so we don't need a separate build step.
- **Markdown report** is easy to paste into PRs / issues; the file persists for history.
- **`data-figma-id` attribute** because it survives class renames AND is invisible to users / tools that don't care.
- **Tolerance per property** because sub-pixel rounding is real and shouldn't fail CI.
