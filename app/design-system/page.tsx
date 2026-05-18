import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ShieldCheck, Phone, BookOpen } from "lucide-react";

// Design-system gallery is a dev-only tool. In production it should not
// be reachable — return a 404 so search engines don't index it.
export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};
import {
  ArrowLink,
  Badge,
  Button,
  Checkbox,
  Dropdown,
  FilterPill,
  IconBox,
  Logo,
  SectionLabel,
  ThemeToggle,
} from "@/components/atoms";
import {
  CountdownTimer,
  InfoChip,
  PriceBlock,
  ProductCard,
  QuantityCounter,
  SpecificationRow,
} from "@/components/molecules";
import { getAllBooks } from "@/lib/books";
import { CATEGORIES } from "@/lib/site";

const DEMO_END = new Date(Date.now() + 23 * 60 * 60 * 1000);

export default function DesignSystemPage() {
  // Gate at request time — even if the file ships, requests resolve to 404
  // in production builds. Dev keeps the gallery for component review.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const sampleBook = getAllBooks()[0];

  return (
    <main className="container-site section-pad space-y-14">
      {/* Header */}
      <header className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700"
          >
            <ChevronLeft size={16} /> Back to Home
          </Link>
          <SectionLabel>Design System</SectionLabel>
          <h1 className="text-display tracking-tight text-[var(--fg-primary)]">
            উদ্ভাস-উন্মেষ Tokens & Components
          </h1>
          <p className="text-body-lg text-[var(--fg-secondary)] max-w-2xl">
            Foundation tokens (colors, typography, radii, shadows) and the
            atom/molecule/organism library. Light + dark mode, mobile + tablet
            + desktop responsive.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Breakpoint indicator */}
      <section className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-muted)] p-4 flex items-center gap-3 flex-wrap">
        <span className="text-caption font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          Current breakpoint
        </span>
        <span className="px-2.5 py-1 rounded-sm bg-brand-700 text-white text-body-sm font-bold sm:hidden">
          Mobile · &lt; 640
        </span>
        <span className="px-2.5 py-1 rounded-sm bg-brand-700 text-white text-body-sm font-bold hidden sm:inline md:hidden">
          Small · 640+
        </span>
        <span className="px-2.5 py-1 rounded-sm bg-brand-700 text-white text-body-sm font-bold hidden md:inline lg:hidden">
          Tablet · 768+
        </span>
        <span className="px-2.5 py-1 rounded-sm bg-brand-700 text-white text-body-sm font-bold hidden lg:inline xl:hidden">
          Desktop · 1024+
        </span>
        <span className="px-2.5 py-1 rounded-sm bg-brand-700 text-white text-body-sm font-bold hidden xl:inline">
          Wide · 1280+
        </span>
      </section>

      {/* Colors */}
      <section className="space-y-6">
        <h2 className="text-h2 text-[var(--fg-primary)]">Colors</h2>
        <ColorScale title="Brand (teal — primary)" shades={[
          ["50", "bg-brand-50"], ["100", "bg-brand-100"], ["200", "bg-brand-200"],
          ["300", "bg-brand-300"], ["400", "bg-brand-400"], ["500", "bg-brand-500"],
          ["600", "bg-brand-600"], ["700", "bg-brand-700"], ["800", "bg-brand-800"],
          ["900", "bg-brand-900"],
        ]} />
        <ColorScale title="Discount (red)" shades={[
          ["50", "bg-discount-50"], ["100", "bg-discount-100"], ["200", "bg-discount-200"],
          ["300", "bg-discount-300"], ["400", "bg-discount-400"], ["500", "bg-discount-500"],
          ["600", "bg-discount-600"], ["700", "bg-discount-700"], ["800", "bg-discount-800"],
          ["900", "bg-discount-900"],
        ]} />
        <ColorScale title="Warning (orange — Pre Order)" shades={[
          ["50", "bg-warning-50"], ["100", "bg-warning-100"], ["200", "bg-warning-200"],
          ["300", "bg-warning-300"], ["400", "bg-warning-400"], ["500", "bg-warning-500"],
          ["600", "bg-warning-600"], ["700", "bg-warning-700"], ["800", "bg-warning-800"],
          ["900", "bg-warning-900"],
        ]} />
        <ColorScale title="Success (green — Save)" shades={[
          ["50", "bg-success-50"], ["100", "bg-success-100"], ["200", "bg-success-200"],
          ["300", "bg-success-300"], ["400", "bg-success-400"], ["500", "bg-success-500"],
          ["600", "bg-success-600"], ["700", "bg-success-700"], ["800", "bg-success-800"],
          ["900", "bg-success-900"],
        ]} />
        <ColorScale title="Navy (bestseller)" shades={[
          ["50", "bg-navy-50"], ["100", "bg-navy-100"], ["200", "bg-navy-200"],
          ["300", "bg-navy-300"], ["400", "bg-navy-400"], ["500", "bg-navy-500"],
          ["600", "bg-navy-600"], ["700", "bg-navy-700"], ["800", "bg-navy-800"],
          ["900", "bg-navy-900"],
        ]} />
        <ColorScale title="Neutrals" shades={[
          ["0", "bg-neutral-0"], ["50", "bg-neutral-50"], ["100", "bg-neutral-100"],
          ["200", "bg-neutral-200"], ["300", "bg-neutral-300"], ["400", "bg-neutral-400"],
          ["500", "bg-neutral-500"], ["600", "bg-neutral-600"], ["700", "bg-neutral-700"],
          ["800", "bg-neutral-800"], ["900", "bg-neutral-900"],
        ]} />
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-h2 text-[var(--fg-primary)]">Typography (responsive)</h2>
        <div className="space-y-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
          <Row cls="text-display" specs="36 / 48 / 60" />
          <Row cls="text-h1" specs="30 / 36 / 48" />
          <Row cls="text-h2" specs="24 / 30 / 36" />
          <Row cls="text-h3" specs="20 / 24 / 28" />
          <Row cls="text-h4" specs="18 / 20 / 22" />
          <Row cls="text-body-lg" specs="18 / 18 / 20" />
          <Row cls="text-body" specs="16 / 16 / 16" />
          <Row cls="text-body-sm" specs="14 / 14 / 14" />
          <Row cls="text-caption" specs="12 / 12 / 12" />
        </div>
      </section>

      {/* Atoms */}
      <Block title="Atoms — Logo">
        <div className="flex items-end gap-6 flex-wrap">
          <div className="flex flex-col items-center gap-1"><Logo size="sm" /><span className="text-caption text-[var(--fg-muted)]">sm</span></div>
          <div className="flex flex-col items-center gap-1"><Logo size="md" /><span className="text-caption text-[var(--fg-muted)]">md (default)</span></div>
          <div className="flex flex-col items-center gap-1"><Logo size="lg" /><span className="text-caption text-[var(--fg-muted)]">lg</span></div>
        </div>
      </Block>

      <Block title="Atoms — Button (variants × sizes)">
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="warning">Pre Order</Button>
            <Button variant="danger">Discount</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="white" className="border border-[var(--border-default)]">White</Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
      </Block>

      <Block title="Atoms — Badge (4 colors × 3 styles)">
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Badge color="discount">12% ছাড়</Badge>
            <Badge color="preorder">Pre Order</Badge>
            <Badge color="bestseller">Best seller</Badge>
            <Badge color="stockout">Stock Out</Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge color="discount" variant="soft">12% ছাড়</Badge>
            <Badge color="preorder" variant="soft">Pre Order</Badge>
            <Badge color="bestseller" variant="soft">Best seller</Badge>
            <Badge color="stockout" variant="soft">Stock Out</Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge color="discount" variant="outline">12% ছাড়</Badge>
            <Badge color="preorder" variant="outline">Pre Order</Badge>
            <Badge color="bestseller" variant="outline">Best seller</Badge>
            <Badge color="stockout" variant="outline">Stock Out</Badge>
          </div>
        </div>
      </Block>

      <Block title="Atoms — FilterPill (no layout shift)">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c, i) => (
            <FilterPill key={c.slug} active={i === 0}>{c.label}</FilterPill>
          ))}
        </div>
      </Block>

      <Block title="Atoms — IconBox · ArrowLink · Dropdown">
        <div className="flex items-center gap-5 flex-wrap">
          <IconBox icon={<ShieldCheck size={20} />} />
          <IconBox icon={<Phone size={20} />} tone="neutral" />
          <IconBox icon={<BookOpen size={20} />} size="lg" />
          <ArrowLink href="/products">সব দেখুন</ArrowLink>
          <Dropdown defaultValue="popular" options={[
            { label: "সবগুলো", value: "popular" },
            { label: "নতুন আগে", value: "newest" },
          ]} />
        </div>
      </Block>

      <Block title="Atoms — Checkbox (full state machine)">
        <p className="text-body-sm text-[var(--fg-secondary)] mb-3">
          ক্যানোনিকাল ৭ স্টেট: unchecked / hover / focus / checked /
          indeterminate / disabled / checked+disabled. Select All-এ
          partial-select হলে indeterminate (mixed) দেখায়।
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <CheckboxState title="Unchecked" desc="Default idle state">
            <Checkbox label="সব নির্বাচন" id="ds-cb-unchecked" />
          </CheckboxState>
          <CheckboxState title="Checked" desc="Brand-teal fill + check glyph">
            <Checkbox label="সব নির্বাচন" id="ds-cb-checked" checked readOnly />
          </CheckboxState>
          <CheckboxState
            title="Indeterminate"
            desc="aria-checked='mixed' — for partial-select parents"
          >
            <Checkbox
              label="সব নির্বাচন (২ / ৫)"
              id="ds-cb-mixed"
              indeterminate
              readOnly
            />
          </CheckboxState>
          <CheckboxState title="Disabled" desc="Muted bg, not clickable">
            <Checkbox label="সব নির্বাচন" id="ds-cb-disabled" disabled />
          </CheckboxState>
          <CheckboxState
            title="Checked + Disabled"
            desc="Brand-300 (desaturated), still shows state"
          >
            <Checkbox
              label="সব নির্বাচন"
              id="ds-cb-checked-disabled"
              checked
              disabled
              readOnly
            />
          </CheckboxState>
          <CheckboxState
            title="Without label"
            desc="Used inline (e.g. per-row in a table)"
          >
            <Checkbox id="ds-cb-bare" />
          </CheckboxState>
        </div>
      </Block>

      {/* Molecules */}
      <Block title="Molecules — PriceBlock · QuantityCounter">
        <div className="space-y-4">
          <PriceBlock price={383} oldPrice={450} size="md" />
          <PriceBlock price={383} oldPrice={450} size="lg" />
          <QuantityCounter defaultValue={1} />
        </div>
      </Block>

      <Block title="Molecules — CountdownTimer">
        <div className="flex flex-wrap gap-6">
          <div className="p-5 rounded-md bg-brand-700"><CountdownTimer targetDate={DEMO_END} tone="onBrand" format="hms" /></div>
          <CountdownTimer targetDate={DEMO_END} tone="default" format="dhm" />
        </div>
      </Block>

      <Block title="Molecules — SpecificationRow · InfoChip">
        <dl className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] divide-y divide-[var(--border-muted)] px-5">
          <SpecificationRow label="লেখক:" value="উদ্ভাস-উন্মেষ টিম" />
          <SpecificationRow label="পৃষ্ঠা সংখ্যা:" value="২৮০" />
          <SpecificationRow label="ভার্সন:" value="বাংলা" />
        </dl>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <InfoChip icon={<ShieldCheck size={18} />} label="৭ দিনের রিটার্ন পলিসি" />
          <InfoChip icon={<BookOpen size={18} />} label="ফ্রি ডেলিভারি প্রযোজ্য" />
        </div>
      </Block>

      <Block title="Molecules — ProductCard (the workhorse)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {getAllBooks().slice(0, 4).map((b) => <ProductCard key={b.slug} book={b} />)}
        </div>
      </Block>

      <Block title="Live page demo">
        <p className="text-body text-[var(--fg-secondary)]">
          Sample book detail: <Link href={`/products/${sampleBook.slug}`} className="text-brand-700 dark:text-brand-400 font-semibold hover:underline">{sampleBook.title}</Link>
        </p>
      </Block>

      <footer className="pt-10 border-t border-[var(--border-default)]">
        <p className="text-body-sm text-[var(--fg-muted)]">
          Floating palette button (bottom-right) → opens this page from any public route.
        </p>
      </footer>
    </main>
  );
}

