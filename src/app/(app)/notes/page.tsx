import { desc, eq, like, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getTagsForEntities } from "@/lib/hashtags";
import { getUserTagNames } from "@/lib/db/queries";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { NoteCard } from "@/components/notes/NoteCard";
import { Empty } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const userId = await requireUserId();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const where = q
    ? and(eq(schema.notes.userId, userId), like(schema.notes.content, `%${q}%`))
    : eq(schema.notes.userId, userId);

  const notes = db
    .select()
    .from(schema.notes)
    .where(where)
    .orderBy(desc(schema.notes.updatedAt))
    .all();

  const tagsByNote = getTagsForEntities("note", notes.map((n) => n.id));
  const suggestions = getUserTagNames(userId);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Ghi chú</h1>
        <p className="text-sm text-neutral-500">Viết nhanh — dùng #hashtag để phân loại.</p>
      </header>

      <NoteComposer suggestions={suggestions} />

      <form className="flex gap-2" method="GET">
        <Input name="q" defaultValue={q} placeholder="Tìm trong ghi chú…" />
      </form>

      <div className="flex flex-col gap-3">
        {notes.length === 0 ? (
          <Empty
            title={q ? `Không có kết quả cho "${q}"` : "Chưa có ghi chú nào."}
            hint={q ? undefined : "Bắt đầu bằng cách viết note đầu tiên ở trên."}
          />
        ) : (
          notes.map((n) => (
            <NoteCard key={n.id} note={n} tags={tagsByNote.get(n.id) ?? []} suggestions={suggestions} />
          ))
        )}
      </div>
    </div>
  );
}
