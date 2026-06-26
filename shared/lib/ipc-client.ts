import type { IpcChannel, IpcResponse } from "../types/ipc";

declare global {
  interface Window {
    electronAPI: {
      invoke: <T>(channel: IpcChannel, ...args: unknown[]) => Promise<IpcResponse<T>>;
      on: (channel: IpcChannel, cb: (...args: unknown[]) => void) => void;
      off: (channel: IpcChannel, cb: (...args: unknown[]) => void) => void;
    };
  }
}

export async function ipcInvoke<T>(channel: IpcChannel, ...args: unknown[]): Promise<T> {
  if (typeof window === "undefined" || !window.electronAPI) throw new Error("electronAPI unavailable");
  const res = await window.electronAPI.invoke<T>(channel, ...args);
  if (!res.success) throw new Error(res.error);
  return res.data;
}
