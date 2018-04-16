// NPM packages
const fs = require('fs');
const url = require('url');
const path = require('path');
const request = require('request');
const log = require('electron-log');
const electron = require('electron');
const rp = require('request-promise');
const { autoUpdater } = require('electron-updater');

const config = require('./app/src/config/');

const {
    ERROR,
    MESSAGE,
    STORED_DATA,
    UPDATE_CHECK,
    GET_STORED_DATA,
    UPDATE_AVAILABLE,
    UPDATE_NOT_AVAILABLE,
    NEW_CONTENT_DOWNLOAD,
    NEW_CONTENT_AVAILABLE,
    APP_UPDATE_PERMISSION,
    UPDATE_DOWNLOAD_PROGRESS,
    UPDATE_DOWNLOAD_COMPLETE,
    // Status
    STATUS_NEW_CONTENT_NO,
    STATUS_NEW_CONTENT_YES,
} = require('./app/src/utils/constants');

// live reload for development
// require('electron-reload')(__dirname);

// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Module to control application life.
const { app, BrowserWindow, ipcMain, Menu } = electron;

// Avoide being garbage collected
let mainWindow;
// Global variables
const appDataPath = app.getPath('appData');
const dataStoringPath = path.join(appDataPath, `${app.getName()}/data/`);
if (!fs.existsSync(dataStoringPath)) fs.mkdirSync(dataStoringPath); // Create dataStoringPath if not exist

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 720,
        minHeight: 600,
    });

    // Load the index.html of the app.
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

    // Trigger autoupdate check
    autoUpdater.checkForUpdates();
};

// Send messages to window
const sendStatusToWindow = (data) => {
    log.info(data);

    if (mainWindow) {
        mainWindow.send(MESSAGE, data);
    }
};

// Check the files are exist or not
const checkIsFilesExist = (data) => {
    const existingFiles = fs.readdirSync(dataStoringPath).map(file => file);

    data.map((remoteFileSource) => {
        const remoteFile = remoteFileSource.url.split('/').pop().split('#')[0].split('?')[0];

        if (existingFiles.find(existingFile => existingFile === remoteFile)) {
            return mainWindow.send(NEW_CONTENT_AVAILABLE, STATUS_NEW_CONTENT_NO);
        }

        return mainWindow.send(NEW_CONTENT_AVAILABLE, STATUS_NEW_CONTENT_YES);
    });
};

// Check for new content
const checkForNewContent = () => {
    const options = {
        uri: config.url,
        json: true,
    };

    rp(options).then((response) => {
        checkIsFilesExist(response.data);
    }).catch((error) => {
        mainWindow.sendStatusToWindow(MESSAGE, error); // return error
    });
};

ipcMain.on(GET_STORED_DATA, () => {
    const getStoredFiles = [];

    fs.readdirSync(dataStoringPath).forEach((file) => {
        const storedFile = {
            url: dataStoringPath + file,
        };
        getStoredFiles.push(storedFile);
    });

    mainWindow.send(STORED_DATA, getStoredFiles);
});

// Download file and store locally
const downloadFile = (configuration) => {
    const { remoteFile, localFile } = configuration;

    return new Promise((resolve, reject) => {
        // const req = request({
        //     method: 'GET',
        //     uri: remoteFile,
        //     auth: {
        //         username: 'fette',
        //         password: 'asdf',
        //         sendImmediately: false,
        //     },
        // }, (error, response, body) => {
        //     console.log('error:', error); // Print the error if one occurred
        //     console.log('statusCode:', response && response.statusCode);
        //     console.log('body:', body); // Print the HTML for the Google homepage.
        // });

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

// Download only new content
const filterOutExistingFiles = (data) => {
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
            }
        }).catch(() => {
            mainWindow.send(MESSAGE, 'Error downloading files'); // return error
        });
    });
};

ipcMain.on(NEW_CONTENT_DOWNLOAD, () => {
    const options = {
        uri: config.url,
        json: true,
    };

    rp(options).then((response) => {
        filterOutExistingFiles(response.data);
    }).catch((error) => {
        mainWindow.sendStatusToWindow(MESSAGE, error); // return error
    });
});

// Called after initialization of app and ready create browser windows.
app.on('ready', () => {
    createWindow();

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Check for new content',
                    click: () => {
                        checkForNewContent();
                    },
                },
                {
                    type: 'separator',
                },
                { role: 'close' },
            ],
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Contact',
                    click() {
                        require('electron').shell.openExternal('https://3dit.de/en/contact.html');
                    },
                },
            ],
        },
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: 'Check for new content',
                    click: () => {
                        checkForNewContent();
                    },
                },
                {
                    type: 'separator',
                },
                { role: 'close' },
            ],
        });

        // Window menu
        template[3].submenu = [
            { role: 'close' },
            { role: 'minimize' },
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});

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
