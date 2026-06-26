import { contextBridge, ipcRenderer } from "electron";
import type { IpcChannel, IpcResponse } from "../../shared/types/ipc";

contextBridge.exposeInMainWorld("electronAPI", {
  invoke: <T>(channel: IpcChannel, ...args: unknown[]): Promise<IpcResponse<T>> => ipcRenderer.invoke(channel, ...args),
  on: (channel: IpcChannel, cb: (...args: unknown[]) => void): void => { ipcRenderer.on(channel, (_e, ...a) => cb(...a)); },
  off: (channel: IpcChannel, cb: (...args: unknown[]) => void): void => { ipcRenderer.removeListener(channel, cb); },
});
