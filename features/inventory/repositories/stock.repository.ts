import { BaseRepository } from "../../../database/repositories/base.repository";
import type { StockMovementType } from "../../../shared/types";
import type { StockRow, MovementRow } from "../types";


export class StockRepository extends BaseRepository {
  getAll(): StockRow[] {
    return this.db.prepare<[], StockRow>(`SELECT s.productId,p.name AS productName,p.unit,s.quantity,p.lowStockAlert FROM Stock s JOIN Product p ON p.id=s.productId WHERE p.isActive=1 ORDER BY p.name`).all();
  }
  getLowStock(): StockRow[] {
    return this.db.prepare<[], StockRow>(`SELECT s.productId,p.name AS productName,p.unit,s.quantity,p.lowStockAlert FROM Stock s JOIN Product p ON p.id=s.productId WHERE p.isActive=1 AND s.quantity<=p.lowStockAlert ORDER BY s.quantity`).all();
  }
  getExpiringSoon(): (StockRow & { expiryDate: string | null; expiryAlertDays: number })[] {
    return this.db.prepare<[], StockRow & { expiryDate: string | null; expiryAlertDays: number }>(
      `SELECT s.productId, p.name AS productName, p.unit, s.quantity, p.lowStockAlert, p.expiryDate, p.expiryAlertDays
       FROM Stock s JOIN Product p ON p.id = s.productId
       WHERE p.isActive = 1 AND p.expiryDate IS NOT NULL
         AND date(p.expiryDate) <= date('now', '+' || p.expiryAlertDays || ' days')
       ORDER BY date(p.expiryDate) ASC`
    ).all();
  }
  getByProduct(productId: number): number {
    return this.db.prepare<[number],{quantity:number}>("SELECT COALESCE(quantity,0) AS quantity FROM Stock WHERE productId=?").get(productId)?.quantity ?? 0;
  }
  adjust(productId: number, type: StockMovementType, quantity: number, costPrice = 0, referenceId?: number, note?: string, createdBy = "system"): number {
    const out = ["SALE","ADJUSTMENT_OUT","DAMAGE"];
    const delta = out.includes(type) ? -Math.abs(quantity) : Math.abs(quantity);
    const now = new Date().toISOString();
    return this.transaction(() => {
      this.db.prepare(`INSERT INTO Stock(productId,quantity,updatedAt) VALUES (?,MAX(0,?),?) ON CONFLICT(productId) DO UPDATE SET quantity=MAX(0,quantity+excluded.quantity),updatedAt=excluded.updatedAt`)
        .run(productId, delta, now);
      this.db.prepare(`INSERT INTO StockMovement(productId,type,quantity,costPrice,referenceId,note,createdAt,createdBy) VALUES (?,?,?,?,?,?,?,?)`)
        .run(productId, type, quantity, costPrice, referenceId??null, note??null, now, createdBy);
      return this.db.prepare<[number],{quantity:number}>("SELECT quantity FROM Stock WHERE productId=?").get(productId)?.quantity ?? 0;
    });
  }
  getMovements(productId: number, limit = 50): MovementRow[] {
    return this.db.prepare<[number],MovementRow>(`SELECT sm.*,p.name AS productName FROM StockMovement sm JOIN Product p ON p.id=sm.productId WHERE sm.productId=? ORDER BY sm.createdAt DESC LIMIT ${limit}`).all(productId);
  }
}
