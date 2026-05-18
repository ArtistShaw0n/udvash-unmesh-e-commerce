#!/usr/bin/env node
/**
 * Figma audit runner.
 *
 *   npm run audit:figma              # full run against http://localhost:3000
 *   AUDIT_URL=https://… npm run audit:figma   # against a live deploy
 *
 * Loads `registry.ts`, navigates each route at the Figma reference
 * viewport (1920×1080), reads computed style + bounding-rect for every
 * registered selector, and emits a markdown diff table to stdout +
 * `reports/figma-audit-<timestamp>.md`.
 *
 * Exit code:
 *   0  if every expectation matched within tolerance
 *   1  if any mismatch was found
 *
 * Loading the TS registry: we shell out to `tsx` (already a dev-dep via
 * Next's pipeline) by importing the .ts file directly. If your env
 * doesn't have it, fall back to compiling to .mjs.
 */

import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require_ = createRequire(import.meta.url);

// ---------- Registry load (TS via tsx loader) ----------
async function loadRegistry() {
  // Register tsx so we can import the .ts directly.
  try {
    require_("tsx/cjs");
  } catch {
    // tsx not installed — try via esbuild-register
    try {
      require_("esbuild-register/dist/node").register();
    } catch {
      console.error(
        "[audit] Need either `tsx` or `esbuild-register` installed to load registry.ts.\n" +
          "         Run: npm install --save-dev tsx",
      );
      process.exit(2);
    }
  }
  const mod = require_(join(__dirname, "registry.ts"));
  return {
    entries: mod.registry,
    viewports: mod.VIEWPORTS,
    resolveTolerance: mod.resolveTolerance,
    routeSetups: mod.routeSetups || [],
  };
}

// ---------- Helpers ----------
function rgbToHex(rgb) {
  if (!rgb) return null;
  // Detect fully-transparent backgrounds (rgba(?,?,?,0)) so we don't
  // mistake them for #000000.
  const rgba = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (!rgba) return rgb;
  const [, r, g, b, a] = rgba;
  const alpha = a === undefined ? 1 : parseFloat(a);
  if (alpha === 0) return "(transparent)";
  return (
    "#" +
    [r, g, b].map((c) => Number(c).toString(16).padStart(2, "0")).join("")
  );
}

function withinTol(actual, expected, tol) {
  if (actual === undefined || actual === null) return false;
  if (typeof expected === "string") {
    return String(actual).toLowerCase() === expected.toLowerCase();
  }
  return Math.abs(Number(actual) - Number(expected)) <= tol;
}

// ---------- Probe ----------
async function probe(page, selector) {
  // Returns the computed style + bounding rect, or null if not found.
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      fontFamily: cs.fontFamily,
      fontSize: parseFloat(cs.fontSize),
      fontWeight: parseInt(cs.fontWeight, 10),
      lineHeight: cs.lineHeight === "normal" ? null : parseFloat(cs.lineHeight),
      borderRadius: parseFloat(cs.borderTopLeftRadius),
      w: Math.round(r.width),
      h: Math.round(r.height),
      x: Math.round(r.left),
      y: Math.round(r.top),
    };
  }, selector);
}

