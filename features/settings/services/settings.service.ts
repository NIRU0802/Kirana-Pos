import { getDatabase } from "../../../database/client";

import type { AppSettings } from "../types";

const db = () => getDatabase();

export const settingsService = {
  getAll(): AppSettings {
    const rows = db().prepare<[],{key:string;value:string}>("SELECT key,value FROM Settings").all();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      storeName: map["storeName"] ?? "", storeAddress: map["storeAddress"] ?? "", storePhone: map["storePhone"] ?? "",
      storeGstin: map["storeGstin"] ?? "", currency: map["currency"] ?? "INR", billPrefix: map["billPrefix"] ?? "INV",
      billCounter: map["billCounter"] ?? "1", taxIncluded: map["taxIncluded"] ?? "false",
      printReceiptAuto: map["printReceiptAuto"] ?? "true", theme: map["theme"] ?? "light",
      printerName: map["printerName"] ?? "", printerWidth: map["printerWidth"] ?? "80",
      excelExportFolderPath: map["excelExportFolderPath"] ?? "",
      lastDailySyncAt: map["lastDailySyncAt"] ?? "",
      lastMonthlySyncAt: map["lastMonthlySyncAt"] ?? "",
      googleSheetsEnabled: map["googleSheetsEnabled"] ?? "false",
      googleSheetsCredentialsPath: map["googleSheetsCredentialsPath"] ?? "",
      googleSheetsSpreadsheetId: map["googleSheetsSpreadsheetId"] ?? "",
    };
  },
  update(updates: Partial<AppSettings>): void {
    const now = new Date().toISOString();
    const stmt = db().prepare("INSERT INTO Settings(key,value,updatedAt) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updatedAt=excluded.updatedAt");
    db().transaction(() => { for (const [k,v] of Object.entries(updates)) if (v !== undefined) stmt.run(k, String(v), now); })();
  },
};
