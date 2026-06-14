import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getUserTagNames } from "@/lib/db/queries";
import { getTagsForEntities } from "@/lib/hashtags";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { QuoteComposer } from "@/components/quotes/QuoteComposer";
import { Empty } from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const userId = await requireUserId();
  const quotes = db
    .select()
    .from(schema.quotes)
    .where(eq(schema.quotes.userId, userId))
    .orderBy(desc(schema.quotes.createdAt))
    .all();

  const documents = db
    .select({ id: schema.documents.id, title: schema.documents.title })
    .from(schema.documents)
    .where(eq(schema.documents.userId, userId))
    .orderBy(desc(schema.documents.createdAt))
    .all();
  const docById = new Map(documents.map((d) => [d.id, d]));

  const tagsByQuote = getTagsForEntities("quote", quotes.map((q) => q.id));
  const suggestions = getUserTagNames(userId);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Quote</h1>
          <p className="text-sm text-neutral-500">Trích đoạn đã lưu.</p>
        </div>
        <QuoteComposer suggestions={suggestions} documents={documents} />
      </header>

      {quotes.length === 0 ? (
        <Empty
          title="Chưa có quote nào."
          hint='Highlight trong reader hoặc dùng "Thêm quote" để nhập tay.'
        />
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q) => (
            <QuoteCard
              key={q.id}
              quote={q}
              tags={tagsByQuote.get(q.id) ?? []}
              suggestions={suggestions}
              document={q.documentId ? docById.get(q.documentId) ?? null : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
