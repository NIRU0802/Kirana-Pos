import type { IpcMain } from "electron";
import { dialog } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { settingsService } from "../../features/settings/services/settings.service";
import { exportDailySalesAndKhata, exportDailySnapshot, mergeMonthlyExport } from "../../features/backup/services/export-excel.service";
import { pushDailyDataToSheets, restoreFromSheets } from "../../features/backup/services/sheets-sync.service";

export function registerSyncHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.BACKUP_PICK_EXPORT_FOLDER, safeHandle(async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
    if (result.canceled || result.filePaths.length === 0) return null;
    const folderPath = result.filePaths[0] as string;
    settingsService.update({ excelExportFolderPath: folderPath });
    return folderPath;
  }));

  ipcMain.handle(IPC_CHANNELS.BACKUP_PICK_CREDENTIALS_FILE, safeHandle(async () => {
    const result = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "JSON", extensions: ["json"] }] });
    if (result.canceled || result.filePaths.length === 0) return null;
    const filePath = result.filePaths[0] as string;
    settingsService.update({ googleSheetsCredentialsPath: filePath });
    return filePath;
  }));

  ipcMain.handle(IPC_CHANNELS.SYNC_NOW, safeHandle(async () => {
    const today = new Date();
    await exportDailySalesAndKhata(today);
    await exportDailySnapshot(today);
    await pushDailyDataToSheets(today);
    settingsService.update({ lastDailySyncAt: new Date().toISOString() });
    return { ok: true };
  }));

  ipcMain.handle(IPC_CHANNELS.SYNC_MERGE_MONTH, safeHandle(async () => {
    const now = new Date();
    await mergeMonthlyExport(now.getFullYear(), now.getMonth() + 1);
    settingsService.update({ lastMonthlySyncAt: new Date().toISOString() });
    return { ok: true };
  }));

  ipcMain.handle(IPC_CHANNELS.SYNC_RESTORE_FROM_SHEETS, safeHandle(async () => {
    return await restoreFromSheets();
  }));
}