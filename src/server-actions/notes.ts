"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { newId } from "@/lib/ids";
import { syncTaggings, extractHashtags } from "@/lib/hashtags";
import { z } from "zod";

const CreateSchema = z.object({
  content: z.string().min(1).max(50_000),
  extraTags: z.array(z.string()).optional(),
});

const UpdateSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1).max(50_000),
  extraTags: z.array(z.string()).optional(),
});

export async function createNote(input: z.infer<typeof CreateSchema>) {
  const userId = await requireUserId();
  const parsed = CreateSchema.parse(input);
  const id = newId("nt");
  db.insert(schema.notes).values({ id, userId, content: parsed.content }).run();
  const tags = Array.from(new Set([...extractHashtags(parsed.content), ...(parsed.extraTags ?? [])]));
  if (tags.length > 0) syncTaggings(userId, "note", id, tags);
  revalidatePath("/notes");
  revalidatePath("/");
  return { id };
}

export async function updateNote(input: z.infer<typeof UpdateSchema>) {
  const userId = await requireUserId();
  const parsed = UpdateSchema.parse(input);
  db.update(schema.notes)
    .set({ content: parsed.content, updatedAt: sql`(unixepoch())` })
    .where(and(eq(schema.notes.id, parsed.id), eq(schema.notes.userId, userId)))
    .run();
  const tags = Array.from(new Set([...extractHashtags(parsed.content), ...(parsed.extraTags ?? [])]));
  syncTaggings(userId, "note", parsed.id, tags);
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function deleteNote(id: string) {
  const userId = await requireUserId();
  db.delete(schema.taggings)
    .where(and(eq(schema.taggings.entityType, "note"), eq(schema.taggings.entityId, id)))
    .run();
  db.delete(schema.notes)
    .where(and(eq(schema.notes.id, id), eq(schema.notes.userId, userId)))
    .run();
  revalidatePath("/notes");
  revalidatePath("/");
}
