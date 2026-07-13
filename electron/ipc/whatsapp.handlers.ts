import type { IpcMain } from "electron";
import { shell } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";

export interface WhatsAppBillPayload {
  phone: string;
  customerName: string;
  billNumber: string;
  storeName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;   // paise
    lineTotal: number;   // paise
  }>;
  grandTotal: number;    // paise
  creditBalance: number; // total remaining khata after this bill, paise
}

function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

function buildMessage(p: WhatsAppBillPayload): string {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const itemLines = p.items
    .map((i) => `  • ${i.productName} x${i.quantity} @ ₹${paiseToRupees(i.unitPrice).toFixed(2)} = ₹${paiseToRupees(i.lineTotal).toFixed(2)}`)
    .join("\n");

  return [
    `🧾 *${p.storeName}*`,
    `Bill No: *${p.billNumber}*`,
    `Date: ${date}`,
    `Customer: *${p.customerName}*`,
    ``,
    `*Items Purchased:*`,
    itemLines,
    ``,
    `*Bill Total: ₹${paiseToRupees(p.grandTotal).toFixed(2)}*`,
    ``,
    `📒 *Khata / Udhar Balance*`,
    `Total Remaining (Udhaar): *₹${paiseToRupees(p.creditBalance).toFixed(2)}*`,
    ``,
    `Please clear your dues at the earliest. 🙏`,
    `Thank you! — ${p.storeName}`,
  ].join("\n");
}

export function registerWhatsAppHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    IPC_CHANNELS.WHATSAPP_OPEN,
    safeHandle((_e, payload) => {
      const p = payload as WhatsAppBillPayload;

      // Sanitize phone number → always 91XXXXXXXXXX
      const raw = p.phone.replace(/[\s\-().+]/g, "");
      const phone =
        raw.length === 12 && raw.startsWith("91")
          ? raw
          : `91${raw.slice(-10)}`; // take last 10 digits, add 91

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage(p))}`;
      void shell.openExternal(url);
      return { opened: true };
    })
  );
}