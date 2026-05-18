# Visual QA Workflow

**Why this exists**: Earlier in development, "done" meant `typecheck + test + build` passed. That's compilation correctness, not product correctness. The compiler can't see that a countdown rendered as floating digits, that checkboxes were unstyled, or that an icon was missing from the header. These shipped because the loop never closed with a human-perceivable artifact.

This doc is the new definition of done for any UI change.

---

## The closed loop

Every UI change goes through every step. No skipping.

```
1. baseline screenshot of the page-as-is
   ↓
2. write the code
   ↓
3. typecheck + test (machine-readable correctness)
   ↓
4. spin up dev preview and navigate to the page
   ↓
5. screenshot at desktop (1280), tablet (768), mobile (375)
   ↓
6. compare against (a) baseline, (b) reference design if one exists
   ↓
7. sweep 3 sibling pages — confirm the pattern still holds
   ↓
8. only now mark the change shippable
```

If any step fails, the change is not shippable. Fix in place.

---

## Tools

- **Dev preview**: `mcp__Claude_Preview__preview_start` with name `udvash-website (NEW METHOD)`. Reuses any running server.
- **Resize**: `preview_resize` with `preset: mobile | tablet | desktop`, or custom `width`/`height`.
- **Screenshot**: `preview_screenshot` — JPEG of the current viewport.
- **Inspect actual styles**: `preview_inspect selector="..." styles=["padding","color",...]` — far more accurate than reading screenshot pixels.
- **JS in page**: `preview_eval` — read DOM state, navigate, click, fill.
- **Accessibility tree**: `preview_snapshot` — verify text and roles without screenshot ambiguity.

---

## When a screenshot is misleading

Screenshots can lie about:

- **Exact colors** — JPEG compression shifts hues. Always confirm color values with `preview_inspect → backgroundColor / color`.
- **Font size and line height** — get the computed value, not the rendered pixel count.
- **Spacing precision** — use the bounding box from `preview_inspect`.
- **State-dependent styles** — a screenshot only shows one state. Use `preview_eval` to programmatically toggle hover/focus/checked and re-inspect.

---

## Specific gotchas that bit us

### Tailwind `peer-*` is a sibling selector

`peer-checked:bg-brand-600` compiles to `.peer:checked ~ .peer-checked\:bg-brand-600`. The `~` operator requires sibling. If your peer is a child of the styled element, the style **silently never applies**. The compiler does not warn.

Wrong:
```jsx
<span className="peer-checked:bg-brand-600">
  <input className="peer" />
</span>
```

Right:
```jsx
<span>
  <input className="peer" />
  <span className="peer-checked:bg-brand-600" aria-hidden />
</span>
```

### Class-name typos compile silently

`peer-checked:border-brand-60` (missing trailing `0`) is treated as a custom class name. No warning, no style. Always proofread class lists after editing.

### Inline timer/clocks need separators

A countdown with no `:` between hour/minute/second segments reads as one number. Either include a literal separator span, or use the boxed `CountdownTimer` with labels. Don't strip both the boxes and the separators.

### Mobile-only vs desktop-only icons

Header icons that are `hidden sm:inline-flex` won't show on mobile — that's correct only if the mobile bottom nav covers the same destination. Always verify the pair: removing a header icon on mobile is only OK if the bottom nav has it.

---

## Commit checklist for any UI commit

Paste this into the commit body:

```
Visual verification:
- [ ] Desktop (1280x800) — URL: ___ — screenshot reviewed
- [ ] Mobile (375x812) — URL: ___ — screenshot reviewed
- [ ] Sibling pages swept: ___ , ___ , ___
- [ ] No regression on related flows: ___
```

If a box is unchecked, the commit isn't ready.

---

## Per-section Figma vs. live audit

The closed-loop above catches "things that look broken." It doesn't always catch "things that look fine but quietly diverge from Figma" — a section painted the wrong colour, a heading sized one step too small, padding off by 8 px. Those slip through because the page still looks pleasant; the diff is only visible side-by-side with the design.

