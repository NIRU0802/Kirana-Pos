import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { ExportRepository } from "../repositories/export.repository";
import { settingsService } from "../../settings/services/settings.service";

const exportRepo = new ExportRepository();

function toDateRange(date: Date): { startIso: string; endIso: string; ymd: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
  const ymd = start.toISOString().slice(0, 10);
  return { startIso: start.toISOString(), endIso: end.toISOString(), ymd };
}

function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

function getExportFolder(): string {
  const folder = settingsService.getAll().excelExportFolderPath;
  if (!folder) throw new Error("Excel export folder is not set. Choose a folder in Settings first.");
  return folder;
}

function getDailyDir(): string {
  const dir = path.join(getExportFolder(), "daily");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getMonthlyDir(): string {
  const dir = path.join(getExportFolder(), "monthly");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function getExistingIds(filePath: string): Promise<Set<number>> {
  const ids = new Set<number>();
  if (!fs.existsSync(filePath)) return ids;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return ids;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const idCell = row.getCell(1).value;
    if (typeof idCell === "number") ids.add(idCell);
  });
  return ids;
}

async function appendSalesRows(filePath: string, rows: ReturnType<ExportRepository["getBillsForDate"]>): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  let sheet: ExcelJS.Worksheet;

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    sheet = workbook.worksheets[0] ?? workbook.addWorksheet("Sales");
  } else {
    sheet = workbook.addWorksheet("Sales");
    sheet.addRow([
      "Bill ID", "Bill Number", "Customer", "Payment Method", "Status", "Item Count",
      "Subtotal (₹)", "GST (₹)", "Discount (₹)", "Round Off (₹)", "Grand Total (₹)",
      "Amount Paid (₹)", "Change Due (₹)", "Created At",
    ]);
    sheet.getRow(1).font = { bold: true };
  }

  const existingIds = await getExistingIds(filePath);
  let added = 0;

  for (const bill of rows) {
    if (existingIds.has(bill.id)) continue;
    sheet.addRow([
      bill.id, bill.billNumber, bill.customerName ?? "Walk-in", bill.paymentMethod, bill.status, bill.itemCount,
      paiseToRupees(bill.subtotal), paiseToRupees(bill.gstTotal), paiseToRupees(bill.discount),
      paiseToRupees(bill.roundOff), paiseToRupees(bill.grandTotal), paiseToRupees(bill.amountPaid),
      paiseToRupees(bill.changeDue), bill.createdAt,
    ]);
    added++;
  }

  if (added > 0) await workbook.xlsx.writeFile(filePath);
  return added;
}

async function appendKhataRows(filePath: string, rows: ReturnType<ExportRepository["getCreditLedgerForDate"]>): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  let sheet: ExcelJS.Worksheet;

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    sheet = workbook.worksheets[0] ?? workbook.addWorksheet("Khata");
  } else {
    sheet = workbook.addWorksheet("Khata");
    sheet.addRow(["Ledger ID", "Customer", "Type", "Amount (₹)", "Bill ID", "Note", "Created At"]);
    sheet.getRow(1).font = { bold: true };
  }

  const existingIds = await getExistingIds(filePath);
  let added = 0;

  for (const entry of rows) {
    if (existingIds.has(entry.id)) continue;
    sheet.addRow([
      entry.id, entry.customerName, entry.type, paiseToRupees(entry.amount),
      entry.billId ?? "", entry.note ?? "", entry.createdAt,
    ]);
    added++;
  }

  if (added > 0) await workbook.xlsx.writeFile(filePath);
  return added;
}

export async function exportDailySalesAndKhata(date: Date): Promise<void> {
  const { startIso, endIso, ymd } = toDateRange(date);
  const dir = getDailyDir();

  const sales = exportRepo.getBillsForDate(startIso, endIso);
  const khata = exportRepo.getCreditLedgerForDate(startIso, endIso);

  const salesPath = path.join(dir, `${ymd}-Sales.xlsx`);
  const khataPath = path.join(dir, `${ymd}-Khata.xlsx`);

  const addedSales = await appendSalesRows(salesPath, sales);
  const addedKhata = await appendKhataRows(khataPath, khata);

  console.log(`[ExportExcel] Sales: ${addedSales} new row(s) -> ${salesPath}`);
  console.log(`[ExportExcel] Khata: ${addedKhata} new row(s) -> ${khataPath}`);
}

