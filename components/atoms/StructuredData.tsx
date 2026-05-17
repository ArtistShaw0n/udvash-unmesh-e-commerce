/**
 * Renders one or more JSON-LD blocks inside <head>. Pass it the objects
 * from `lib/structured-data.ts`. Works as a Server Component by default,
 * but is safe in Client Components too (no server-only imports).
 *
 * Each <script> is injected unescaped — Next.js handles that by setting
 * dangerouslySetInnerHTML with the stringified JSON.
 */

export interface StructuredDataProps {
  data: object | object[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
