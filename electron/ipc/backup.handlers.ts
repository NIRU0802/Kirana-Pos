import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { backupService } from "../../features/backup/services/backup.service";

export function registerBackupHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.BACKUP_CREATE, safeHandle(() => backupService.create()));
  ipcMain.handle(IPC_CHANNELS.BACKUP_LIST, safeHandle(() => backupService.list()));
  ipcMain.handle(IPC_CHANNELS.BACKUP_RESTORE, safeHandle((_e, p) => backupService.restore(p as string)));
}
