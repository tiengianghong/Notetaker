import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

let _db: BetterSQLite3Database<typeof schema> | null = null;

function open() {
  const dbPath = process.env.DATABASE_URL ?? "./data/notetaker.db";
  const absDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
  fs.mkdirSync(path.dirname(absDbPath), { recursive: true });
  const sqlite = new Database(absDbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

// Lazy proxy: defer opening the SQLite file until first method call.
// This prevents Next.js page-data collection (which evaluates route modules
// in parallel workers) from racing on the same db file at build time.
export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop, receiver) {
    if (!_db) _db = open();
    const value = Reflect.get(_db, prop, receiver);
    return typeof value === "function" ? value.bind(_db) : value;
  },
});

export { schema };
