import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_URL ?? "./data/notetaker.db";
const absDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
fs.mkdirSync(path.dirname(absDbPath), { recursive: true });

const sqlite = new Database(absDbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
