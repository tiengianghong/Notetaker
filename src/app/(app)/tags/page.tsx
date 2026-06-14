import Link from "next/link";
import { eq, sql, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { Empty } from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default async function TagsIndexPage() {
  const userId = await requireUserId();
  const rows = db
    .select({
      name: schema.tags.name,
      count: sql<number>`count(${schema.taggings.id})`.as("count"),
    })
    .from(schema.tags)
    .leftJoin(schema.taggings, eq(schema.taggings.tagId, schema.tags.id))
    .where(eq(schema.tags.userId, userId))
    .groupBy(schema.tags.id, schema.tags.name)
    .orderBy(desc(sql`count`))
    .all();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Tag</h1>
        <p className="text-sm text-neutral-500">Tất cả hashtag đã dùng.</p>
      </header>

      {rows.length === 0 ? (
        <Empty title="Chưa có tag nào." hint="Viết #hashtag trong note hoặc quote." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {rows.map((r) => (
            <Link
              key={r.name}
              href={`/tags/${encodeURIComponent(r.name)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-200 px-3 py-1 text-sm text-neutral-700 hover:border-neutral-400"
            >
              <span>#{r.name}</span>
              <span className="text-[11px] text-neutral-400">{r.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
