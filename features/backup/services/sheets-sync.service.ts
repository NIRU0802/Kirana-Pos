import fs from "fs";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { settingsService } from "../../settings/services/settings.service";
import { ExportRepository } from "../repositories/export.repository";
import { backupService } from "./backup.service";
import { getDatabase } from "../../../database/client";
import { restoredProductSchema, restoredCustomerSchema } from "../schemas/restore.schemas";

const exportRepo = new ExportRepository();
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}
function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

function toDateRange(date: Date): { startIso: string; endIso: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

async function getDoc(): Promise<GoogleSpreadsheet | null> {
  const settings = settingsService.getAll();
  if (settings.googleSheetsEnabled !== "true") return null;
  if (!settings.googleSheetsCredentialsPath || !settings.googleSheetsSpreadsheetId) return null;
  if (!fs.existsSync(settings.googleSheetsCredentialsPath)) return null;

  const raw = fs.readFileSync(settings.googleSheetsCredentialsPath, "utf-8");
  const creds = JSON.parse(raw) as { client_email: string; private_key: string };

  const jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: SCOPES });
  const doc = new GoogleSpreadsheet(settings.googleSheetsSpreadsheetId, jwt);
  await doc.loadInfo();
  return doc;
}

async function getOrCreateSheet(doc: GoogleSpreadsheet, title: string, headers: string[]) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) sheet = await doc.addSheet({ title, headerValues: headers });
  return sheet;
}

async function appendOnlyNewRows(
  doc: GoogleSpreadsheet, title: string, headers: string[], idColumnHeader: string,
  rows: { id: number; values: Record<string, unknown> }[]
): Promise<number> {
  const sheet = await getOrCreateSheet(doc, title, headers);
  const existing = await sheet.getRows();
  const existingIds = new Set(existing.map((r) => Number(r.get(idColumnHeader))));
  const toAdd = rows.filter((r) => !existingIds.has(r.id)).map((r) => r.values);
  if (toAdd.length > 0) await sheet.addRows(toAdd as Parameters<typeof sheet.addRows>[0]);
  return toAdd.length;
}

async function upsertRows(
  doc: GoogleSpreadsheet, title: string, headers: string[], idColumnHeader: string,
  rows: { id: number; values: Record<string, unknown> }[]
): Promise<void> {
  const sheet = await getOrCreateSheet(doc, title, headers);
  const existing = await sheet.getRows();
  const existingById = new Map(existing.map((r) => [Number(r.get(idColumnHeader)), r]));
  for (const row of rows) {
    const existingRow = existingById.get(row.id);
    if (existingRow) {
      for (const [key, value] of Object.entries(row.values)) existingRow.set(key, value as string | number);
      await existingRow.save();
    } else {
      await sheet.addRow(row.values as Parameters<typeof sheet.addRow>[0]);
    }
  }
}

