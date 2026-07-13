import ExcelJS from "exceljs";
import { productService } from "./product.service";
import type { BulkImportResult } from "../types";

export async function importProductsFromExcel(filePath: string, createdBy = "system"): Promise<BulkImportResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("No sheet found in file");

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => { headers[colNumber - 1] = String(cell.value ?? "").trim(); });

  const rows: Record<string, unknown>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (!header) return;
      const raw: unknown = cell.value;
      let value: unknown = raw;
      if (raw && typeof raw === "object" && "result" in raw) {
        value = (raw as { result: unknown }).result;
      }
      if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
      }
      obj[header] = value === null || value === undefined || value === "" ? undefined : value;
    });
    if (obj["name"]) rows.push(obj);
  });

  return productService.bulkImport(rows, createdBy);
}