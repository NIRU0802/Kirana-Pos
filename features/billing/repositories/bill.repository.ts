import { BaseRepository } from "../../../database/repositories/base.repository";
import type { CreateBillInput, BillRow, BillItemRow } from "../types";

export class BillRepository extends BaseRepository {
  private nextBillNumber(): string {
    const prefix = (this.db.prepare<[string],{value:string}>("SELECT value FROM Settings WHERE key=?").get("billPrefix")?.value ?? "INV");
    const counter = parseInt(this.db.prepare<[string],{value:string}>("SELECT value FROM Settings WHERE key=?").get("billCounter")?.value ?? "1", 10);
    this.db.prepare("UPDATE Settings SET value=?,updatedAt=? WHERE key='billCounter'").run(String(counter+1), new Date().toISOString());
    return `${prefix}-${String(counter).padStart(6,"0")}`;
  }
  create(input: CreateBillInput): number {
    const now = new Date().toISOString();
    return this.transaction(() => {
      const billNumber = this.nextBillNumber();
      const r = this.db.prepare(`INSERT INTO Bill(billNumber,customerId,subtotal,gstTotal,discount,roundOff,grandTotal,amountPaid,changeDue,paymentMethod,note,createdAt,updatedAt,createdBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(billNumber,input.customerId??null,input.subtotal,input.gstTotal,input.discount,input.roundOff,input.grandTotal,input.amountPaid,input.changeDue,input.paymentMethod,input.note??null,now,now,input.createdBy??"system");
      const billId = r.lastInsertRowid as number;
      const stmt = this.db.prepare(`INSERT INTO BillItem(billId,productId,productName,quantity,unitPrice,costPrice,gstRate,gstAmount,lineTotal) VALUES (?,?,?,?,?,?,?,?,?)`);
      for (const item of input.items) stmt.run(billId,item.productId,item.productName,item.quantity,item.unitPrice,item.costPrice,item.gstRate,item.gstAmount,item.lineTotal);
      this.audit("Bill","INSERT",billId,null,{billNumber,grandTotal:input.grandTotal},input.createdBy??"system");
      return billId;
    });
  }
  getById(id: number): (BillRow & { items: BillItemRow[] }) | undefined {
    const bill = this.db.prepare<[number],BillRow>(`SELECT b.*,c.name AS customerName FROM Bill b LEFT JOIN Customer c ON c.id=b.customerId WHERE b.id=?`).get(id);
    if (!bill) return undefined;
    return { ...bill, items: this.db.prepare<[number],BillItemRow>("SELECT * FROM BillItem WHERE billId=?").all(id) };
  }
  getRecent(limit = 50): BillRow[] {
    return this.db.prepare<[],BillRow>(`SELECT b.*,c.name AS customerName FROM Bill b LEFT JOIN Customer c ON c.id=b.customerId ORDER BY b.createdAt DESC LIMIT ${limit}`).all();
  }
  search(query: string): BillRow[] {
    const like = `%${query}%`;
    return this.db.prepare<[string,string],BillRow>(`SELECT b.*,c.name AS customerName FROM Bill b LEFT JOIN Customer c ON c.id=b.customerId WHERE b.billNumber LIKE ? OR c.name LIKE ? ORDER BY b.createdAt DESC LIMIT 50`).all(like,like);
  }
  refund(billId: number, amount: number, reason: string, refundedBy: string): number {
    const now = new Date().toISOString();
    const r = this.db.prepare("INSERT INTO Refund(billId,amount,reason,refundedBy,createdAt) VALUES (?,?,?,?,?)").run(billId,amount,reason,refundedBy,now);
    this.db.prepare("UPDATE Bill SET status='REFUNDED',updatedAt=? WHERE id=?").run(now,billId);
    this.audit("Refund","INSERT",r.lastInsertRowid as number,null,{billId,amount,reason},refundedBy);
    return r.lastInsertRowid as number;
  }
}
