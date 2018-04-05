// npm packages
const url = require('url');
const path = require('path');
const log = require('electron-log');
const electron = require('electron');
const { autoUpdater } = require('electron-updater');

const {
    MESSAGE, 
    ERROR_ON_UPDATE, 
    UPDATE_AVAILABLE, 
    CHECKING_FOR_UPDATE, 
    UPDATE_NOT_AVAILABLE, 
    DOWNLOAD_UPDATE_DENIED, 
    DOWNLOAD_UPDATE_ACCEPTED, 
    UPDATE_DOWNLOAD_PROGRESS, 
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
    mainWindow.send(CHECKING_FOR_UPDATE, 'Checking for update.');
});

autoUpdater.on('update-available', info => {
    mainWindow.send(UPDATE_AVAILABLE, 'Update available.');
});

autoUpdater.on('update-not-available', info => {
    mainWindow.send(UPDATE_NOT_AVAILABLE, 'Update not available.');
});

autoUpdater.on('error', err => {
    mainWindow.send(ERROR_ON_UPDATE, err);
});

ipcMain.on(DOWNLOAD_UPDATE_ACCEPTED, (event, data ) => {
    //console.log('Update download accepted....');

    autoUpdater.on('download-progress', progressObj => {
        // sendStatusToWindow(
        //     `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
        // );
        mainWindow.send(UPDATE_DOWNLOAD_PROGRESS, progressObj)
    });
    
    autoUpdater.on('update-downloaded', info => {
        sendStatusToWindow('Update downloaded; will install now');
    });
    
    autoUpdater.on('update-downloaded', info => {
        autoUpdater.quitAndInstall();
    });
});

ipcMain.on(DOWNLOAD_UPDATE_DENIED, (event, data ) => {
    console.log('Updates downloa denied....');
});
