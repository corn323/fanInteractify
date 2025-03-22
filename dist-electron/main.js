import { app as n, BrowserWindow as o } from "electron";
n.whenReady().then(() => {
  const e = process.env.VITE_DEV_SERVER_URL;
  e ? new o({
    minHeight: 720,
    minWidth: 1280,
    autoHideMenuBar: !0,
    webPreferences: {
      // Warning: Enabling nodeIntegration and disabling contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: !0,
      contextIsolation: !0
    }
  }).loadURL(e) : console.error("VITE_DEV_SERVER_URL is not defined");
});
