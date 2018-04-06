// npm packages
const url = require('url');
const path = require('path');
const log = require('electron-log');
const electron = require('electron');
const { autoUpdater } = require('electron-updater');

const {
    ERROR, 
    MESSAGE, 
    UPDATE_CHECK, 
    UPDATE_AVAILABLE, 
    UPDATE_NOT_AVAILABLE, 
    APP_UPDATE_PERMISSION, 
    UPDATE_DOWNLOAD_PROGRESS, 
    UPDATE_DOWNLOAD_COMPLETE, 
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
    if (process.env.NODE_ENV === 'production') {
        autoUpdater.checkForUpdates()
    }
}

// Called after initialization of app and create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Activate from forground
app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});

// Auto updates
const sendStatusToWindow = (data) => {
    log.info(data);
    if (mainWindow) {
        mainWindow.send(MESSAGE, data);
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

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  sendStatusToWindow(`Downloaded: ${progressObj.percent}%`);
});

autoUpdater.on('update-downloaded', info => {
    mainWindow.send(UPDATE_DOWNLOAD_COMPLETE, info);
});

ipcMain.on(APP_UPDATE_PERMISSION, (event, data) => {

    if(data) {
        autoUpdater.quitAndInstall();
    }
});
