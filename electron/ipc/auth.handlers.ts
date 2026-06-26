import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { AuthService } from "../../features/auth/services/auth.service";

const svc = new AuthService();

export function registerAuthHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN, safeHandle((_e, input) => svc.login(input as Parameters<typeof svc.login>[0])));
  ipcMain.handle(IPC_CHANNELS.AUTH_CURRENT_USER, safeHandle((_e, id) => svc.getCurrentUser(id as number)));
  ipcMain.handle(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, safeHandle((_e, input) => svc.changePassword(input as Parameters<typeof svc.changePassword>[0])));
}
