import { BaseRepository } from "../../../database/repositories/base.repository";
import type { CreateCustomerInput, UpdateCustomerInput, LedgerEntry } from "../types";

export interface CustomerRow { id: number; name: string; phone: string | null; address: string | null; creditLimit: number; creditBalance: number; isActive: number; createdAt: string; updatedAt: string; }

export class CustomerRepository extends BaseRepository {
  getAll(): CustomerRow[] { return this.db.prepare<[],CustomerRow>("SELECT * FROM Customer WHERE isActive=1 ORDER BY name").all(); }
  getById(id: number): CustomerRow | undefined { return this.db.prepare<[number],CustomerRow>("SELECT * FROM Customer WHERE id=?").get(id); }
  search(q: string): CustomerRow[] {
    const like = `%${q}%`;
    return this.db.prepare<[string,string],CustomerRow>("SELECT * FROM Customer WHERE isActive=1 AND (name LIKE ? OR phone LIKE ?) ORDER BY name LIMIT 20").all(like,like);
  }
  create(i: CreateCustomerInput, createdBy = "system"): number {
    const now = new Date().toISOString();
    const r = this.db.prepare("INSERT INTO Customer(name,phone,address,creditLimit,createdAt,updatedAt) VALUES (?,?,?,?,?,?)").run(i.name,i.phone??null,i.address??null,i.creditLimit??0,now,now);
    const id = r.lastInsertRowid as number;
    this.audit("Customer","INSERT",id,null,i,createdBy);
    return id;
  }
  update(i: UpdateCustomerInput, createdBy = "system"): boolean {
    const old = this.getById(i.id);
    const fields: Record<string,unknown> = {};
    if (i.name !== undefined) fields["name"] = i.name;
    if (i.phone !== undefined) fields["phone"] = i.phone;
    if (i.address !== undefined) fields["address"] = i.address;
    if (i.creditLimit !== undefined) fields["creditLimit"] = i.creditLimit;
    if (i.isActive !== undefined) fields["isActive"] = i.isActive ? 1 : 0;
    fields["updatedAt"] = new Date().toISOString();
    const { set, vals } = this.buildSet(fields);
    const r = this.db.prepare(`UPDATE Customer SET ${set} WHERE id=?`).run(...vals, i.id);
    if (r.changes > 0) this.audit("Customer","UPDATE",i.id,old,i,createdBy);
    return r.changes > 0;
  }
  addCreditLedger(customerId: number, type: "CREDIT"|"DEBIT"|"SETTLEMENT", amount: number, billId?: number, note?: string): void {
    this.db.prepare("INSERT INTO CreditLedger(customerId,type,amount,billId,note) VALUES (?,?,?,?,?)").run(customerId,type,amount,billId??null,note??null);
    const delta = type === "DEBIT" ? amount : -amount;
    this.db.prepare("UPDATE Customer SET creditBalance=creditBalance+?,updatedAt=? WHERE id=?").run(delta,new Date().toISOString(),customerId);
  }
  getLedger(customerId: number, limit = 100): LedgerEntry[] {
    return this.db.prepare<[number],LedgerEntry>("SELECT * FROM CreditLedger WHERE customerId=? ORDER BY createdAt DESC LIMIT "+limit).all(customerId);
  }
}
