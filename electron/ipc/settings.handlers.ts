import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { settingsService } from "../../features/settings/services/settings.service";
import type { AppSettings } from "../../features/settings/types";

export function registerSettingsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_ALL, safeHandle(() => settingsService.getAll()));
  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, safeHandle((_e, updates) => settingsService.update(updates as Partial<AppSettings>)));
}
