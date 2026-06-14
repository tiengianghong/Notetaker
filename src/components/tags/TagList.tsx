import { TagChip } from "./TagChip";

export function TagList({
  tags,
  size = "md",
}: {
  tags: { id: string; name: string }[];
  size?: "sm" | "md";
}) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <TagChip key={t.id} name={t.name} href={`/tags/${encodeURIComponent(t.name)}`} size={size} />
      ))}
    </div>
  );
}
