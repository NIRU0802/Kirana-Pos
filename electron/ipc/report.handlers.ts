import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { reportService } from "../../features/reports/services/report.service";

export function registerReportHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.REPORT_DAILY_SALES, safeHandle((_e, from, to) => reportService.dailySales(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_PRODUCT_SALES, safeHandle((_e, from, to) => reportService.productSales(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_GST, safeHandle((_e, from, to) => reportService.gstSummary(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_PROFIT_LOSS, safeHandle((_e, from, to) => reportService.profitLoss(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_STOCK_VALUATION, safeHandle(() => reportService.stockValuation()));
  ipcMain.handle(IPC_CHANNELS.REPORT_SLOW_MOVING, safeHandle((_e, days) => reportService.slowMoving(days as number | undefined)));
}
