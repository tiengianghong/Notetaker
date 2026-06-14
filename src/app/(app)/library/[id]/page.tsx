import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq, desc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getUserTagNames } from "@/lib/db/queries";
import { getTagsForEntities } from "@/lib/hashtags";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { QuoteCard } from "@/components/quotes/QuoteCard";

export const dynamic = "force-dynamic";

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const doc = db
    .select()
    .from(schema.documents)
    .where(and(eq(schema.documents.id, id), eq(schema.documents.userId, userId)))
    .get();
  if (!doc) notFound();

  const fileUrl = `/api/files/${encodeURIComponent(doc.fileKey)}`;
  const suggestions = getUserTagNames(userId);

  const quotes = db
    .select()
    .from(schema.quotes)
    .where(and(eq(schema.quotes.userId, userId), eq(schema.quotes.documentId, id)))
    .orderBy(desc(schema.quotes.createdAt))
    .all();
  const tagsByQuote = getTagsForEntities("quote", quotes.map((q) => q.id));

  return (
    <div className="space-y-4 -mx-4 sm:-mx-8 lg:-mx-10">
      <header className="flex items-center gap-3 px-4 sm:px-8 lg:px-10">
        <Link href="/library" className="text-neutral-500 hover:text-neutral-900" aria-label="Quay lại thư viện">
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-medium">{doc.title}</h1>
          {doc.author ? <p className="truncate text-xs text-neutral-500">{doc.author}</p> : null}
        </div>
      </header>

      <div className="rounded-lg border border-neutral-200 bg-white mx-4 sm:mx-8 lg:mx-10 overflow-hidden">
        <ReaderShell
          documentId={doc.id}
          fileType={doc.fileType}
          fileUrl={fileUrl}
          suggestions={suggestions}
        />
      </div>

      {quotes.length > 0 ? (
        <section className="px-4 sm:px-8 lg:px-10 space-y-3 pt-4">
          <h2 className="text-sm font-medium text-neutral-700">Quote đã lưu ({quotes.length})</h2>
          <div className="flex flex-col gap-2">
            {quotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                tags={tagsByQuote.get(q.id) ?? []}
                suggestions={suggestions}
                showDocument={false}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
