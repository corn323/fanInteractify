const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('error', (event) => {
    console.error('發生了點錯誤:', event);
    throw new Error(event);
});

ipcRenderer.on('error', (event, error) => {
    console.error('IPC發生錯誤:', error);
});

contextBridge.exposeInMainWorld('electron', {
    sendToken: (token) => {
        return new Promise((resolve, reject) => {
            try {
                ipcRenderer.send('set-ngrok-token', token);
                ipcRenderer.once('ngrok-error', (event, error) => {
                    throw new Error(error);
                });

                const timeout = setTimeout(() => {
                    reject(new Error('Token傳送至主進程過久'));
                }, 5000);

                ipcRenderer.once('ngrok-success', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            } catch (error) {
                console.error('傳送Token時發生未知錯誤:', error);
                throw new Error(error);
            }
        });
    },
    closeWindow: () => {
        try {
            ipcRenderer.send('close-token-window');
        } catch (error) {
            console.error('關閉token輸入視窗時發生錯誤:', error);
            throw new Error(error);
        }
    }
});