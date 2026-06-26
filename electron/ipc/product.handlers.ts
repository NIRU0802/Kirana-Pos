import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { productService } from "../../features/products/services/product.service";
import type { CreateProductInput, UpdateProductInput } from "../../features/products/types";

export function registerProductHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_ALL, safeHandle(() => productService.getAll()));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_BY_ID, safeHandle((_e, id) => productService.getById(id as number)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_BY_BARCODE, safeHandle((_e, bc) => productService.getByBarcode(bc as string)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_SEARCH, safeHandle((_e, q) => productService.search(q as string)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_CREATE, safeHandle((_e, input, by) => productService.create(input as CreateProductInput, by as string | undefined)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_UPDATE, safeHandle((_e, input, by) => productService.update(input as UpdateProductInput, by as string | undefined)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_DELETE, safeHandle((_e, id, by) => productService.delete(id as number, by as string | undefined)));
}
