// Google Sheets sync service — implemented in Phase 5/6.
// Pushes the same data exported to Excel up to a Google Sheet as an
// online mirror, and supports disaster-recovery restore back into SQLite.

export async function pushDailyDataToSheets(date: Date): Promise<void> {
    console.log("[SheetsSync] TODO: pushDailyDataToSheets", date.toISOString());
  }
  
  export async function restoreFromSheets(): Promise<{ restored: Record<string, number> }> {
    console.log("[SheetsSync] TODO: restoreFromSheets");
    return { restored: {} };
  }