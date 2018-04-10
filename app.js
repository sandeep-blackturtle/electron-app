// npm packages
const fs = require('fs');
const url = require('url');
const path = require('path');
const request = require('request');
const log = require('electron-log');
const electron = require('electron');
const { autoUpdater } = require('electron-updater');

const {
    ERROR,
    MESSAGE,
    STORE_DATA,
    STORED_DATA,
    UPDATE_CHECK,
    UPDATE_AVAILABLE,
    UPDATE_NOT_AVAILABLE,
    APP_UPDATE_PERMISSION,
    UPDATE_DOWNLOAD_PROGRESS,
    UPDATE_DOWNLOAD_COMPLETE,
} = require('./app/src/utils/constants');

// live reload for development
// require('electron-reload')(__dirname);

// configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Module to control application life.
const { app, BrowserWindow, ipcMain } = electron;

// avoide being garbage collected
let mainWindow;

function createWindow() {
    // create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 720,
        minHeight: 600,
    });

    // load the index.html of the app.
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, '/app/index.html'),
            protocol: 'file:',
            slashes: true,
        }),
    );

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // trigger autoupdate check
    autoUpdater.checkForUpdates();
}

// Called after initialization of app and create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Activate from forground
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

function downloadFile(configuration) {
    const { remoteFile, localFile } = configuration;

    return new Promise((resolve, reject) => {
        const req = request({
            method: 'GET',
            uri: remoteFile,
        });

        const out = fs.createWriteStream(localFile);
        req.pipe(out);

        req.on('end', () => resolve());

        req.on('error', () => reject());
    });
}

ipcMain.on(STORE_DATA, (event, data) => {
    const storedPaths = [];
    const dataLength = data.length;
    const storingPath = path.join(__dirname, '/images/');

    data.map((remoteFileSource) => {
        const filename = remoteFileSource.url.split('/').pop().split('#')[0].split('?')[0];

        downloadFile({
            remoteFile: remoteFileSource.url,
            localFile: storingPath + filename,
        }).then(() => {
            const storedData = {
                url: storingPath + filename,
            };

            storedPaths.push(storedData);

            if (dataLength === storedPaths.length) {
                mainWindow.send(STORED_DATA, storedPaths);
                console.log('All Files succesfully downloaded');
            }

            console.log('File succesfully downloaded');
        }).catch((error) => {
            console.log('Error', error);
        });
    });
});

// Auto updates
const sendStatusToWindow = (data) => {
    log.info(data);

    if (mainWindow) {
        mainWindow.send(MESSAGE, data);
    }
};

autoUpdater.on(UPDATE_CHECK, () => {
    sendStatusToWindow('Checking for update.');
});

autoUpdater.on(UPDATE_AVAILABLE, (info) => {
    sendStatusToWindow('App update available.', info);
});

autoUpdater.on(UPDATE_NOT_AVAILABLE, (info) => {
    sendStatusToWindow('App is uptodate.', info);
});

autoUpdater.on(ERROR, (err) => {
    sendStatusToWindow('Error in auto-updater.', err);
});

autoUpdater.on(UPDATE_DOWNLOAD_PROGRESS, (progressObj) => {
    sendStatusToWindow(`Downloaded: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on(UPDATE_DOWNLOAD_COMPLETE, (info) => {
    mainWindow.send(UPDATE_DOWNLOAD_COMPLETE, info);
});

ipcMain.on(APP_UPDATE_PERMISSION, (event, data) => {
    if (data) {
        autoUpdater.quitAndInstall();
    }
});
