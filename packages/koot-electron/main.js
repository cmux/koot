// Modules to control application life and create native browser window
const { app, BrowserWindow, screen } = require('electron');

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: Math.floor(width * 0.8),
        height: Math.floor(height * 0.8),
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Open the DevTools.
    if (process.env.WEBPACK_BUILD_ENV === 'dev') {
        if (typeof __SERVER_PORT__ !== 'undefined') {
            mainWindow.loadURL(
                `http://localhost:${process.env.SERVER_PORT || __SERVER_PORT__}`
            );
            mainWindow.webContents.openDevTools();
        }
    } else {
        mainWindow.loadFile('index.html');
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
