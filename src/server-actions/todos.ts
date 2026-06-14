"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { newId } from "@/lib/ids";
import { syncTaggings, extractHashtags } from "@/lib/hashtags";
import { z } from "zod";

const PriorityEnum = z.enum(["low", "medium", "high"]);

const CreateSchema = z.object({
  title: z.string().min(1).max(500),
  notes: z.string().max(5000).optional(),
  dueDate: z.string().optional(), // YYYY-MM-DD
  priority: PriorityEnum.optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateSchema = CreateSchema.partial().extend({ id: z.string().min(1) });

function toUnixDay(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return Math.floor(d.getTime() / 1000);
}

export async function createTodo(input: z.infer<typeof CreateSchema>) {
  const userId = await requireUserId();
  const parsed = CreateSchema.parse(input);
  const id = newId("td");
  db.insert(schema.todos)
    .values({
      id,
      userId,
      title: parsed.title.trim(),
      notes: parsed.notes?.trim() || null,
      dueDate: toUnixDay(parsed.dueDate) ?? null,
      priority: parsed.priority ?? null,
    })
    .run();

  // explicit tags + inline #tags from notes
  const inline = extractHashtags(parsed.notes ?? "");
  const allTags = Array.from(new Set([...(parsed.tags ?? []), ...inline]));
  if (allTags.length > 0) {
    syncTaggings(userId, "todo", id, allTags);
  }
  revalidatePath("/todos");
  revalidatePath("/");
  return { id };
}

export async function updateTodo(input: z.infer<typeof UpdateSchema>) {
  const userId = await requireUserId();
  const parsed = UpdateSchema.parse(input);
  const set: Record<string, unknown> = { updatedAt: sql`(unixepoch())` };
  if (parsed.title !== undefined) set.title = parsed.title.trim();
  if (parsed.notes !== undefined) set.notes = parsed.notes?.trim() || null;
  if (parsed.dueDate !== undefined) set.dueDate = toUnixDay(parsed.dueDate) ?? null;
  if (parsed.priority !== undefined) set.priority = parsed.priority ?? null;

  db.update(schema.todos)
    .set(set)
    .where(and(eq(schema.todos.id, parsed.id), eq(schema.todos.userId, userId)))
    .run();

  if (parsed.tags !== undefined || parsed.notes !== undefined) {
    const todo = db
      .select({ notes: schema.todos.notes })
      .from(schema.todos)
      .where(and(eq(schema.todos.id, parsed.id), eq(schema.todos.userId, userId)))
      .get();
    const inline = extractHashtags(todo?.notes ?? "");
    const explicit = parsed.tags ?? [];
    syncTaggings(userId, "todo", parsed.id, Array.from(new Set([...explicit, ...inline])));
  }

  revalidatePath("/todos");
  revalidatePath("/");
}

export async function toggleTodo(id: string, done: boolean) {
  const userId = await requireUserId();
  db.update(schema.todos)
    .set({ done, updatedAt: sql`(unixepoch())` })
    .where(and(eq(schema.todos.id, id), eq(schema.todos.userId, userId)))
    .run();
  revalidatePath("/todos");
  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  const userId = await requireUserId();
  db.delete(schema.taggings)
    .where(and(eq(schema.taggings.entityType, "todo"), eq(schema.taggings.entityId, id)))
    .run();
  db.delete(schema.todos)
    .where(and(eq(schema.todos.id, id), eq(schema.todos.userId, userId)))
    .run();
  revalidatePath("/todos");
  revalidatePath("/");
}
