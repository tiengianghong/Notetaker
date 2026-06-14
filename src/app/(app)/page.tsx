import Link from "next/link";
import { and, desc, eq, lte, isNotNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getTagsForEntities } from "@/lib/hashtags";
import { getUserTagNames } from "@/lib/db/queries";
import { TodoItem } from "@/components/todos/TodoItem";
import { TagList } from "@/components/tags/TagList";

export const dynamic = "force-dynamic";

function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

export default async function DashboardPage() {
  const userId = await requireUserId();
  const todayEnd = endOfToday();

  const dueTodos = db
    .select()
    .from(schema.todos)
    .where(
      and(
        eq(schema.todos.userId, userId),
        eq(schema.todos.done, false),
        isNotNull(schema.todos.dueDate),
        lte(schema.todos.dueDate, todayEnd),
      ),
    )
    .orderBy(schema.todos.dueDate)
    .all();

  const recentNotes = db
    .select()
    .from(schema.notes)
    .where(eq(schema.notes.userId, userId))
    .orderBy(desc(schema.notes.updatedAt))
    .limit(5)
    .all();

  const recentQuotes = db
    .select()
    .from(schema.quotes)
    .where(eq(schema.quotes.userId, userId))
    .orderBy(desc(schema.quotes.createdAt))
    .limit(5)
    .all();

  const recentDocs = db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.userId, userId))
    .orderBy(desc(schema.documents.lastOpenedAt), desc(schema.documents.createdAt))
    .limit(4)
    .all();

  const tagsByTodo = getTagsForEntities("todo", dueTodos.map((t) => t.id));
  const tagsByNote = getTagsForEntities("note", recentNotes.map((n) => n.id));
  const tagsByQuote = getTagsForEntities("quote", recentQuotes.map((q) => q.id));
  const suggestions = getUserTagNames(userId);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-neutral-500">
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </header>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Việc cần làm hôm nay</h2>
          <Link href="/todos" className="text-xs text-neutral-500 hover:text-neutral-900">
            Xem tất cả →
          </Link>
        </div>
        {dueTodos.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Không có việc đến hạn hôm nay. 🌿
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {dueTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                tags={tagsByTodo.get(todo.id) ?? []}
                suggestions={suggestions}
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Ghi chú gần đây</h2>
            <Link href="/notes" className="text-xs text-neutral-500 hover:text-neutral-900">
              Tất cả →
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <p className="rounded-md border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
              Chưa có ghi chú nào.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentNotes.map((n) => (
                <Link
                  key={n.id}
                  href="/notes"
                  className="block rounded-md border border-neutral-200 bg-white p-3 hover:border-neutral-300"
                >
                  <p className="text-sm whitespace-pre-wrap text-neutral-800">{truncate(n.content, 160)}</p>
                  <div className="mt-2">
                    <TagList tags={tagsByNote.get(n.id) ?? []} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Quote gần đây</h2>
            <Link href="/quotes" className="text-xs text-neutral-500 hover:text-neutral-900">
              Tất cả →
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <p className="rounded-md border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
              Chưa có quote nào.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentQuotes.map((q) => (
                <Link
                  key={q.id}
                  href="/quotes"
                  className="block rounded-md border border-neutral-200 bg-white p-3 hover:border-neutral-300"
                >
                  <blockquote className="border-l-2 border-neutral-300 pl-2 text-sm text-neutral-800">
                    {truncate(q.content, 140)}
                  </blockquote>
                  <div className="mt-2">
                    <TagList tags={tagsByQuote.get(q.id) ?? []} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Đang đọc</h2>
          <Link href="/library" className="text-xs text-neutral-500 hover:text-neutral-900">
            Thư viện →
          </Link>
        </div>
        {recentDocs.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Chưa có tài liệu nào.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {recentDocs.map((d) => (
              <Link
                key={d.id}
                href={`/library/${d.id}`}
                className="rounded-md border border-neutral-200 bg-white p-3 hover:border-neutral-300"
              >
                <p className="text-[10px] uppercase tracking-wide text-neutral-400">{d.fileType}</p>
                <p className="mt-1 line-clamp-2 text-sm font-medium">{d.title}</p>
                {d.author ? <p className="mt-0.5 truncate text-xs text-neutral-500">{d.author}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
