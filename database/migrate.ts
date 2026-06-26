import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { app } from "electron";

function getMigrationsDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "database", "migrations");
  }
  // Dev mode: __dirname is electron/dist/database, so go up to project root
  return path.join(__dirname, "../../../database/migrations");
}

export function runMigrations(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL UNIQUE, appliedAt TEXT NOT NULL DEFAULT (datetime('now')))`);
  const dir = getMigrationsDir();
  console.log("[Migration] Looking for migrations in:", dir);
  if (!fs.existsSync(dir)) {
    console.error("[Migration] Directory not found:", dir);
    return;
  }
  const applied = new Set((db.prepare("SELECT filename FROM _migrations").all() as { filename: string }[]).map((r) => r.filename));
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (applied.has(file)) continue;
    db.transaction(() => { db.exec(fs.readFileSync(path.join(dir, file), "utf-8")); db.prepare("INSERT INTO _migrations(filename) VALUES (?)").run(file); })();
    console.log(`[Migration] ${file}`);
  }
}