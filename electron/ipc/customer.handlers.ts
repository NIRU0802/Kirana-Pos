import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { customerService } from "../../features/customers/services/customer.service";
import type { CreateCustomerInput, UpdateCustomerInput } from "../../features/customers/types";

export function registerCustomerHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_GET_ALL, safeHandle(() => customerService.getAll()));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_GET_BY_ID, safeHandle((_e, id) => customerService.getById(id as number)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_SEARCH, safeHandle((_e, q) => customerService.search(q as string)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_CREATE, safeHandle((_e, input, by) => customerService.create(input as CreateCustomerInput, by as string)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_UPDATE, safeHandle((_e, input, by) => customerService.update(input as UpdateCustomerInput, by as string)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_GET_LEDGER, safeHandle((_e, id) => customerService.getLedger(id as number)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_SETTLE, safeHandle((_e, input, by) => customerService.settle(input as { customerId: number; amount: number; note?: string }, by as string)));
}
