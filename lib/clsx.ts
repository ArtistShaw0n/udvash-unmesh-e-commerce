export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const item of inputs) {
    if (!item) continue;
    if (typeof item === "string" || typeof item === "number") {
      out.push(String(item));
    } else if (Array.isArray(item)) {
      const nested = clsx(...item);
      if (nested) out.push(nested);
    } else if (typeof item === "object") {
      for (const key in item) {
        if (item[key]) out.push(key);
      }
    }
  }
  return out.join(" ");
}
