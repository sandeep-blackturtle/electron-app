// npm packages
const url = require('url');
const path = require('path');
const log = require('electron-log');
const electron = require('electron');
const { autoUpdater } = require('electron-updater');

const {
    MESSAGE, 
    HANDLE_UPDATE, 
    ON_SUBMIT, 
    DOWNLOAD_UPDATES_ACCEPTED, 
    DOWNLOAD_UPDATES_DENIED, 
} = require('./app/src/utils/constants')

// live reload for development
//require('electron-reload')(__dirname);

// configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Module to control application life.
const { app, BrowserWindow, ipcMain} = electron;

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

// Called after initialization of app and create browser windows.
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

ipcMain.on(ON_SUBMIT, (event, data) => {
    console.log('log data::', data);

    mainWindow.send(HANDLE_UPDATE, 'Testing.....');
});

// Auto updates
const sendStatusToWindow = (text) => {
    log.info(text);
    if (mainWindow) {
        mainWindow.send(MESSAGE, text);
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

ipcMain.on(DOWNLOAD_UPDATES_ACCEPTED, (event, data ) => {
    console.log('Downloading....');
});

ipcMain.on(DOWNLOAD_UPDATES_DENIED, (event, data ) => {
    console.log('Updates downloa denied....');
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
    autoUpdater.quitAndInstall();
});
