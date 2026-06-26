// Excel export service — implemented in Phase 2/3/4.
// Exports Bill/BillItem (sales), CreditLedger (khata), and snapshots of
// Product/Customer/Stock to local .xlsx files, plus month-end consolidation.

export async function exportDailySalesAndKhata(date: Date): Promise<void> {
    console.log("[ExportExcel] TODO: exportDailySalesAndKhata", date.toISOString());
  }
  
  export async function exportDailySnapshot(date: Date): Promise<void> {
    console.log("[ExportExcel] TODO: exportDailySnapshot", date.toISOString());
  }
  
  export async function mergeMonthlyExport(year: number, month: number): Promise<void> {
    console.log("[ExportExcel] TODO: mergeMonthlyExport", year, month);
  }