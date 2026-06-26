import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import type { IpcResponse } from "../../shared/types/ipc";
import { registerAuthHandlers } from "./auth.handlers";
import { registerProductHandlers } from "./product.handlers";
import { registerCategoryHandlers } from "./category.handlers";
import { registerInventoryHandlers } from "./inventory.handlers";
import { registerBillingHandlers } from "./billing.handlers";
import { registerCustomerHandlers } from "./customer.handlers";
import { registerReportHandlers } from "./report.handlers";
import { registerSettingsHandlers } from "./settings.handlers";
import { registerBackupHandlers } from "./backup.handlers";
import { registerAuditHandlers } from "./audit.handlers";
import { registerSyncHandlers } from "./sync.handlers";

export function registerAllHandlers(ipcMain: IpcMain): void {
  registerAuthHandlers(ipcMain);
  registerProductHandlers(ipcMain);
  registerCategoryHandlers(ipcMain);
  registerInventoryHandlers(ipcMain);
  registerBillingHandlers(ipcMain);
  registerCustomerHandlers(ipcMain);
  registerReportHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);
  registerBackupHandlers(ipcMain);
  registerAuditHandlers(ipcMain);
  registerBackupHandlers(ipcMain);
  registerSyncHandlers(ipcMain);

  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, (): IpcResponse<string> => ({ success: true, data: process.env["npm_package_version"] ?? "1.0.0" }));
}

export function safeHandle<T>(fn: (...args: unknown[]) => T | Promise<T>): (...args: unknown[]) => Promise<IpcResponse<T>> {
  return async (...args: unknown[]): Promise<IpcResponse<T>> => {
    try { return { success: true, data: await fn(...args) }; }
    catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[IPC Error]", message);
      return { success: false, error: message };
    }
  };
}
