import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { categoryService } from "../../features/categories/services/category.service";

export function registerCategoryHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.CATEGORY_GET_ALL, safeHandle(() => categoryService.getAll()));
  ipcMain.handle(IPC_CHANNELS.CATEGORY_CREATE, safeHandle((_e, name, by) => categoryService.create(name as string, by as string)));
  ipcMain.handle(IPC_CHANNELS.CATEGORY_UPDATE, safeHandle((_e, id, name, by) => categoryService.update(id as number, name as string, by as string)));
  ipcMain.handle(IPC_CHANNELS.CATEGORY_DELETE, safeHandle((_e, id, by) => categoryService.delete(id as number, by as string)));
}
