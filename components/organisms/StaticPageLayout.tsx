import { StaticPageHero } from "./StaticPageHero";

export interface StaticPageLayoutProps {
  title: string;
  description?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}

export function StaticPageLayout({
  title,
  description,
  breadcrumb,
  children,
}: StaticPageLayoutProps) {
  return (
    <>
      <StaticPageHero title={title} description={description} breadcrumb={breadcrumb} />
      <section className="section-pad-sm">
        <div className="container-site">
          <article className="max-w-3xl prose-content space-y-4 text-body text-[var(--fg-secondary)] leading-relaxed">
            {children}
          </article>
        </div>
      </section>
    </>
  );
}
