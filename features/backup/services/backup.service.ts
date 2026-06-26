import fs from "fs";
import path from "path";
import { getDbPath } from "../../../database/client";
import type { BackupMeta } from "../types";

function getBackupDir(): string {
  const base = process.env["APPDATA"] ?? process.env["HOME"] ?? ".";
  const dir = path.join(base, "KiranaPOS", "backups");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const backupService = {
  create(): BackupMeta {
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) throw new Error("Database file not found");
    const dir = getBackupDir();
    const filename = `kirana-backup-${new Date().toISOString().replace(/[:.]/g,"-")}.db`;
    const dest = path.join(dir, filename);
    fs.copyFileSync(dbPath, dest);
    const stat = fs.statSync(dest);
    return { filename, path: dest, sizeBytes: stat.size, createdAt: new Date().toISOString() };
  },
  list(): BackupMeta[] {
    const dir = getBackupDir();
    return fs.readdirSync(dir).filter((f) => f.endsWith(".db")).sort().reverse().map((filename) => {
      const p = path.join(dir, filename);
      const stat = fs.statSync(p);
      return { filename, path: p, sizeBytes: stat.size, createdAt: stat.mtime.toISOString() };
    });
  },
  restore(backupPath: string): void {
    if (!fs.existsSync(backupPath)) throw new Error("Backup file not found");
    const dbPath = getDbPath();
    if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, dbPath + ".pre-restore");
    fs.copyFileSync(backupPath, dbPath);
  },
};
