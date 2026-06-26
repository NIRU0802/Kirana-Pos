import { BaseRepository } from "../../../database/repositories/base.repository";

import type { Category } from "../types";

export class CategoryRepository extends BaseRepository {
  getAll(): Category[] {
    return this.db.prepare<[], Category>(`SELECT c.id,c.name,COUNT(p.id) AS productCount FROM Category c LEFT JOIN Product p ON p.categoryId=c.id AND p.isActive=1 GROUP BY c.id ORDER BY c.name`).all();
  }
  getById(id: number): Category | undefined {
    return this.db.prepare<[number], Category>(`SELECT c.id,c.name,COUNT(p.id) AS productCount FROM Category c LEFT JOIN Product p ON p.categoryId=c.id AND p.isActive=1 WHERE c.id=? GROUP BY c.id`).get(id);
  }
  create(name: string, createdBy = "system"): number {
    const r = this.db.prepare("INSERT INTO Category(name) VALUES (?)").run(name);
    const id = r.lastInsertRowid as number;
    this.audit("Category","INSERT",id,null,{name},createdBy);
    return id;
  }
  update(id: number, name: string, createdBy = "system"): boolean {
    const old = this.getById(id);
    const r = this.db.prepare("UPDATE Category SET name=? WHERE id=?").run(name, id);
    if (r.changes > 0) this.audit("Category","UPDATE",id,old,{name},createdBy);
    return r.changes > 0;
  }
  delete(id: number, createdBy = "system"): boolean {
    const old = this.getById(id);
    const r = this.db.prepare("DELETE FROM Category WHERE id=?").run(id);
    if (r.changes > 0) this.audit("Category","DELETE",id,old,null,createdBy);
    return r.changes > 0;
  }
}
