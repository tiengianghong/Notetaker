import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const now = sql`(unixepoch())`;

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at").notNull().default(now),
});

export const todos = sqliteTable(
  "todos",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    notes: text("notes"),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    dueDate: integer("due_date"), // unix seconds, nullable
    priority: text("priority", { enum: ["low", "medium", "high"] }),
    createdAt: integer("created_at").notNull().default(now),
    updatedAt: integer("updated_at").notNull().default(now),
  },
  (t) => [
    index("todos_user_done_idx").on(t.userId, t.done),
    index("todos_user_due_idx").on(t.userId, t.dueDate),
  ],
);

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull().default(""),
    createdAt: integer("created_at").notNull().default(now),
    updatedAt: integer("updated_at").notNull().default(now),
  },
  (t) => [index("notes_user_updated_idx").on(t.userId, t.updatedAt)],
);

export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    author: text("author"),
    fileKey: text("file_key").notNull(), // storage key (local path or R2 key)
    fileType: text("file_type", { enum: ["pdf", "epub"] }).notNull(),
    fileSize: integer("file_size").notNull(),
    lastOpenedAt: integer("last_opened_at"),
    createdAt: integer("created_at").notNull().default(now),
  },
  (t) => [index("documents_user_idx").on(t.userId)],
);

export const quotes = sqliteTable(
  "quotes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    documentId: text("document_id").references(() => documents.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    location: text("location"), // page number for PDF, CFI for EPUB
    note: text("note"),
    createdAt: integer("created_at").notNull().default(now),
  },
  (t) => [
    index("quotes_user_idx").on(t.userId, t.createdAt),
    index("quotes_document_idx").on(t.documentId),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: integer("created_at").notNull().default(now),
  },
  (t) => [uniqueIndex("tags_user_name_idx").on(t.userId, t.name)],
);

// Polymorphic tagging: ties a tag to a note / quote / todo
export const taggings = sqliteTable(
  "taggings",
  {
    id: text("id").primaryKey(),
    tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
    entityType: text("entity_type", { enum: ["note", "quote", "todo"] }).notNull(),
    entityId: text("entity_id").notNull(),
  },
  (t) => [
    uniqueIndex("taggings_unique_idx").on(t.tagId, t.entityType, t.entityId),
    index("taggings_entity_idx").on(t.entityType, t.entityId),
  ],
);

export type User = typeof users.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Tagging = typeof taggings.$inferSelect;

export type EntityType = "note" | "quote" | "todo";
