import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _db: Database.Database | null = null;

export function getDbPath(): string {
  if (process.env["NODE_ENV"] === "test") return ":memory:";
  const base = process.env["APPDATA"] ?? process.env["HOME"] ?? ".";
  const dir = path.join(base, "KiranaPOS", "database");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "kirana.db");
}

export function getDatabase(): Database.Database {
  if (_db) return _db;
  _db = new Database(getDbPath());
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("synchronous = NORMAL");
  _db.pragma("cache_size = -32000");
  _db.pragma("temp_store = MEMORY");
  return _db;
}

export function closeDatabase(): void { _db?.close(); _db = null; }

export function withTransaction<T>(fn: (db: Database.Database) => T): T {
  const db = getDatabase();
  return db.transaction(() => fn(db))();
}