export async function exportDailySnapshot(date: Date): Promise<void> {
  const { ymd } = toDateRange(date);
  const dir = getDailyDir();

  await writeProductSnapshot(path.join(dir, `${ymd}-Products-snapshot.xlsx`));
  await writeCustomerSnapshot(path.join(dir, `${ymd}-Customers-snapshot.xlsx`));
  await writeInventorySnapshot(path.join(dir, `${ymd}-Inventory-snapshot.xlsx`));
}

async function writeProductSnapshot(filePath: string): Promise<void> {
  const rows = exportRepo.getAllProductsSnapshot();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");
  sheet.addRow([
    "Product ID", "Barcode", "Name", "Category", "Unit", "Cost Price (₹)", "Selling Price (₹)",
    "MRP (₹)", "GST Rate (%)", "HSN Code", "Low Stock Alert", "Active", "Current Stock", "Created At",
  ]);
  sheet.getRow(1).font = { bold: true };

  for (const p of rows) {
    sheet.addRow([
      p.id, p.barcode ?? "", p.name, p.categoryName ?? "", p.unit,
      paiseToRupees(p.costPrice), paiseToRupees(p.sellingPrice), paiseToRupees(p.mrp),
      p.gstRate, p.hsnCode ?? "", p.lowStockAlert, p.isActive ? "Yes" : "No", p.stock, p.createdAt,
    ]);
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`[ExportExcel] Products snapshot: ${rows.length} row(s) -> ${filePath}`);
}

async function writeCustomerSnapshot(filePath: string): Promise<void> {
  const rows = exportRepo.getAllCustomersSnapshot();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Customers");
  sheet.addRow(["Customer ID", "Name", "Phone", "Address", "Credit Limit (₹)", "Credit Balance (₹)", "Active", "Created At"]);
  sheet.getRow(1).font = { bold: true };

  for (const c of rows) {
    sheet.addRow([
      c.id, c.name, c.phone ?? "", c.address ?? "",
      paiseToRupees(c.creditLimit), paiseToRupees(c.creditBalance), c.isActive ? "Yes" : "No", c.createdAt,
    ]);
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`[ExportExcel] Customers snapshot: ${rows.length} row(s) -> ${filePath}`);
}

async function writeInventorySnapshot(filePath: string): Promise<void> {
  const rows = exportRepo.getAllInventorySnapshot();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory");
  sheet.addRow(["Product ID", "Product Name", "Unit", "Quantity", "Low Stock Alert", "Cost Price (₹)", "Stock Value (₹)"]);
  sheet.getRow(1).font = { bold: true };

  for (const i of rows) {
    sheet.addRow([
      i.productId, i.productName, i.unit, i.quantity, i.lowStockAlert,
      paiseToRupees(i.costPrice), paiseToRupees(i.stockValue),
    ]);
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`[ExportExcel] Inventory snapshot: ${rows.length} row(s) -> ${filePath}`);
}

/**
 * Month-end merge:
 * - Sales/Khata: CONCATENATE all daily files for the month into one file
 *   with two sheets/tabs. Source daily files are already correct, so we
 *   just read and combine them — no need to re-query the database.
 * - Products/Customers/Inventory: build a HISTORY file, one summary row
 *   per day (not a full product list repeated 30 times), so the user can
 *   see how totals changed across the month.
 *
 * Daily files are NEVER deleted after merging — this function only reads
 * them and writes new monthly files. Do not add deletion logic here.
 */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function readSheetRows(filePath: string): Promise<unknown[][]> {
  if (!fs.existsSync(filePath)) return [];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const rows: unknown[][] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header, we write our own
    const values: unknown[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => { values.push(cell.value); });
    rows.push(values);
  });
  return rows;
}

