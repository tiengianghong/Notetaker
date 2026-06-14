import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getUserTagNames } from "@/lib/db/queries";
import { getTagsForEntities } from "@/lib/hashtags";
import { TodoItem } from "@/components/todos/TodoItem";
import { NoteCard } from "@/components/notes/NoteCard";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { Empty } from "@/components/ui/empty";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type Tab = "notes" | "quotes" | "todos";

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ t?: Tab }>;
}) {
  const userId = await requireUserId();
  const { name } = await params;
  const decodedName = decodeURIComponent(name).toLowerCase();
  const sp = await searchParams;
  const tab: Tab = sp.t === "quotes" || sp.t === "todos" ? sp.t : "notes";

  const tag = db
    .select()
    .from(schema.tags)
    .where(and(eq(schema.tags.userId, userId), eq(schema.tags.name, decodedName)))
    .get();
  if (!tag) notFound();

  const taggings = db
    .select({ entityType: schema.taggings.entityType, entityId: schema.taggings.entityId })
    .from(schema.taggings)
    .where(eq(schema.taggings.tagId, tag.id))
    .all();

  const noteIds = taggings.filter((t) => t.entityType === "note").map((t) => t.entityId);
  const quoteIds = taggings.filter((t) => t.entityType === "quote").map((t) => t.entityId);
  const todoIds = taggings.filter((t) => t.entityType === "todo").map((t) => t.entityId);

  const notes =
    noteIds.length > 0
      ? db
          .select()
          .from(schema.notes)
          .where(and(eq(schema.notes.userId, userId), inArray(schema.notes.id, noteIds)))
          .orderBy(desc(schema.notes.updatedAt))
          .all()
      : [];
  const quotes =
    quoteIds.length > 0
      ? db
          .select()
          .from(schema.quotes)
          .where(and(eq(schema.quotes.userId, userId), inArray(schema.quotes.id, quoteIds)))
          .orderBy(desc(schema.quotes.createdAt))
          .all()
      : [];
  const todos =
    todoIds.length > 0
      ? db
          .select()
          .from(schema.todos)
          .where(and(eq(schema.todos.userId, userId), inArray(schema.todos.id, todoIds)))
          .orderBy(desc(schema.todos.createdAt))
          .all()
      : [];

  const tagsByNote = getTagsForEntities("note", notes.map((n) => n.id));
  const tagsByQuote = getTagsForEntities("quote", quotes.map((q) => q.id));
  const tagsByTodo = getTagsForEntities("todo", todos.map((t) => t.id));
  const suggestions = getUserTagNames(userId);

  const docs =
    quotes.length > 0
      ? db
          .select({ id: schema.documents.id, title: schema.documents.title })
          .from(schema.documents)
          .where(
            and(
              eq(schema.documents.userId, userId),
              inArray(
                schema.documents.id,
                quotes.map((q) => q.documentId).filter((x): x is string => !!x),
              ),
            ),
          )
          .all()
      : [];
  const docById = new Map(docs.map((d) => [d.id, d]));

  const TabLink = ({ value, label, count }: { value: Tab; label: string; count: number }) => (
    <Link
      href={`/tags/${name}${value === "notes" ? "" : `?t=${value}`}`}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs",
        tab === value ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100",
      )}
    >
      {label} <span className="opacity-70">({count})</span>
    </Link>
  );

  return (
    <div className="space-y-6">
      <header>
        <Link href="/tags" className="text-xs text-neutral-500 hover:text-neutral-900">
          ← Tất cả tag
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">#{tag.name}</h1>
      </header>

      <div className="flex gap-1">
        <TabLink value="notes" label="Ghi chú" count={notes.length} />
        <TabLink value="quotes" label="Quote" count={quotes.length} />
        <TabLink value="todos" label="To-do" count={todos.length} />
      </div>

      <div className="flex flex-col gap-3">
        {tab === "notes" &&
          (notes.length === 0 ? (
            <Empty title={`Chưa có ghi chú nào gắn #${tag.name}.`} />
          ) : (
            notes.map((n) => (
              <NoteCard key={n.id} note={n} tags={tagsByNote.get(n.id) ?? []} suggestions={suggestions} />
            ))
          ))}
        {tab === "quotes" &&
          (quotes.length === 0 ? (
            <Empty title={`Chưa có quote nào gắn #${tag.name}.`} />
          ) : (
            quotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                tags={tagsByQuote.get(q.id) ?? []}
                suggestions={suggestions}
                document={q.documentId ? docById.get(q.documentId) ?? null : null}
              />
            ))
          ))}
        {tab === "todos" &&
          (todos.length === 0 ? (
            <Empty title={`Chưa có to-do nào gắn #${tag.name}.`} />
          ) : (
            todos.map((t) => (
              <TodoItem key={t.id} todo={t} tags={tagsByTodo.get(t.id) ?? []} suggestions={suggestions} />
            ))
          ))}
      </div>
    </div>
  );
}
