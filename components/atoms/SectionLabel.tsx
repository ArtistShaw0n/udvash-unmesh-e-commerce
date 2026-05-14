import { clsx } from "@/lib/clsx";

export interface SectionLabelProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div";
}

export function SectionLabel({
  as: Tag = "p",
  className,
  children,
  ...rest
}: SectionLabelProps) {
  return (
    <Tag className={clsx("section-label", className)} {...rest}>
      {children}
    </Tag>
  );
}
