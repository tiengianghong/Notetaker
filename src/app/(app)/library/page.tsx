import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { UploadDialog } from "@/components/library/UploadDialog";
import { DocumentCard } from "@/components/library/DocumentCard";
import { Empty } from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const userId = await requireUserId();
  const docs = db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.userId, userId))
    .orderBy(desc(schema.documents.createdAt))
    .all();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Thư viện</h1>
          <p className="text-sm text-neutral-500">PDF và EPUB của bạn.</p>
        </div>
        <UploadDialog />
      </header>

      {docs.length === 0 ? (
        <Empty title="Chưa có tài liệu nào." hint='Nhấn "Tải lên" để bắt đầu.' />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
