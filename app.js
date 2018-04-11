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
    const storedFiles = [];
    const appData = app.getPath('appData');
    const storedFilePath = path.join(appData, `${app.getName()}/data/`);

    if (!fs.existsSync(storedFilePath)) {
        fs.mkdirSync(storedFilePath);
    }

    if (data) {
        fs.readdirSync(storedFilePath).forEach((file) => {
            const storedFile = {
                url: storedFilePath + file,
            };
            storedFiles.push(storedFile);
        });

        mainWindow.send(STORED_DATA, storedFiles);
        mainWindow.send(MESSAGE, storedFiles);
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
// ipcMain.on(STORE_DATA, (event, data) => {
//     const storingPath = path.join(__dirname, '/images/');
//     const storedFilesPaths = fs.readdirSync(storingPath).map(file => file);

//     data.map((remoteFileSource) => {
//         const remoteFilename = remoteFileSource.url.split('/').pop().split('#')[0].split('?')[0];

//         if (storedFilesPaths.find(file => file === remoteFilename)) {
//             return true;
//         }

//         mainWindow.send(NEW_CONTENT_AVAILABLE, true);
//     });
// });

// ipcMain.on(NEW_CONTENT_DOWNLOAD, (event, data)=> {
//     const dataLength = data.length;
//     const storingPath = path.join(__dirname, '/images/');
//     const storedFilesPaths = fs.readdirSync(storingPath).map(file => file);

//     data.map((remoteFileSource) => {
//         const remoteFilename = remoteFileSource.url.split('/').pop().split('#')[0].split('?')[0];

//         if (storedFilesPaths.find(file => file === remoteFilename)) {
//             return true;
//         }

//         downloadFile({
//             remoteFile: remoteFileSource.url,
//             localFile: storingPath + remoteFilename,
//         }).then(() => {
//             const storedData = {
//                 url: storingPath + remoteFilename,
//             };
//             storedFilesPaths.push(storedData);

//             // Send paths to local files
//             if (dataLength === storedFilesPaths.length) {
//                 mainWindow.send(STORED_DATA, storedFilesPaths);
//                 mainWindow.send(MESSAGE, storedFilesPaths);
//             }
//         }).catch(() => {
//             console.log('Error downloading files');
//         });
//     });
// });

ipcMain.on(STORE_DATA, (event, data) => {
    const storedPaths = [];
    const dataLength = data.length;
    const appData = app.getPath('appData');
    const storingPath = path.join(appData, `${app.getName()}/data/`);

    if (!fs.existsSync(storingPath)) {
        fs.mkdirSync(storingPath);
    }

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

            // Send paths to local files
            if (dataLength === storedPaths.length) {
                // mainWindow.send(STORED_DATA, storedPaths);
                mainWindow.send(MESSAGE, storedPaths);
            }
        }).catch(() => {
            console.log('Error downloading files');
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
