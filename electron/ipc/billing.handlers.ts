import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { billingService } from "../../features/billing/services/billing.service";
import type { CreateBillInput } from "../../features/billing/types";

export function registerBillingHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.BILL_CREATE, safeHandle((_e, input) => billingService.createBill(input as CreateBillInput)));
  ipcMain.handle(IPC_CHANNELS.BILL_GET_BY_ID, safeHandle((_e, id) => billingService.getBill(id as number)));
  ipcMain.handle(IPC_CHANNELS.BILL_GET_RECENT, safeHandle((_e, limit) => billingService.getRecent(limit as number | undefined)));
  ipcMain.handle(IPC_CHANNELS.BILL_SEARCH, safeHandle((_e, q) => billingService.search(q as string)));
  ipcMain.handle(IPC_CHANNELS.BILL_REFUND, safeHandle((_e, billId, amount, reason, by) => billingService.refund(billId as number, amount as number, reason as string, by as string)));
}
