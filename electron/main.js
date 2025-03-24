import { app, BrowserWindow } from 'electron';
import express from 'express';
import rateLimit from 'express-rate-limit';
import ngrok from 'ngrok';

const server = express();
const PORT = 3000;

// 設置速率限制
const rate = rateLimit({
    windowMs: 5 * 60 * 1000,  // 5分鐘
    max: 20,  // 限制每IP最多請求20次
    message: "請不要發送太多請求，感謝:L",
    keyGenerator: (req) => req.ip ?? ''
});

server.use(rate);

// API 路由
server.get('/api', (req, res) => {
    res.send({ message: 'Hello from Electron API' });
});

// 啟動 Express 伺服器
server.listen(PORT, async () => {
    await ngrok.kill();
    await ngrok.authtoken('API_TOKEN');
    console.log(`Server is running at http://localhost:${PORT}`);
    try {

        const ngrokUrl = await ngrok.connect(PORT);
        console.log(`ngrok 訪問 URL: ${ngrokUrl}`);


        app.whenReady().then(() => {
            const win = new BrowserWindow({
                minHeight: 720,
                minWidth: 1280,
                autoHideMenuBar: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: true,
                },
            });

            // 使用 ngrok URL 加载
            win.loadURL(ngrokUrl);
        });
    } catch (error) {
        console.error('ngrok 啟動失敗:', error);
    }
});

// 禁用硬體加速
app.disableHardwareAcceleration();

// 當所有窗口關閉時退出應用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
