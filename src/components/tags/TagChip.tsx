import Link from "next/link";
import { cn } from "@/lib/cn";

export function TagChip({
  name,
  href,
  className,
  size = "md",
}: {
  name: string;
  href?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const cls = cn(
    "inline-flex items-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors",
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
    className,
  );
  const label = `#${name}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }
  return <span className={cls}>{label}</span>;
}