/* ---------- Helpers ---------- */

function ColorScale({ title, shades }: { title: string; shades: [string, string][] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-h4 text-[var(--fg-primary)]">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {shades.map(([s, cls]) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md border border-[var(--border-default)] ${cls}`} />
            <span className="text-caption text-[var(--fg-muted)]">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ cls, specs }: { cls: string; specs: string }) {
  return (
    <div className="flex items-baseline gap-4 flex-wrap py-2 border-b border-[var(--border-muted)] last:border-0">
      <div className="flex-shrink-0 w-32">
        <code className="text-body-sm text-[var(--fg-secondary)]">{cls}</code>
        <p className="text-caption text-[var(--fg-muted)] mt-0.5">{specs}</p>
      </div>
      <span className={`${cls} text-[var(--fg-primary)] flex-1 min-w-0`}>The quick brown fox · দ্রুত বাদামী শিয়াল</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
      <h3 className="text-h3 text-[var(--fg-primary)]">{title}</h3>
      <div className="pt-2">{children}</div>
    </section>
  );
}

function CheckboxState({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[var(--border-muted)] bg-[var(--bg-page)] p-4">
      <div className="mb-3">{children}</div>
      <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
        {title}
      </p>
      <p className="text-caption text-[var(--fg-secondary)] mt-0.5">{desc}</p>
    </div>
  );
}