export async function pushDailyDataToSheets(date: Date): Promise<void> {
  try {
    const doc = await getDoc();
    if (!doc) {
      console.log("[SheetsSync] Skipped — Google Sheets backup not enabled or not configured.");
      return;
    }

    const { startIso, endIso } = toDateRange(date);

    const bills = exportRepo.getBillsForDate(startIso, endIso);
    const addedSales = await appendOnlyNewRows(doc, "Sales", [
      "Bill ID", "Bill Number", "Customer", "Payment Method", "Status", "Item Count",
      "Subtotal", "GST", "Discount", "Round Off", "Grand Total", "Amount Paid", "Change Due", "Created At",
    ], "Bill ID", bills.map((b) => ({
      id: b.id,
      values: {
        "Bill ID": b.id, "Bill Number": b.billNumber, "Customer": b.customerName ?? "Walk-in",
        "Payment Method": b.paymentMethod, "Status": b.status, "Item Count": b.itemCount,
        "Subtotal": paiseToRupees(b.subtotal), "GST": paiseToRupees(b.gstTotal), "Discount": paiseToRupees(b.discount),
        "Round Off": paiseToRupees(b.roundOff), "Grand Total": paiseToRupees(b.grandTotal),
        "Amount Paid": paiseToRupees(b.amountPaid), "Change Due": paiseToRupees(b.changeDue), "Created At": b.createdAt,
      },
    })));

    const khata = exportRepo.getCreditLedgerForDate(startIso, endIso);
    const addedKhata = await appendOnlyNewRows(doc, "Khata", [
      "Ledger ID", "Customer", "Type", "Amount", "Bill ID", "Note", "Created At",
    ], "Ledger ID", khata.map((k) => ({
      id: k.id,
      values: {
        "Ledger ID": k.id, "Customer": k.customerName, "Type": k.type, "Amount": paiseToRupees(k.amount),
        "Bill ID": k.billId ?? "", "Note": k.note ?? "", "Created At": k.createdAt,
      },
    })));

    const products = exportRepo.getAllProductsSnapshot();
    await upsertRows(doc, "Products", [
      "Product ID", "Barcode", "Name", "Category", "Unit", "Cost Price", "Selling Price",
      "MRP", "GST Rate", "HSN Code", "Low Stock Alert", "Active", "Current Stock", "Created At",
    ], "Product ID", products.map((p) => ({
      id: p.id,
      values: {
        "Product ID": p.id, "Barcode": p.barcode ?? "", "Name": p.name, "Category": p.categoryName ?? "",
        "Unit": p.unit, "Cost Price": paiseToRupees(p.costPrice), "Selling Price": paiseToRupees(p.sellingPrice),
        "MRP": paiseToRupees(p.mrp), "GST Rate": p.gstRate, "HSN Code": p.hsnCode ?? "",
        "Low Stock Alert": p.lowStockAlert, "Active": p.isActive ? "Yes" : "No", "Current Stock": p.stock, "Created At": p.createdAt,
      },
    })));

    const customers = exportRepo.getAllCustomersSnapshot();
    await upsertRows(doc, "Customers", [
      "Customer ID", "Name", "Phone", "Address", "Credit Limit", "Credit Balance", "Active", "Created At",
    ], "Customer ID", customers.map((c) => ({
      id: c.id,
      values: {
        "Customer ID": c.id, "Name": c.name, "Phone": c.phone ?? "", "Address": c.address ?? "",
        "Credit Limit": paiseToRupees(c.creditLimit), "Credit Balance": paiseToRupees(c.creditBalance),
        "Active": c.isActive ? "Yes" : "No", "Created At": c.createdAt,
      },
    })));

    const inventory = exportRepo.getAllInventorySnapshot();
    await upsertRows(doc, "Inventory", [
      "Product ID", "Product Name", "Unit", "Quantity", "Low Stock Alert", "Cost Price", "Stock Value",
    ], "Product ID", inventory.map((i) => ({
      id: i.productId,
      values: {
        "Product ID": i.productId, "Product Name": i.productName, "Unit": i.unit, "Quantity": i.quantity,
        "Low Stock Alert": i.lowStockAlert, "Cost Price": paiseToRupees(i.costPrice), "Stock Value": paiseToRupees(i.stockValue),
      },
    })));

    console.log(`[SheetsSync] Pushed ${addedSales} new sale(s), ${addedKhata} new khata row(s), upserted ${products.length} products, ${customers.length} customers, ${inventory.length} inventory rows.`);
  } catch (err) {
    console.error("[SheetsSync] Push failed (local backup is unaffected):", err instanceof Error ? err.message : err);
  }
}

/**
 * Disaster recovery only — manual, explicit, NEVER automatic.
 * Takes a pre-restore snapshot first (reusing the existing backup
 * service), validates every row with Zod, writes through raw SQL
 * upserts that mirror the existing repository column shapes (audit
 * logging on these specific fields is intentionally skipped here since
 * this is a bulk disaster-recovery operation, not a user-driven edit),
 * and rolls back entirely on any failure via a single transaction.
 */
