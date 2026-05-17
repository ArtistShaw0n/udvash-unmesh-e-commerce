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

## Known follow-ups not in this commit

Things the cross-page sweep surfaced but weren't in scope for the immediate fix:

- **Checkout/cart totals math is wrong**: subtotal + vat + shipping does not equal total in some states. Likely a unit-price-vs-line-price bug in `OrderSummaryCard`.
- **Cart header label**: `Shopping Cart (N items)` shows `selectedCount`, not `itemCount` — confusing when items exist but none are selected.
- **ProductCard `৬০০` overlay on book mock**: looks like a price chip glued to the placeholder cover art. Likely a fallback-image artifact.
- **Wider sweep**: home / search / account / admin pages have not been visually audited at 768 px and 375 px.

These get their own commits, each following the loop above.