When the user reports "section X is wrong" or you suspect token drift, run this **three-layer audit**:

### Layer 1 — Figma fill extraction (the source of truth)

For each top-level section on the page, use the Figma MCP:

```
mcp__e1db3251...__get_design_context  nodeId=<section-id>  fileKey=UPIWiRG0dPEiZ595DDlqT0
```

If the response is too big, the dump is saved to a file path included in the error — `jq` it for `bg-[#...]` / `text-[#...]` patterns. If a section "inherits" (no own fill), trace up the parent chain until you hit a node that paints.

**Trust but verify with pixel sampling.** `get_design_context` can mislabel a section's bg when a prominent child paints a different colour — a code-gen tool will sometimes infer "this section is white" from the dominant inner element instead of the outer band. The header bug in this commit chain happened because the Figma metadata reported the home header as "child paints white" — but the actual outer band fill was `#F7F9FB` cream. The white was just the search-input pill inside.

Ground-truth by pixel-sampling the Figma screenshot of the node:

```python
from PIL import Image
img = Image.open('/tmp/figma-node-XXXX.png').convert('RGB')
# Sample the EDGES of the section, not the centre — centres often
# fall inside child elements that paint over the outer band.
edge_samples = [(10, 10), (width-10, 10), (10, height-10), (width-10, height-10)]
for x, y in edge_samples:
    print(f'({x},{y}): {img.getpixel((x,y))}')
```

Use `mcp__e1db3251...__get_screenshot` to fetch the PNG, `curl` it down, then sample at the corners and along each edge. The corner colours are the section's true outer fill.

Produce a table per page:

| # | Section | Figma node id | y / h | Figma bg hex |
|---|---------|---------------|-------|--------------|

### Layer 2 — live DOM extraction (what we actually ship)

In the dev preview, navigate to the route and eval:

```js
Array.from(document.querySelectorAll('section, header, footer, main > div'))
  .filter(el => el.getBoundingClientRect().height > 50)
  .map(el => ({
    hint: el.querySelector('h1,h2,h3')?.textContent?.trim().slice(0,30)
          || (el.className?.toString()||'').slice(0,30),
    bg: getComputedStyle(el).backgroundColor,
    h: Math.round(el.getBoundingClientRect().height)
  }))
```

That gives the real rgb() of every top-level section, with a human hint (the section's first heading) so you can match each row to Figma.

### Layer 3 — diff table

Side-by-side, row by row:

| # | Section | Figma | Live rgb() | Match? | File:line of offending class |
|---|---------|-------|------------|--------|------------------------------|

Where they diverge, use `grep -rn "bg-\[var(--bg-page)\]" components/organisms` (or similar) to locate the offender. Fix one section at a time, re-run Layer 2, commit.

### When to run this audit

- After any token-level change (`--bg-page`, brand palette, semantic colours).
- After a Figma update where the designer changes section fills.
- When a user reports a visual regression on a specific section.
- Before flagging a page as "Figma-aligned" — don't trust eyeballing.

This is the audit that found the home page was rendering uniformly cream when Figma alternates white/cream/white/cream/cream/cream/teal bands.

---

## Known follow-ups not in this commit

Things the cross-page sweep surfaced but weren't in scope for the immediate fix:

- **Checkout/cart totals math is wrong**: subtotal + vat + shipping does not equal total in some states. Likely a unit-price-vs-line-price bug in `OrderSummaryCard`.
- **Cart header label**: `Shopping Cart (N items)` shows `selectedCount`, not `itemCount` — confusing when items exist but none are selected.
- **ProductCard `৬০০` overlay on book mock**: looks like a price chip glued to the placeholder cover art. Likely a fallback-image artifact.
- **Wider sweep**: home / search / account / admin pages have not been visually audited at 768 px and 375 px.

These get their own commits, each following the loop above.
