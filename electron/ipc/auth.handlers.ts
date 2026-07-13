import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { AuthService } from "../../features/auth/services/auth.service";
import type { LoginInput, ChangePasswordInput, CreateUserInput, UpdateUserInput } from "../../features/auth/types";

const svc = new AuthService();

export function registerAuthHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN,           safeHandle((_e, input) => svc.login(input as LoginInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_CURRENT_USER,    safeHandle((_e, id) => svc.getCurrentUser(id as number)));
  ipcMain.handle(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, safeHandle((_e, input) => svc.changePassword(input as ChangePasswordInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_GET_ALL_USERS,   safeHandle(() => svc.getAllUsers()));
  ipcMain.handle(IPC_CHANNELS.AUTH_CREATE_USER,     safeHandle((_e, input) => svc.createUser(input as CreateUserInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_UPDATE_USER,     safeHandle((_e, input) => svc.updateUser(input as UpdateUserInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_RESET_PASSWORD,  safeHandle((_e, id, pwd) => svc.resetPassword(id as number, pwd as string)));
  ipcMain.handle(IPC_CHANNELS.AUTH_DELETE_USER,     safeHandle((_e, id) => svc.deleteUser(id as number)));
}