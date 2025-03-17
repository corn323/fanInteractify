import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
    const url = process.env.VITE_DEV_SERVER_URL;
    if (url) {
        new BrowserWindow().loadURL(url);
    } else {
        console.error('VITE_DEV_SERVER_URL is not defined');
    }
})