async function mergeBillsAndKhata(year: number, month: number): Promise<void> {
  const dailyDir = getDailyDir();
  const daysInMonth = getDaysInMonth(year, month);
  const monthLabel = `${MONTH_NAMES[month - 1]}_${year}`;

  const workbook = new ExcelJS.Workbook();
  const salesSheet = workbook.addWorksheet("Sales");
  salesSheet.addRow([
    "Bill ID", "Bill Number", "Customer", "Payment Method", "Status", "Item Count",
    "Subtotal (₹)", "GST (₹)", "Discount (₹)", "Round Off (₹)", "Grand Total (₹)",
    "Amount Paid (₹)", "Change Due (₹)", "Created At",
  ]);
  salesSheet.getRow(1).font = { bold: true };

  const khataSheet = workbook.addWorksheet("Khata");
  khataSheet.addRow(["Ledger ID", "Customer", "Type", "Amount (₹)", "Bill ID", "Note", "Created At"]);
  khataSheet.getRow(1).font = { bold: true };

  let totalSalesRows = 0;
  let totalKhataRows = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const ymd = `${year}-${pad2(month)}-${pad2(day)}`;
    const salesRows = await readSheetRows(path.join(dailyDir, `${ymd}-Sales.xlsx`));
    const khataRows = await readSheetRows(path.join(dailyDir, `${ymd}-Khata.xlsx`));
    for (const r of salesRows) { salesSheet.addRow(r); totalSalesRows++; }
    for (const r of khataRows) { khataSheet.addRow(r); totalKhataRows++; }
  }

  const monthlyDir = getMonthlyDir();
  const outPath = path.join(monthlyDir, `${monthLabel}_Complete_Bills.xlsx`);
  await workbook.xlsx.writeFile(outPath);
  console.log(`[ExportExcel] Monthly merge: ${totalSalesRows} sales row(s), ${totalKhataRows} khata row(s) -> ${outPath}`);
}

async function readSnapshotSummary(filePath: string, valueColumnIndex: number): Promise<{ count: number; totalValue: number } | null> {
  if (!fs.existsSync(filePath)) return null;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return null;
  let count = 0;
  let totalValue = 0;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    count++;
    const cell = row.getCell(valueColumnIndex).value;
    if (typeof cell === "number") totalValue += cell;
  });
  return { count, totalValue };
}

async function mergeStockHistory(year: number, month: number): Promise<void> {
  const dailyDir = getDailyDir();
  const daysInMonth = getDaysInMonth(year, month);
  const monthLabel = `${MONTH_NAMES[month - 1]}_${year}`;

  const workbook = new ExcelJS.Workbook();

  const productsSheet = workbook.addWorksheet("Products");
  productsSheet.addRow(["Date", "Total Products", "Total Stock Value (₹, cost basis approx)"]);
  productsSheet.getRow(1).font = { bold: true };

  const customersSheet = workbook.addWorksheet("Customers");
  customersSheet.addRow(["Date", "Total Customers", "Total Credit Balance Outstanding (₹)"]);
  customersSheet.getRow(1).font = { bold: true };

  const inventorySheet = workbook.addWorksheet("Inventory");
  inventorySheet.addRow(["Date", "Total Tracked Products", "Total Stock Value (₹)"]);
  inventorySheet.getRow(1).font = { bold: true };

  for (let day = 1; day <= daysInMonth; day++) {
    const ymd = `${year}-${pad2(month)}-${pad2(day)}`;

    const productSummary = await readSnapshotSummary(path.join(dailyDir, `${ymd}-Products-snapshot.xlsx`), 6); // Cost Price col
    if (productSummary) productsSheet.addRow([ymd, productSummary.count, productSummary.totalValue]);

    const customerSummary = await readSnapshotSummary(path.join(dailyDir, `${ymd}-Customers-snapshot.xlsx`), 6); // Credit Balance col
    if (customerSummary) customersSheet.addRow([ymd, customerSummary.count, customerSummary.totalValue]);

    const inventorySummary = await readSnapshotSummary(path.join(dailyDir, `${ymd}-Inventory-snapshot.xlsx`), 7); // Stock Value col
    if (inventorySummary) inventorySheet.addRow([ymd, inventorySummary.count, inventorySummary.totalValue]);
  }

  const monthlyDir = getMonthlyDir();
  const outPath = path.join(monthlyDir, `${monthLabel}_Stock_History.xlsx`);
  await workbook.xlsx.writeFile(outPath);
  console.log(`[ExportExcel] Monthly stock history -> ${outPath}`);
}

export async function mergeMonthlyExport(year: number, month: number): Promise<void> {
  await mergeBillsAndKhata(year, month);
  await mergeStockHistory(year, month);
}