export async function restoreFromSheets(): Promise<{ restored: Record<string, number> }> {
  const doc = await getDoc();
  if (!doc) throw new Error("Google Sheets is not configured or enabled. Set it up in Settings first.");

  // Pre-restore safety snapshot — reuses the existing local backup service.
  backupService.create();

  const db = getDatabase();
  const restored: Record<string, number> = { products: 0, customers: 0 };

  const productsSheet = doc.sheetsByTitle["Products"];
  const customersSheet = doc.sheetsByTitle["Customers"];

  const rawProductRows = productsSheet ? await productsSheet.getRows() : [];
  const rawCustomerRows = customersSheet ? await customersSheet.getRows() : [];

  const validProducts: { id: number; name: string; unit: string; costPrice: number; sellingPrice: number; mrp: number; gstRate: number }[] = [];
  const rejectedProducts: number[] = [];

  for (const row of rawProductRows) {
    const parsed = restoredProductSchema.safeParse(row.toObject());
    if (!parsed.success) { rejectedProducts.push(Number(row.get("Product ID"))); continue; }
    const d = parsed.data;
    validProducts.push({
      id: Number(d["Product ID"]), name: d["Name"], unit: d["Unit"],
      costPrice: rupeesToPaise(Number(d["Cost Price"])), sellingPrice: rupeesToPaise(Number(d["Selling Price"])),
      mrp: rupeesToPaise(Number(d["MRP"])), gstRate: Number(d["GST Rate"]),
    });
  }

  const validCustomers: { id: number; name: string; creditLimit: number; creditBalance: number }[] = [];
  const rejectedCustomers: number[] = [];

  for (const row of rawCustomerRows) {
    const parsed = restoredCustomerSchema.safeParse(row.toObject());
    if (!parsed.success) { rejectedCustomers.push(Number(row.get("Customer ID"))); continue; }
    const d = parsed.data;
    validCustomers.push({
      id: Number(d["Customer ID"]), name: d["Name"],
      creditLimit: rupeesToPaise(Number(d["Credit Limit"])), creditBalance: rupeesToPaise(Number(d["Credit Balance"])),
    });
  }

  if (rejectedProducts.length > 0) console.warn(`[SheetsSync] Rejected ${rejectedProducts.length} invalid product row(s): ${rejectedProducts.join(", ")}`);
  if (rejectedCustomers.length > 0) console.warn(`[SheetsSync] Rejected ${rejectedCustomers.length} invalid customer row(s): ${rejectedCustomers.join(", ")}`);

  const now = new Date().toISOString();

  const writeAll = db.transaction(() => {
    const upsertProduct = db.prepare(
      `INSERT INTO Product(id, name, unit, costPrice, sellingPrice, mrp, gstRate, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, unit=excluded.unit, costPrice=excluded.costPrice,
         sellingPrice=excluded.sellingPrice, mrp=excluded.mrp, gstRate=excluded.gstRate, updatedAt=excluded.updatedAt`
    );
    for (const p of validProducts) {
      upsertProduct.run(p.id, p.name, p.unit, p.costPrice, p.sellingPrice, p.mrp, p.gstRate, now, now);
      restored["products"] = (restored["products"] ?? 0) + 1;
    }

    const upsertCustomer = db.prepare(
      `INSERT INTO Customer(id, name, creditLimit, creditBalance, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, creditLimit=excluded.creditLimit,
         creditBalance=excluded.creditBalance, updatedAt=excluded.updatedAt`
    );
    for (const c of validCustomers) {
      upsertCustomer.run(c.id, c.name, c.creditLimit, c.creditBalance, now, now);
      restored["customers"] = (restored["customers"] ?? 0) + 1;
    }
  });

  try {
    writeAll();
  } catch (err) {
    throw new Error(`Restore failed and was rolled back: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  return { restored };
}