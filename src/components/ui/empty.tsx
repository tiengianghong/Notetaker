import { cn } from "@/lib/cn";

export function Empty({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 py-16 text-center", className)}>
      <p className="text-sm text-neutral-600">{title}</p>
      {hint ? <p className="text-xs text-neutral-400">{hint}</p> : null}
    </div>
  );
}
