import Link from "next/link";
import { desc, eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getTagsForEntities } from "@/lib/hashtags";
import { getUserTagNames } from "@/lib/db/queries";
import { TodoComposer } from "@/components/todos/TodoComposer";
import { TodoItem } from "@/components/todos/TodoItem";
import { Empty } from "@/components/ui/empty";
import { cn } from "@/lib/cn";

type Filter = "all" | "open" | "done";

export const dynamic = "force-dynamic";

export default async function TodosPage({ searchParams }: { searchParams: Promise<{ f?: Filter }> }) {
  const userId = await requireUserId();
  const sp = await searchParams;
  const filter: Filter = sp.f === "done" ? "done" : sp.f === "all" ? "all" : "open";

  const conditions = [eq(schema.todos.userId, userId)];
  if (filter === "open") conditions.push(eq(schema.todos.done, false));
  if (filter === "done") conditions.push(eq(schema.todos.done, true));

  const todos = db
    .select()
    .from(schema.todos)
    .where(and(...conditions))
    .orderBy(desc(schema.todos.createdAt))
    .all();

  const tagsByTodo = getTagsForEntities("todo", todos.map((t) => t.id));
  const suggestions = getUserTagNames(userId);

  const TabLink = ({ value, label }: { value: Filter; label: string }) => (
    <Link
      href={value === "open" ? "/todos" : `/todos?f=${value}`}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs",
        filter === value ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">To-do</h1>
          <p className="text-sm text-neutral-500">Việc cần làm</p>
        </div>
        <div className="flex gap-1">
          <TabLink value="open" label="Đang làm" />
          <TabLink value="done" label="Đã xong" />
          <TabLink value="all" label="Tất cả" />
        </div>
      </header>
      <TodoComposer />
      <div className="flex flex-col gap-2">
        {todos.length === 0 ? (
          <Empty title="Chưa có việc nào." hint="Nhập tiêu đề ở trên rồi nhấn Enter." />
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              tags={tagsByTodo.get(todo.id) ?? []}
              suggestions={suggestions}
            />
          ))
        )}
      </div>
    </div>
  );
}
