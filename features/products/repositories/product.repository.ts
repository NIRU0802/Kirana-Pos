import { BaseRepository } from "../../../database/repositories/base.repository";
import type { CreateProductInput, UpdateProductInput } from "../types";

export interface ProductRow {
  id: number; barcode: string | null; name: string; description: string | null;
  categoryId: number | null; categoryName: string | null; unit: string;
  costPrice: number; sellingPrice: number; mrp: number; gstRate: number;
  hsnCode: string | null; isActive: number; lowStockAlert: number;
  stock: number; createdAt: string; updatedAt: string;
  expiryDate: string | null; expiryAlertDays: number;
}

const SEL = `SELECT p.*, c.name AS categoryName, COALESCE(s.quantity,0) AS stock
  FROM Product p LEFT JOIN Category c ON c.id=p.categoryId LEFT JOIN Stock s ON s.productId=p.id`;

export class ProductRepository extends BaseRepository {
  getByName(name: string): ProductRow | undefined {
    return this.db.prepare<[string], ProductRow>(`${SEL} WHERE p.name=? COLLATE NOCASE AND p.isActive=1`).get(name);
  }
  getAll(): ProductRow[] { return this.db.prepare<[], ProductRow>(`${SEL} WHERE p.isActive=1 ORDER BY p.name`).all(); }
  getById(id: number): ProductRow | undefined { return this.db.prepare<[number], ProductRow>(`${SEL} WHERE p.id=?`).get(id); }
  getByBarcode(b: string): ProductRow | undefined { return this.db.prepare<[string], ProductRow>(`${SEL} WHERE p.barcode=? AND p.isActive=1`).get(b); }
  search(q: string, limit = 20): ProductRow[] {
    const like = `%${q}%`;
    return this.db.prepare<[string, string], ProductRow>(`${SEL} WHERE p.isActive=1 AND (p.name LIKE ? OR p.barcode LIKE ?) ORDER BY p.name LIMIT ${limit}`).all(like, like);
  }
  create(i: CreateProductInput, createdBy = "system"): number {
    const now = new Date().toISOString();
    const r = this.db.prepare(
      `INSERT INTO Product(barcode,name,description,categoryId,unit,costPrice,sellingPrice,mrp,gstRate,hsnCode,lowStockAlert,expiryDate,expiryAlertDays,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      i.barcode ?? null, i.name, i.description ?? null, i.categoryId ?? null,
      i.unit, i.costPrice, i.sellingPrice, i.mrp, i.gstRate, i.hsnCode ?? null,
      i.lowStockAlert, i.expiryDate ?? null, i.expiryAlertDays ?? 30, now, now
    );
    const id = r.lastInsertRowid as number;
    this.db.prepare("INSERT INTO Stock(productId,quantity,updatedAt) VALUES (?,?,?)").run(id, i.openingStock ?? 0, now);
    if ((i.openingStock ?? 0) > 0) {
      this.db.prepare(`INSERT INTO StockMovement(productId,type,quantity,costPrice,note,createdAt,createdBy) VALUES (?,?,?,?,?,?,?)`)
        .run(id, "OPENING_STOCK", i.openingStock, i.costPrice, "Opening stock", now, createdBy);
    }
    this.audit("Product", "INSERT", id, null, i, createdBy);
    return id;
  }
  update(i: UpdateProductInput, createdBy = "system"): boolean {
    const old = this.getById(i.id);
    const fields: Record<string, unknown> = {};
    const keys = ["barcode","name","description","categoryId","unit","costPrice","sellingPrice","mrp","gstRate","hsnCode","isActive","lowStockAlert","expiryDate","expiryAlertDays"] as const;
    for (const k of keys) {
      if ((i as unknown as Record<string, unknown>)[k] !== undefined) {
        fields[k] = k === "isActive" ? ((i[k] as boolean) ? 1 : 0) : (i as unknown as Record<string, unknown>)[k];
      }
    }
    fields["updatedAt"] = new Date().toISOString();
    const { set, vals } = this.buildSet(fields);
    const res = this.db.prepare(`UPDATE Product SET ${set} WHERE id=?`).run(...vals, i.id);
    if (res.changes > 0) this.audit("Product", "UPDATE", i.id, old, i, createdBy);
    return res.changes > 0;
  }
  softDelete(id: number, createdBy = "system"): boolean {
    const old = this.getById(id);
    const r = this.db.prepare("UPDATE Product SET isActive=0,updatedAt=? WHERE id=?").run(new Date().toISOString(), id);
    if (r.changes > 0) this.audit("Product", "DELETE", id, old, null, createdBy);
    return r.changes > 0;
  }
}