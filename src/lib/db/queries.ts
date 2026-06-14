import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";

/** All tag names for a user, sorted alphabetically. Useful for autocomplete. */
export function getUserTagNames(userId: string): string[] {
  return db
    .select({ name: schema.tags.name })
    .from(schema.tags)
    .where(eq(schema.tags.userId, userId))
    .all()
    .map((r) => r.name)
    .sort();
}

/** Resolve a tag by name for a user. */
export function findTagByName(userId: string, name: string) {
  return db
    .select()
    .from(schema.tags)
    .where(and(eq(schema.tags.userId, userId), eq(schema.tags.name, name.toLowerCase())))
    .get();
}
