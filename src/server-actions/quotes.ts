"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { newId } from "@/lib/ids";
import { syncTaggings, extractHashtags } from "@/lib/hashtags";
import { z } from "zod";

const CreateSchema = z.object({
  content: z.string().min(1).max(20_000),
  note: z.string().max(5000).optional(),
  documentId: z.string().optional(),
  location: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1).max(20_000).optional(),
  note: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
});

export async function createQuote(input: z.infer<typeof CreateSchema>) {
  const userId = await requireUserId();
  const parsed = CreateSchema.parse(input);
  const id = newId("qt");

  // verify the document belongs to the user (if provided)
  let docId: string | null = null;
  if (parsed.documentId) {
    const doc = db
      .select({ id: schema.documents.id })
      .from(schema.documents)
      .where(and(eq(schema.documents.id, parsed.documentId), eq(schema.documents.userId, userId)))
      .get();
    if (!doc) throw new Error("Document không tồn tại");
    docId = doc.id;
  }

  db.insert(schema.quotes)
    .values({
      id,
      userId,
      documentId: docId,
      content: parsed.content.trim(),
      note: parsed.note?.trim() || null,
      location: parsed.location || null,
    })
    .run();

  const inline = extractHashtags(`${parsed.content} ${parsed.note ?? ""}`);
  const allTags = Array.from(new Set([...(parsed.tags ?? []), ...inline]));
  if (allTags.length > 0) syncTaggings(userId, "quote", id, allTags);

  revalidatePath("/quotes");
  revalidatePath("/");
  if (docId) revalidatePath(`/library/${docId}`);
  return { id };
}

export async function updateQuote(input: z.infer<typeof UpdateSchema>) {
  const userId = await requireUserId();
  const parsed = UpdateSchema.parse(input);
  const set: Record<string, unknown> = {};
  if (parsed.content !== undefined) set.content = parsed.content.trim();
  if (parsed.note !== undefined) set.note = parsed.note?.trim() || null;
  if (Object.keys(set).length > 0) {
    db.update(schema.quotes)
      .set(set)
      .where(and(eq(schema.quotes.id, parsed.id), eq(schema.quotes.userId, userId)))
      .run();
  }
  if (parsed.tags !== undefined || parsed.content !== undefined || parsed.note !== undefined) {
    const fresh = db
      .select({ content: schema.quotes.content, note: schema.quotes.note })
      .from(schema.quotes)
      .where(and(eq(schema.quotes.id, parsed.id), eq(schema.quotes.userId, userId)))
      .get();
    const inline = extractHashtags(`${fresh?.content ?? ""} ${fresh?.note ?? ""}`);
    const explicit = parsed.tags ?? [];
    syncTaggings(userId, "quote", parsed.id, Array.from(new Set([...explicit, ...inline])));
  }
  revalidatePath("/quotes");
}

export async function deleteQuote(id: string) {
  const userId = await requireUserId();
  db.delete(schema.taggings)
    .where(and(eq(schema.taggings.entityType, "quote"), eq(schema.taggings.entityId, id)))
    .run();
  db.delete(schema.quotes)
    .where(and(eq(schema.quotes.id, id), eq(schema.quotes.userId, userId)))
    .run();
  revalidatePath("/quotes");
}
