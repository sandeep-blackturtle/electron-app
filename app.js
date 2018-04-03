// npm packages
const url = require('url');
const path = require('path');
const electron = require('electron');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

require('electron-reload')(__dirname);

// configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Module to control application life and create native browser window.
const { app, BrowserWindow } = electron;

// avoide being garbage collected
let mainWindow;

function createWindow() {
    // create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });

    //load the index.html of the app.
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, '/app/index.html'),
            protocol: 'file:',
            slashes: true,
        })
    );

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    // trigger autoupdate check
    autoUpdater.checkForUpdates();
}

// Called when Electron has finished initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});

// Auto updates
const sendStatusToWindow = (text) => {
    log.info(text);
    if (mainWindow) {
        mainWindow.webContents.send('message', text);
    }
};

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', info => {
    sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', info => {
    sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', err => {
    sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
});

autoUpdater.on('download-progress', progressObj => {
    sendStatusToWindow(
        `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
    );
});

autoUpdater.on('update-downloaded', info => {
    sendStatusToWindow('Update downloaded; will install now');
});

autoUpdater.on('update-downloaded', info => {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 500 ms.
    // You could call autoUpdater.quitAndInstall(); immediately
    autoUpdater.quitAndInstall();
});
