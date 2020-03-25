console.log('yes');

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1080,
        height: 760,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.removeMenu();
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'newindex.html'),
        protocol: 'file',
        slashes: true
    }));
    
    win.webContents.openDevTools();
    
    win.on('close', () => {
        win = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win == null) {
        createWindow();
    }
});