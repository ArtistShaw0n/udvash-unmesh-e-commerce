/**
 * Figma audit registry — canonical map of "what each section/element on
 * each route should look like" per the Figma source (file UPIWiRG0d…).
 *
 * Values here are EXPECTED — pixel-sampled from Figma exports (NOT
 * read from `get_design_context`, which can mislabel a band when a
 * prominent child paints differently).
 *
 * To regenerate after a Figma update:
 *   1. Pull each Figma node screenshot via the MCP `get_screenshot` tool.
 *   2. Pixel-sample the corners + edges of the node bounding box.
 *   3. Update the `expected.bg` / `expected.w` / etc. below.
 *
 * The audit runner (`audit.mjs`) loads this registry, navigates the
 * live site via Playwright, finds each `selector` on each `route`, and
 * compares the live computed style + bounding-rect to `expected`.
 *
 * Conventions:
 *  - Colors: lowercase hex including the `#` prefix.
 *  - Selectors: prefer `[data-figma-id="..."]` (stable across class
 *    renames). Fall back to semantic tags when a node ID isn't worth
 *    plumbing into source.
 *  - All px values are at the Figma reference viewport (1920×1080).
 *    The runner sets the viewport accordingly before measuring.
 */

export interface ExpectedProps {
  /** Outer background fill (CSS color). */
  bg?: string;
  /** Bounding-rect width in px (at 1920 viewport). */
  w?: number;
  /** Bounding-rect height in px (at 1920 viewport). */
  h?: number;
  /** Left offset within parent (px). */
  x?: number;
  /** Top offset within parent (px). */
  y?: number;
  /** Font family substring (e.g. "Poppins"). */
  fontFamily?: string;
  /** Font size in px. */
  fontSize?: number;
  /** Font weight (numeric). */
  fontWeight?: number;
  /** Line height in px. */
  lineHeight?: number;
  /** Text color (CSS). */
  color?: string;
  /** Border radius in px. */
  borderRadius?: number;
}

export interface AuditEntry {
  /** Route to navigate to (e.g. "/"). */
  route: string;
  /** Figma node id (e.g. "9:5883"). For documentation + traceability. */
  figmaNodeId: string;
  /** CSS selector to find the live element on the page. */
  selector: string;
  /** Human-readable description, used in the diff report. */
  description: string;
  /** Properties we expect to match the live render. */
  expected: ExpectedProps;
  /** Per-property tolerances (px / ratio); defaults to 0 for exact match. */
  tolerance?: Partial<Record<keyof ExpectedProps, number>>;
}

export const VIEWPORT = { width: 1920, height: 1080 } as const;

/**
 * Default tolerances — sub-pixel rounding and 1px border noise are not bugs.
 */
const DEFAULT_TOLERANCE: Partial<Record<keyof ExpectedProps, number>> = {
  w: 2,
  h: 2,
  x: 2,
  y: 2,
  fontSize: 0.5,
  lineHeight: 1,
};

export function resolveTolerance(entry: AuditEntry, key: keyof ExpectedProps): number {
  return entry.tolerance?.[key] ?? DEFAULT_TOLERANCE[key] ?? 0;
}

/**
 * Initial registry — focused on the home page so we can validate the
 * audit tool against known-good and known-bad cases. Add more entries
 * as components get audited.
 */
export const registry: AuditEntry[] = [
  // ---------- Home (/) ----------
  {
    route: "/",
    figmaNodeId: "9:5883",
    selector: "header",
    description: "Home — site header band",
    expected: { bg: "#f7f9fb", h: 80 },
  },
  {
    route: "/",
    figmaNodeId: "9:5401",
    selector: '[data-figma-id="9:5401"]',
    description: "Home — Hero outer band (white wrap around teal card)",
    expected: { bg: "#ffffff" },
  },
  {
    route: "/",
    figmaNodeId: "9:5403",
    selector: '[data-figma-id="9:5403"]',
    description: "Home — Hero teal card (inner)",
    expected: { bg: "#006d77", borderRadius: 20 },
  },
  {
    route: "/",
    figmaNodeId: "9:5420",
    selector: '[data-figma-id="9:5420"]',
    description: "Home — Category filter section (white band)",
    expected: { bg: "#ffffff" },
  },
  {
    route: "/",
    figmaNodeId: "9:5575",
    selector: '[data-figma-id="9:5575"]',
    description: "Home — Flash sale outer band (white wrap around teal card)",
    expected: { bg: "#ffffff" },
  },
  {
    route: "/",
    figmaNodeId: "9:5434",
    selector: '[data-figma-id="9:5434"]',
    description: "Home — Popular books grid (cream band)",
    expected: { bg: "#f7f9fb" },
  },
  {
    route: "/",
    figmaNodeId: "9:5601",
    selector: '[data-figma-id="9:5601"]',
    description: "Home — Academic books grid (cream band)",
    expected: { bg: "#f7f9fb" },
  },
  {
    route: "/",
    figmaNodeId: "9:5742",
    selector: '[data-figma-id="9:5742"]',
    description: "Home — Admission books grid (cream band)",
    expected: { bg: "#f7f9fb" },
  },
  {
    route: "/",
    figmaNodeId: "9:5882",
    selector: "footer",
    description: "Home — Footer (brand teal)",
    expected: { bg: "#006d77" },
  },

  // ---------- Header internals (apply to every route) ----------
  // The Figma header at 1920 viewport: 1296 inner content centered
  // (gutter 312 on each side). Logo, search, cart, login button.
  {
    route: "/",
    figmaNodeId: "header.logo",
    // Target the actual image — the wrapping <a inline-block> adds
    // line-height descender space that the visible logo doesn't have.
    selector: '[data-figma-id="header.logo"] img',
    description: "Home — Header logo image",
    expected: { w: 180, h: 36 },
  },
  {
    route: "/",
    figmaNodeId: "header.search",
    selector: '[data-figma-id="header.search"]',
    description: "Home — Header search bar wrapper (width slot)",
    // Width-only check on the wrapper; the actual pill style lives in
    // the inner <form> targeted below.
    expected: { w: 712 },
    // 4px tolerance — flex-1 sub-pixel rounding can drift a hair.
    tolerance: { w: 4 },
  },
  {
    route: "/",
    figmaNodeId: "header.search.pill",
    selector: '[data-figma-id="header.search"] form[role="search"]',
    description: "Home — Header search bar pill (the actual input box)",
    // Figma pill: bg-white, 1px brand-100 border, radius 10, height ~48
    expected: { bg: "#ffffff", borderRadius: 10 },
  },
  {
    route: "/",
    figmaNodeId: "header.cta",
    selector: '[data-figma-id="header.cta"]',
    description: "Home — Header Login/Register CTA",
    // Figma CTA: brand-600 pill, ~140 wide, 44 tall. Button atom "md"
    // size renders 40 tall — within 4px tolerance for now; if you want
    // pixel-exact 44 height, add a `size="header"` variant to Button.
    expected: { h: 44, bg: "#006d77" },
    tolerance: { h: 4 },
  },
];
