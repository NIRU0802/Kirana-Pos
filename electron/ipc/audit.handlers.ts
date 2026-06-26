import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { AuditRepository } from "../../features/audit/repositories/audit.repository";
import type { AuditFilters } from "../../features/audit/repositories/audit.repository";

const repo = new AuditRepository();

export function registerAuditHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.AUDIT_GET_LOGS, safeHandle((_e, filters) => repo.getLogs(filters as AuditFilters)));
}
