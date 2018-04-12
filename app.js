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
    APP_IS_OFFLINE,
    UPDATE_AVAILABLE,
    UPDATE_NOT_AVAILABLE,
    NEW_CONTENT_DOWNLOAD,
    NEW_CONTENT_AVAILABLE,
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
// global variables
const appDataPath = app.getPath('appData');
const dataStoringPath = path.join(appDataPath, `${app.getName()}/data/`);
// create dataStoringPath if not exist
if (!fs.existsSync(dataStoringPath)) fs.mkdirSync(dataStoringPath);

const createWindow = () => {
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
};

// Called after initialization of app and ready create browser windows.
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

// Send messages to window
const sendStatusToWindow = (data) => {
    log.info(data);

    if (mainWindow) {
        mainWindow.send(MESSAGE, data);
    }
};

// Serve offline data
ipcMain.on(APP_IS_OFFLINE, (event, data) => {
    const getStoredFiles = [];

    if (data) {
        fs.readdirSync(dataStoringPath).forEach((file) => {
            const storedFile = {
                url: dataStoringPath + file,
            };
            getStoredFiles.push(storedFile);
        });

        mainWindow.send(STORED_DATA, getStoredFiles);
        mainWindow.send(MESSAGE, getStoredFiles);
    }
});

// Download file and store locally
const downloadFile = (configuration) => {
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
};

// Get data from server and call above method
ipcMain.on(STORE_DATA, (event, data) => {
    const existingFiles = fs.readdirSync(dataStoringPath).map(file => file);

    data.map((remoteFileSource) => {
        const remoteFile = remoteFileSource.url.split('/').pop().split('#')[0].split('?')[0];

        if (existingFiles.find(existingFile => existingFile === remoteFile)) {
            return true;
        }

        return mainWindow.send(NEW_CONTENT_AVAILABLE, true);
    });
});

// Download new content
ipcMain.on(NEW_CONTENT_DOWNLOAD, (event, data) => {
    const allFiles = [];
    const dataLength = data.length;
    const existingFiles = fs.readdirSync(dataStoringPath).map(file => file);

    fs.readdirSync(dataStoringPath).forEach((file) => {
        const storedFile = {
            url: dataStoringPath + file,
        };
        allFiles.push(storedFile);
    });

    data.map((remoteFileSource) => {
        const remoteFile = remoteFileSource.url.split('/').pop().split('#')[0].split('?')[0];

        if (existingFiles.find(existingFile => existingFile === remoteFile)) {
            return true;
        }

        return downloadFile({
            remoteFile: remoteFileSource.url,
            localFile: dataStoringPath + remoteFile,
        }).then(() => {
            const storedData = {
                url: dataStoringPath + remoteFile,
            };
            allFiles.push(storedData);

            if (dataLength === allFiles.length) {
                mainWindow.send(STORED_DATA, allFiles);
                mainWindow.send(MESSAGE, allFiles);
            }
        }).catch(() => {
            mainWindow.send(MESSAGE, 'Error downloading files');
        });
    });
});

// Auto updates
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
