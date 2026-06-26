import { BaseRepository } from "../../../database/repositories/base.repository";

export interface BillExportRow {
  id: number;
  billNumber: string;
  customerId: number | null;
  customerName: string | null;
  subtotal: number;
  gstTotal: number;
  discount: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  changeDue: number;
  paymentMethod: string;
  status: string;
  itemCount: number;
  createdAt: string;
}

export interface CreditLedgerExportRow {
  id: number;
  customerId: number;
  customerName: string;
  type: string;
  amount: number;
  billId: number | null;
  note: string | null;
  createdAt: string;
}

export interface ProductSnapshotRow {
  id: number;
  barcode: string | null;
  name: string;
  categoryName: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  gstRate: number;
  hsnCode: string | null;
  lowStockAlert: number;
  isActive: number;
  stock: number;
  createdAt: string;
}

export interface CustomerSnapshotRow {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  creditLimit: number;
  creditBalance: number;
  isActive: number;
  createdAt: string;
}

export interface InventorySnapshotRow {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  lowStockAlert: number;
  costPrice: number;
  stockValue: number; // quantity * costPrice, in paise
}

export class ExportRepository extends BaseRepository {
  getBillsForDate(startIso: string, endIso: string): BillExportRow[] {
    return this.db.prepare<[string, string], BillExportRow>(
      `SELECT b.id, b.billNumber, b.customerId, c.name AS customerName,
              b.subtotal, b.gstTotal, b.discount, b.roundOff, b.grandTotal,
              b.amountPaid, b.changeDue, b.paymentMethod, b.status,
              (SELECT COUNT(*) FROM BillItem bi WHERE bi.billId = b.id) AS itemCount,
              b.createdAt
       FROM Bill b
       LEFT JOIN Customer c ON c.id = b.customerId
       WHERE b.createdAt >= ? AND b.createdAt < ?
       ORDER BY b.createdAt ASC`
    ).all(startIso, endIso);
  }

  getCreditLedgerForDate(startIso: string, endIso: string): CreditLedgerExportRow[] {
    return this.db.prepare<[string, string], CreditLedgerExportRow>(
      `SELECT cl.id, cl.customerId, c.name AS customerName, cl.type, cl.amount,
              cl.billId, cl.note, cl.createdAt
       FROM CreditLedger cl
       JOIN Customer c ON c.id = cl.customerId
       WHERE cl.createdAt >= ? AND cl.createdAt < ?
       ORDER BY cl.createdAt ASC`
    ).all(startIso, endIso);
  }

  getAllProductsSnapshot(): ProductSnapshotRow[] {
    return this.db.prepare<[], ProductSnapshotRow>(
      `SELECT p.id, p.barcode, p.name, c.name AS categoryName, p.unit,
              p.costPrice, p.sellingPrice, p.mrp, p.gstRate, p.hsnCode,
              p.lowStockAlert, p.isActive, COALESCE(s.quantity,0) AS stock, p.createdAt
       FROM Product p
       LEFT JOIN Category c ON c.id = p.categoryId
       LEFT JOIN Stock s ON s.productId = p.id
       ORDER BY p.name`
    ).all();
  }

  getAllCustomersSnapshot(): CustomerSnapshotRow[] {
    return this.db.prepare<[], CustomerSnapshotRow>(
      `SELECT id, name, phone, address, creditLimit, creditBalance, isActive, createdAt
       FROM Customer ORDER BY name`
    ).all();
  }

  getAllInventorySnapshot(): InventorySnapshotRow[] {
    return this.db.prepare<[], InventorySnapshotRow>(
      `SELECT s.productId, p.name AS productName, p.unit, s.quantity, p.lowStockAlert, p.costPrice,
              (s.quantity * p.costPrice) AS stockValue
       FROM Stock s
       JOIN Product p ON p.id = s.productId
       ORDER BY p.name`
    ).all();
  }
}