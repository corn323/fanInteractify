import { app, BrowserWindow, ipcMain } from 'electron';
import express from 'express';
import rateLimit from 'express-rate-limit';
import ngrok from 'ngrok';
import { fileURLToPath } from 'url';
import path from 'path';
const filePath = fileURLToPath(import.meta.url);
const dirPath = path.dirname(filePath);

const server = express();
const NUXT_PORT = 3000;
const EXPRESS_PORT = 3001;

let ngrokToken = '';
let tokenWindow = null;
let mainWindow = null;
let expressServer = null;
let ngrokConnection = null;

const rate = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "請不要發送太多請求，感謝:L",
    keyGenerator: (req) => req.ip ?? ''
});

server.use(rate);
server.get('/', (req, res) => {
    res.status(200).send("成功訪問");
});
ipcMain.on('set-ngrok-token', async (event, token) => {
    console.log('成功接收到token:', token);
    ngrokToken = token;

    try {
        await startNgrokAndApp();
        event.reply('Ngrok成功啟動');
    } catch (error) {
        event.reply('Ngrok啟動失敗', error.message);
        throw new Error(error);
    }
});

ipcMain.on('close-token-window', () => {
    console.log('關閉token輸入視窗');
    if (tokenWindow) {
        tokenWindow.close();
        tokenWindow = null;
    }
});

async function startNgrokAndApp() {
    console.log('啟動Ngrok和主應用');
    if (!ngrokToken) {
        throw new Error('Ngrok的token未設置');
    }

    try {
        if (ngrokConnection) {
            await ngrokConnection.disconnect();
        }
        await ngrok.kill();
        await ngrok.authtoken(ngrokToken);

        expressServer = server.listen(EXPRESS_PORT, () => {
            console.log(`Express運行端口: ${EXPRESS_PORT}`);
        });

        ngrokConnection = await ngrok.connect({
            proto: 'http',
            addr: NUXT_PORT,
            authtoken: ngrokToken
        });

        console.log(`公開網址: ${ngrokConnection}`);

        // 建立主應用介面
        await createMainWindow(ngrokConnection);

        // 關閉token輸入介面
        if (tokenWindow) {
            tokenWindow.close();
            tokenWindow = null;
        }

    } catch (error) {
        console.error('啟動Ngrok和主應用失敗', error);
        throw new Error(error);
    }
}

function createMainWindow(url) {
    return new Promise((resolve, reject) => {
        if (mainWindow) {
            mainWindow.close();
        }

        mainWindow = new BrowserWindow({
            width: 1280,
            height: 720,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.on('did-finish-load', () => {
            console.log('成功進入主視窗');
            resolve(mainWindow);
        });

        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error('Failed to load main window:', errorDescription);
            reject(new Error(errorDescription));
        });

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    });
}

function showTokenInputWindow() {
    console.log('建立token輸入介面');
    tokenWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(dirPath, 'preload.js')
        }
    });

    tokenWindow.loadFile(path.join('electron', 'ngrokTokenPage.html'));

    tokenWindow.webContents.on('did-finish-load', () => {
        console.log('成功進入token輸入介面');
    });

    tokenWindow.on('closed', () => {
        tokenWindow = null;
    });
}

app.on('window-all-closed', () => {
    console.log('關閉所有視窗');

    if (expressServer) {
        expressServer.close();
    }

    if (ngrokConnection) {
        ngrok.disconnect();
        ngrok.kill();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady().then(() => {
    console.log('程式啟動成功');
    showTokenInputWindow();
}).catch(error => {
    console.error('程式啟動失敗', error);
});

process.on('exit', () => {
    if (expressServer) {
        expressServer.close();
    }

    if (ngrokConnection) {
        ngrok.disconnect();
        ngrok.kill();
    }
});