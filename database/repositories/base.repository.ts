import Database from "better-sqlite3";
import { getDatabase } from "../client";

export abstract class BaseRepository {
  protected get db(): Database.Database { return getDatabase(); }
  protected transaction<T>(fn: () => T): T { return this.db.transaction(fn)(); }
  protected buildSet(fields: Record<string, unknown>): { set: string; vals: unknown[] } {
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
    return { set: entries.map(([k]) => `"${k}" = ?`).join(", "), vals: entries.map(([, v]) => v) };
  }
  protected audit(table: string, action: "INSERT" | "UPDATE" | "DELETE", recordId: number, oldData: unknown, newData: unknown, createdBy = "system"): void {
    this.db.prepare(`INSERT INTO AuditLog("table",action,recordId,oldData,newData,createdBy) VALUES (?,?,?,?,?,?)`)
      .run(table, action, recordId, oldData ? JSON.stringify(oldData) : null, newData ? JSON.stringify(newData) : null, createdBy);
  }
}
