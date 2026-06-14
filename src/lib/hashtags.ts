import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { and, eq, inArray } from "drizzle-orm";
import type { EntityType } from "@/lib/db/schema";

// Vietnamese-aware hashtag regex: allow Unicode letters/digits, underscore, hyphen
// Matches "#" followed by 1+ chars, NOT preceded by a word char (so "abc#def" is NOT a tag).
const HASHTAG_REGEX = /(?<![\p{L}\p{N}_])#([\p{L}\p{N}_-]+)/gu;

export function extractHashtags(content: string): string[] {
  if (!content) return [];
  const found = new Set<string>();
  for (const match of content.matchAll(HASHTAG_REGEX)) {
    const tag = match[1].toLowerCase();
    if (tag.length > 0 && tag.length <= 64) found.add(tag);
  }
  return Array.from(found);
}

/**
 * Upsert tags for a user. Returns the tag rows (id + name).
 */
export function upsertTags(userId: string, names: string[]): { id: string; name: string }[] {
  const unique = Array.from(new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean)));
  if (unique.length === 0) return [];

  const existing = db
    .select({ id: schema.tags.id, name: schema.tags.name })
    .from(schema.tags)
    .where(and(eq(schema.tags.userId, userId), inArray(schema.tags.name, unique)))
    .all();

  const existingNames = new Set(existing.map((t) => t.name));
  const toCreate = unique.filter((n) => !existingNames.has(n));

  if (toCreate.length > 0) {
    const rows = toCreate.map((name) => ({ id: newId("tag"), userId, name }));
    db.insert(schema.tags).values(rows).run();
    return [...existing, ...rows.map((r) => ({ id: r.id, name: r.name }))];
  }
  return existing;
}

/**
 * Reconcile taggings for an entity:
 *  - ensure a tagging exists for each name (creating tags as needed)
 *  - delete any taggings on this entity whose tag.name is not in `names`
 */
export function syncTaggings(
  userId: string,
  entityType: EntityType,
  entityId: string,
  names: string[],
): { id: string; name: string }[] {
  const tags = upsertTags(userId, names);
  const desiredTagIds = new Set(tags.map((t) => t.id));

  const current = db
    .select({ id: schema.taggings.id, tagId: schema.taggings.tagId })
    .from(schema.taggings)
    .where(
      and(eq(schema.taggings.entityType, entityType), eq(schema.taggings.entityId, entityId)),
    )
    .all();

  const currentTagIds = new Set(current.map((t) => t.tagId));

  // delete removed
  const toDelete = current.filter((t) => !desiredTagIds.has(t.tagId)).map((t) => t.id);
  if (toDelete.length > 0) {
    db.delete(schema.taggings).where(inArray(schema.taggings.id, toDelete)).run();
  }

  // insert new
  const toInsert = tags
    .filter((t) => !currentTagIds.has(t.id))
    .map((t) => ({ id: newId("tgn"), tagId: t.id, entityType, entityId }));
  if (toInsert.length > 0) {
    db.insert(schema.taggings).values(toInsert).run();
  }

  return tags;
}

/**
 * Fetch tags currently attached to an entity (joined with names).
 */
export function getTagsForEntity(entityType: EntityType, entityId: string) {
  return db
    .select({ id: schema.tags.id, name: schema.tags.name })
    .from(schema.taggings)
    .innerJoin(schema.tags, eq(schema.taggings.tagId, schema.tags.id))
    .where(
      and(eq(schema.taggings.entityType, entityType), eq(schema.taggings.entityId, entityId)),
    )
    .all();
}

/**
 * Fetch tags for many entities of the same type. Returns Map<entityId, Tag[]>.
 */
export function getTagsForEntities(entityType: EntityType, entityIds: string[]) {
  const map = new Map<string, { id: string; name: string }[]>();
  if (entityIds.length === 0) return map;
  const rows = db
    .select({
      entityId: schema.taggings.entityId,
      id: schema.tags.id,
      name: schema.tags.name,
    })
    .from(schema.taggings)
    .innerJoin(schema.tags, eq(schema.taggings.tagId, schema.tags.id))
    .where(
      and(
        eq(schema.taggings.entityType, entityType),
        inArray(schema.taggings.entityId, entityIds),
      ),
    )
    .all();
  for (const row of rows) {
    const arr = map.get(row.entityId) ?? [];
    arr.push({ id: row.id, name: row.name });
    map.set(row.entityId, arr);
  }
  return map;
}
