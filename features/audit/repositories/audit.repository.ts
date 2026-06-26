import { BaseRepository } from "../../../database/repositories/base.repository";
export interface AuditRow { id:number; table:string; action:string; recordId:number; oldData:string|null; newData:string|null; createdBy:string; createdAt:string; }
export interface AuditFilters { table?:string; action?:string; from?:string; to?:string; page?:number; limit?:number; }

export class AuditRepository extends BaseRepository {
  getLogs(filters: AuditFilters = {}): { data: AuditRow[]; total: number } {
    const { table, action, from, to, page = 1, limit = 50 } = filters;
    const conditions: string[] = []; const params: unknown[] = [];
    if (table) { conditions.push(`"table"=?`); params.push(table); }
    if (action) { conditions.push(`action=?`); params.push(action); }
    if (from) { conditions.push(`date(createdAt)>=date(?)`); params.push(from); }
    if (to) { conditions.push(`date(createdAt)<=date(?)`); params.push(to); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const total = (this.db.prepare<unknown[],{count:number}>(`SELECT COUNT(*) AS count FROM AuditLog ${where}`).get(...params) as {count:number}).count;
    const offset = (page - 1) * limit;
    const data = this.db.prepare<unknown[],AuditRow>(`SELECT * FROM AuditLog ${where} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`).all(...params);
    return { data, total };
  }
}
