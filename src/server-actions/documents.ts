"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { storage } from "@/lib/storage";
import { newId } from "@/lib/ids";
import { z } from "zod";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const PDF_EXT = [".pdf"];
const EPUB_EXT = [".epub"];

function detectType(name: string): "pdf" | "epub" | null {
  const lower = name.toLowerCase();
  if (PDF_EXT.some((e) => lower.endsWith(e))) return "pdf";
  if (EPUB_EXT.some((e) => lower.endsWith(e))) return "epub";
  return null;
}

export async function uploadDocument(formData: FormData) {
  const userId = await requireUserId();
  const file = formData.get("file");
  const titleInput = (formData.get("title") as string | null)?.trim();
  const authorInput = (formData.get("author") as string | null)?.trim();

  if (!(file instanceof File)) throw new Error("Thiếu file");
  if (file.size === 0) throw new Error("File rỗng");
  if (file.size > MAX_BYTES) throw new Error(`File quá lớn (>${MAX_BYTES / 1024 / 1024}MB)`);

  const type = detectType(file.name);
  if (!type) throw new Error("Chỉ hỗ trợ PDF hoặc EPUB");

  const buffer = Buffer.from(await file.arrayBuffer());
  const { key, size } = await storage.put(file.name, buffer);
  const id = newId("doc");
  const title = titleInput || file.name.replace(/\.[^.]+$/, "");

  db.insert(schema.documents)
    .values({
      id,
      userId,
      title,
      author: authorInput || null,
      fileKey: key,
      fileType: type,
      fileSize: size,
    })
    .run();

  revalidatePath("/library");
  return { id };
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(300),
  author: z.string().max(200).optional(),
});

export async function updateDocument(input: z.infer<typeof UpdateSchema>) {
  const userId = await requireUserId();
  const parsed = UpdateSchema.parse(input);
  db.update(schema.documents)
    .set({ title: parsed.title.trim(), author: parsed.author?.trim() || null })
    .where(and(eq(schema.documents.id, parsed.id), eq(schema.documents.userId, userId)))
    .run();
  revalidatePath("/library");
  revalidatePath(`/library/${parsed.id}`);
}

export async function touchDocument(id: string) {
  const userId = await requireUserId();
  db.update(schema.documents)
    .set({ lastOpenedAt: sql`(unixepoch())` })
    .where(and(eq(schema.documents.id, id), eq(schema.documents.userId, userId)))
    .run();
  revalidatePath("/library");
}

export async function deleteDocument(id: string) {
  const userId = await requireUserId();
  const doc = db
    .select()
    .from(schema.documents)
    .where(and(eq(schema.documents.id, id), eq(schema.documents.userId, userId)))
    .get();
  if (!doc) return;
  await storage.delete(doc.fileKey);
  db.delete(schema.documents)
    .where(and(eq(schema.documents.id, id), eq(schema.documents.userId, userId)))
    .run();
  revalidatePath("/library");
}
