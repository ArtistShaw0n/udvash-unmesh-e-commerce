import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated accessibility audit using axe-core. We enforce zero
 * "serious" or "critical" violations on the public-facing critical
 * paths. "Moderate" and below are allowed for now — track and fix
 * over time.
 */

const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/products/udvash-physics-parallel-text-hsc-2026",
  "/cart",
  "/login",
  "/signup",
  "/orders/track",
  "/help",
  "/contact",
];

for (const path of PUBLIC_ROUTES) {
  test(`a11y: no serious/critical violations on ${path}`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    if (seriousOrCritical.length > 0) {
      // Surface every violation so the report is actionable
      // eslint-disable-next-line no-console
      console.log(
        "Violations on",
        path,
        seriousOrCritical.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.slice(0, 3).map((n) => n.target),
        })),
      );
    }
    expect(seriousOrCritical, `${path} has accessibility violations`).toEqual([]);
  });
}
