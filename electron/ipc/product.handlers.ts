import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { productService } from "../../features/products/services/product.service";
import type { CreateProductInput, UpdateProductInput } from "../../features/products/types";
import { dialog } from "electron";
import { importProductsFromExcel } from "../../features/products/services/product-import.service";

export function registerProductHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.PRODUCT_PICK_IMPORT_FILE, safeHandle(async () => {
    const result = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "Excel", extensions: ["xlsx"] }] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0] as string;
  }));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_BULK_IMPORT, safeHandle((_e, filePath, by) => importProductsFromExcel(filePath as string, by as string | undefined)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_ALL, safeHandle(() => productService.getAll()));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_BY_ID, safeHandle((_e, id) => productService.getById(id as number)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_BY_BARCODE, safeHandle((_e, bc) => productService.getByBarcode(bc as string)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_SEARCH, safeHandle((_e, q) => productService.search(q as string)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_CREATE, safeHandle((_e, input, by) => productService.create(input as CreateProductInput, by as string | undefined)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_UPDATE, safeHandle((_e, input, by) => productService.update(input as UpdateProductInput, by as string | undefined)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_DELETE, safeHandle((_e, id, by) => productService.delete(id as number, by as string | undefined)));
}
