import { app, BrowserWindow, ipcMain, shell, protocol, net } from "electron";
import path from "path";
import { getDatabase, closeDatabase } from "../../database/client";
import { runMigrations } from "../../database/migrate";
import { registerAllHandlers } from "../ipc/handlers";

const isDev = process.env["NODE_ENV"] === "development";
let mainWindow: BrowserWindow | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "file",
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
]);

function getOutDir(): string {
  if (app.isPackaged) {
    // Packaged: app.asar sits at process.resourcesPath/app.asar,
    // and files listed in "files" are bundled inside it at their declared relative path.
    return path.join(process.resourcesPath, "app.asar", "out");
  }
  // Dev: __dirname is electron/dist/electron/main
  return path.join(__dirname, "../../../../out");
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1366, height: 768, minWidth: 1024, minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
    show: false, backgroundColor: "#ffffff", title: "KiranaPOS",
  });

  if (isDev) {
    void mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(getOutDir(), "index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  const outDir = getOutDir();

  protocol.handle("file", (request) => {
    const requestUrl = new URL(request.url);
    const pathname = decodeURIComponent(requestUrl.pathname);

    const normalizedOutDir = outDir.replace(/\\/g, "/").toLowerCase();
    const normalizedPathname = pathname.replace(/^\/([A-Za-z]):/, "$1:").toLowerCase();
    if (normalizedPathname.startsWith(normalizedOutDir.replace(/^([A-Za-z]):/, "$1:"))) {
      return net.fetch(request.url, { bypassCustomProtocolHandlers: true });
    }

    const relativePath = pathname.replace(/^\/[A-Za-z]:/, "");
    const filePath = path.join(outDir, relativePath);
    return net.fetch(`file://${filePath}`, { bypassCustomProtocolHandlers: true });
  });

  const db = getDatabase();
  runMigrations(db);
  registerAllHandlers(ipcMain);
  createWindow();
  ipcMain.handle("app:openPath", async (_e, filePath: string) => { await shell.openPath(filePath); return { success: true, data: null }; });
}).catch(console.error);

app.on("window-all-closed", () => { closeDatabase(); if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on("web-contents-created", (_e, contents) => {
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-navigate", (event, url) => { if (isDev && url.startsWith("http://localhost:3000")) return; event.preventDefault(); });
});