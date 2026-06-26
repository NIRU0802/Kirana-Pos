import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { inventoryService } from "../../features/inventory/services/inventory.service";
import type { StockMovementType } from "../../shared/types";

export function registerInventoryHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.INVENTORY_GET_ALL, safeHandle(() => inventoryService.getAll()));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_LOW_STOCK, safeHandle(() => inventoryService.getLowStock()));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_GET_STOCK, safeHandle((_e, id) => inventoryService.getByProduct(id as number)));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_GET_MOVEMENTS, safeHandle((_e, id, limit) => inventoryService.getMovements(id as number, limit as number | undefined)));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_ADJUST, safeHandle((_e, productId, type, qty, cost, refId, note, by) =>
    inventoryService.adjust(productId as number, type as StockMovementType, qty as number, cost as number, refId as number | undefined, note as string | undefined, by as string)));
}