// ---------- Main ----------
async function main() {
  const baseUrl = process.env.AUDIT_URL || "http://localhost:3000";
  const { entries, viewports, resolveTolerance, routeSetups } = await loadRegistry();
  const setupByRoute = new Map(routeSetups.map((s) => [s.route, s]));

  // Allow narrowing via env var: AUDIT_VIEWPORTS=mobile,desktop
  const wanted = (process.env.AUDIT_VIEWPORTS || "mobile,tablet,desktop,figma")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => viewports[s]);

  console.log(`\n[audit] base URL: ${baseUrl}`);
  console.log(`[audit] viewports: ${wanted.join(", ")}`);
  console.log(`[audit] ${entries.length} registered entries × ${wanted.length} viewports\n`);

  const browser = await chromium.launch();

  // Group entries by route to minimise navigations
  const byRoute = new Map();
  for (const e of entries) {
    if (!byRoute.has(e.route)) byRoute.set(e.route, []);
    byRoute.get(e.route).push(e);
  }

  const rows = [];
  let failCount = 0;
  let passCount = 0;
  let skipCount = 0;

  for (const vpName of wanted) {
    const viewport = viewports[vpName];
    console.log(`\n[audit] ─── viewport: ${vpName} (${viewport.width}×${viewport.height}) ───`);

    for (const [route, items] of byRoute) {
      const url = baseUrl + route;
      const setup = setupByRoute.get(route);
      const routeCtx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
      if (setup) {
        await routeCtx.addInitScript({ content: setup.initScript });
      }
      const routePage = await routeCtx.newPage();
      try {
        await routePage.goto(url, { waitUntil: "networkidle", timeout: 15_000 });
      } catch (e) {
        console.error(`[audit]   ${route} (${vpName}): load failed — ${e.message}`);
        for (const item of items) {
          if (item.skipOn?.includes(vpName)) {
            skipCount++;
            continue;
          }
          rows.push({ ...item, viewport: vpName, status: "load-fail", actual: null });
          failCount++;
        }
        await routeCtx.close();
        continue;
      }

      for (const item of items) {
        if (item.skipOn?.includes(vpName)) {
          skipCount++;
          continue;
        }
        // Merge byViewport overrides on top of default expectations
        const expectedMerged = { ...item.expected, ...(item.byViewport?.[vpName] || {}) };
        const actual = await probe(routePage, item.selector);
        if (!actual) {
          rows.push({ ...item, viewport: vpName, status: "missing", actual: null });
          failCount++;
          continue;
        }
        const diffs = [];
        for (const [key, expectedVal] of Object.entries(expectedMerged)) {
          const actualVal =
            key === "bg" || key === "color"
              ? rgbToHex(actual[key])
              : actual[key];
          const tol = resolveTolerance(item, key);
          if (!withinTol(actualVal, expectedVal, tol)) {
            diffs.push({ key, expected: expectedVal, actual: actualVal, tol });
          }
        }
        const status = diffs.length === 0 ? "pass" : "fail";
        if (status === "fail") failCount++;
        else passCount++;
        rows.push({ ...item, viewport: vpName, status, actual, diffs });
      }
      await routeCtx.close();
    }
  }

  await browser.close();
  console.log(`\n[audit] summary: ${passCount} passed, ${failCount} failed, ${skipCount} skipped\n`);

  // ---------- Reporting ----------
  const reportLines = [];
  reportLines.push(`# Figma audit report`);
  reportLines.push("");
  reportLines.push(`- base URL: \`${baseUrl}\``);
  reportLines.push(`- viewports tested: ${wanted.join(", ")}`);
  reportLines.push(`- checks: ${rows.length + skipCount}`);
  reportLines.push(`- passed: ${passCount}`);
  reportLines.push(`- skipped: ${skipCount}`);
  reportLines.push(`- failed: ${failCount}`);
  reportLines.push("");

  const fails = rows.filter((r) => r.status !== "pass");
  if (fails.length === 0) {
    reportLines.push(`**All checks passed.**`);
  } else {
    reportLines.push(`## Failures`);
    reportLines.push("");
    reportLines.push(
      "| viewport | route | node | description | property | expected | actual |",
    );
    reportLines.push("|---|---|---|---|---|---|---|");
    for (const r of fails) {
      if (r.status === "missing") {
        reportLines.push(
          `| ${r.viewport} | \`${r.route}\` | ${r.figmaNodeId} | ${r.description} | — | (element found) | **missing** (selector \`${r.selector}\` not in DOM) |`,
        );
      } else if (r.status === "load-fail") {
        reportLines.push(
          `| ${r.viewport} | \`${r.route}\` | ${r.figmaNodeId} | ${r.description} | — | (page loads) | **load failed** |`,
        );
      } else {
        for (const d of r.diffs) {
          reportLines.push(
            `| ${r.viewport} | \`${r.route}\` | ${r.figmaNodeId} | ${r.description} | ${d.key} | \`${d.expected}\` | \`${d.actual}\` |`,
          );
        }
      }
    }
  }

  reportLines.push("");
  reportLines.push("## All probed values (for cross-check)");
  reportLines.push("");
  reportLines.push("<details><summary>expand</summary>");
  reportLines.push("");
  reportLines.push("| viewport | route | node | bg | w | h | font | radius |");
  reportLines.push("|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    if (!r.actual) continue;
    reportLines.push(
      `| ${r.viewport} | \`${r.route}\` | ${r.figmaNodeId} | ${rgbToHex(r.actual.bg) || "-"} | ${r.actual.w} | ${r.actual.h} | ${r.actual.fontSize}/${r.actual.fontWeight} | ${r.actual.borderRadius} |`,
    );
  }
  reportLines.push("");
  reportLines.push("</details>");

  const reportText = reportLines.join("\n");

  // Stdout
  console.log(reportText);

  // Persist
  const reportsDir = join(__dirname, "../../reports");
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const reportFile = join(reportsDir, `figma-audit-${ts}.md`);
  writeFileSync(reportFile, reportText, "utf8");
  console.log(`\n[audit] report written to ${reportFile}`);

  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
