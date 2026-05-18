#!/usr/bin/env node
/**
 * Pixel-diff Figma baseline vs live render.
 *
 *   npm run audit:figma:pixel              # against http://localhost:3000
 *   AUDIT_URL=https://… npm run audit:figma:pixel
 *
 * For each `baselineByRoute` entry below, captures a full-page screenshot
 * of the live route at the `figma` viewport (1920×N), scales the Figma
 * baseline PNG to the same width, and pixelmatches them. Any region with
 * >~2% pixel diff is highlighted in the output diff PNG.
 *
 * Outputs:
 *   reports/pixel-diff/<route-slug>/
 *     baseline.png   (Figma source, scaled to live width)
 *     live.png       (the actual rendered page)
 *     diff.png       (red pixels where they differ)
 *     summary.json   (diff ratio, region breakdown)
 *
 * Exit code: 0 if every route diff is below threshold, 1 otherwise.
 *
 * Adding new routes:
 *   1. Capture a Figma node screenshot via the MCP get_screenshot tool
 *      at maxDimension=1920 or higher; download the PNG.
 *   2. Save it under scripts/figma-audit/baselines/<route-slug>-figma.png
 *   3. Add an entry to `baselineByRoute` below.
 */

import { chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_DIR = join(__dirname, "baselines");
const REPORT_DIR = join(__dirname, "../../reports/pixel-diff");

/**
 * Per-route diff config. `liveWidth` is the viewport width the live
 * capture runs at; the baseline is rescaled to match. `threshold` is
 * the pixelmatch per-pixel sensitivity (0..1, lower = stricter).
 * `failAt` is the maximum fraction of differing pixels we accept
 * before failing CI.
 */
const baselineByRoute = [
  {
    route: "/",
    slug: "home",
    baseline: "home-figma.png",
    liveWidth: 1920,
    threshold: 0.15,
    // Home page has lots of stock photo / placeholder differences from
    // the Figma export (different book cover art, different review
    // names, etc). Accept up to 25% pixel diff and rely on per-element
    // checks in audit.mjs for the precise structure.
    failAt: 0.25,
  },
];

function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
}

async function captureLive(url, width) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  // Wait an extra beat for fonts / async images.
  await page.waitForTimeout(800);
  const buf = await page.screenshot({ fullPage: true, type: "png" });
  await browser.close();
  return buf;
}

async function resizeToWidth(pngBuffer, targetWidth) {
  // Use sharp to resize, preserving aspect.
  return sharp(pngBuffer).resize({ width: targetWidth }).png().toBuffer();
}

async function diffOne(entry, baseUrl) {
  const baselinePath = join(BASELINE_DIR, entry.baseline);
  if (!existsSync(baselinePath)) {
    return { ok: false, reason: `baseline missing: ${baselinePath}` };
  }

  const outDir = join(REPORT_DIR, entry.slug);
  mkdirSync(outDir, { recursive: true });

  // 1. Capture live page
  const url = baseUrl + entry.route;
  console.log(`[pixel-diff] capturing live: ${url}`);
  const liveBuf = await captureLive(url, entry.liveWidth);
  writeFileSync(join(outDir, "live.png"), liveBuf);

  // 2. Resize baseline to match live width
  const baselineRaw = readFileSync(baselinePath);
  const liveMeta = await sharp(liveBuf).metadata();
  const baselineScaled = await sharp(baselineRaw)
    .resize({ width: liveMeta.width })
    .png()
    .toBuffer();

  // 3. The two PNGs may differ in height (live page = however tall the
  //    content actually is; Figma export = whatever the design frame
  //    was). Crop both to the smaller height so pixelmatch can compare.
  const baselineMeta = await sharp(baselineScaled).metadata();
  const compareHeight = Math.min(liveMeta.height, baselineMeta.height);
  const livePNG = PNG.sync.read(
    await sharp(liveBuf)
      .extract({ left: 0, top: 0, width: liveMeta.width, height: compareHeight })
      .png()
      .toBuffer(),
  );
  const basePNG = PNG.sync.read(
    await sharp(baselineScaled)
      .extract({ left: 0, top: 0, width: liveMeta.width, height: compareHeight })
      .png()
      .toBuffer(),
  );

  writeFileSync(join(outDir, "baseline.png"), PNG.sync.write(basePNG));

  // 4. pixelmatch
  const diffPNG = new PNG({ width: liveMeta.width, height: compareHeight });
  const diffPixels = pixelmatch(
    basePNG.data,
    livePNG.data,
    diffPNG.data,
    liveMeta.width,
    compareHeight,
    { threshold: entry.threshold, diffMask: false, alpha: 0.4 },
  );
  writeFileSync(join(outDir, "diff.png"), PNG.sync.write(diffPNG));

  const totalPixels = liveMeta.width * compareHeight;
  const diffRatio = diffPixels / totalPixels;

  const summary = {
    route: entry.route,
    liveWidth: liveMeta.width,
    liveHeight: liveMeta.height,
    baselineWidth: baselineMeta.width,
    baselineHeight: baselineMeta.height,
    comparedHeight: compareHeight,
    totalPixels,
    diffPixels,
    diffRatio,
    threshold: entry.threshold,
    failAt: entry.failAt,
    passed: diffRatio < entry.failAt,
  };

  writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  return { ok: true, summary, outDir };
}

async function main() {
  const baseUrl = process.env.AUDIT_URL || "http://localhost:3000";
  console.log(`\n[pixel-diff] base URL: ${baseUrl}`);
  console.log(`[pixel-diff] routes: ${baselineByRoute.map((b) => b.route).join(", ")}\n`);

  let failed = 0;
  const summaries = [];

  for (const entry of baselineByRoute) {
    const result = await diffOne(entry, baseUrl);
    if (!result.ok) {
      console.error(`[pixel-diff] ${entry.route}: ${result.reason}`);
      failed++;
      continue;
    }
    summaries.push(result.summary);
    const s = result.summary;
    const pct = (s.diffRatio * 100).toFixed(2);
    const status = s.passed ? "PASS" : "FAIL";
    console.log(
      `[pixel-diff] ${entry.route}: ${status} — ${pct}% pixels differ (limit ${(s.failAt * 100).toFixed(0)}%) — ${result.outDir}`,
    );
    if (!s.passed) failed++;
  }

  // Roll-up report
  const reportLines = [];
  reportLines.push(`# Pixel-diff report`);
  reportLines.push("");
  reportLines.push(`- base URL: \`${baseUrl}\``);
  reportLines.push(`- routes: ${summaries.length}`);
  reportLines.push("");
  reportLines.push("| route | size | diff % | limit | result |");
  reportLines.push("|---|---|---|---|---|");
  for (const s of summaries) {
    const pct = (s.diffRatio * 100).toFixed(2);
    const limit = (s.failAt * 100).toFixed(0);
    reportLines.push(
      `| \`${s.route}\` | ${s.liveWidth}×${s.comparedHeight} | ${pct}% | ${limit}% | ${s.passed ? "PASS" : "**FAIL**"} |`,
    );
  }
  writeFileSync(join(REPORT_DIR, "summary.md"), reportLines.join("\n"));
  console.log(`\n[pixel-diff] roll-up summary: ${REPORT_DIR}/summary.md`);

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
