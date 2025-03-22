import { app, BrowserWindow } from 'electron'



app.whenReady().then(() => {
    const url = process.env.VITE_DEV_SERVER_URL;
    if (url) {
        new BrowserWindow({
            minHeight: 720,
            minWidth: 1280,
            autoHideMenuBar: true,
            webPreferences: {
                // Warning: Enabling nodeIntegration and disabling contextIsolation is not secure in production
                // Consider using contextBridge.exposeInMainWorld
                // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
                nodeIntegration: true,
                contextIsolation: true,
            },
        }).loadURL(url);
    } else {
        console.error('VITE_DEV_SERVER_URL is not defined');
    }
})
