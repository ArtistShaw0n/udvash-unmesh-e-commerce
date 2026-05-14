import Link from "next/link";
import Image from "next/image";
import { clsx } from "@/lib/clsx";

export interface LogoProps {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<LogoProps["size"]>, { w: number; h: number; className: string }> = {
  sm: { w: 140, h: 28, className: "h-7 w-auto" },
  md: { w: 180, h: 36, className: "h-9 w-auto" },
  lg: { w: 220, h: 44, className: "h-11 w-auto" },
};

export function Logo({ href = "/", className, size = "md" }: LogoProps) {
  const { w, h, className: szClass } = sizeClass[size];
  const img = (
    <Image
      src="/udvash-logo.svg"
      alt="উদ্ভাস-উন্মেষ"
      width={w}
      height={h}
      priority
      className={clsx(szClass, "select-none", className)}
    />
  );
  if (href) {
    return (
      <Link href={href} aria-label="উদ্ভাস-উন্মেষ — হোম" className="inline-block">
        {img}
      </Link>
    );
  }
  return img;
}
