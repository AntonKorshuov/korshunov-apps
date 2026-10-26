const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let autoUpdater = null;
try {
  const updaterModule = require('electron-updater');
  autoUpdater = updaterModule.autoUpdater;
} catch (e) {
  console.log('electron-updater not loaded:', e.message);
}

// Disable shader disk cache to avoid Windows permission/encoding issues
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

// Ensure unique custom user data directory
app.setName('MatheChampion5');
const userDataPath = path.join(app.getPath('appData'), 'MatheChampion5');
app.setPath('userData', userDataPath);

// Path to persistent progress file
const progressFilePath = path.join(userDataPath, 'user_progress.json');
const progressBackupPath = path.join(userDataPath, 'user_progress.backup.json');

// Ensure directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Single instance lock
let mainWindow = null;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function sendUpdateStatus(status, details = null) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-status', { status, details });
    }
  }

  // Setup auto-updater settings
  if (autoUpdater) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    try {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'AntonKorshuov',
        repo: 'korshunov-apps'
      });
    } catch (e) {
      console.log('FeedURL setup note:', e.message);
    }

    autoUpdater.on('checking-for-update', () => {
      sendUpdateStatus('checking');
    });

    autoUpdater.on('update-available', (info) => {
      sendUpdateStatus('available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      sendUpdateStatus('not-available', info);
    });

    autoUpdater.on('error', (err) => {
      sendUpdateStatus('error', err == null ? 'unknown' : (err.message || String(err)));
    });

    autoUpdater.on('download-progress', (progressObj) => {
      sendUpdateStatus('downloading', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      sendUpdateStatus('downloaded', info);
    });
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 850,
      minWidth: 1024,
      minHeight: 700,
      title: 'Mathe-Champion 5',
      backgroundColor: '#0f172a',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.cjs')
      },
      autoHideMenuBar: true,
      show: false
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();

      // Check for updates after 5 seconds if updater is present
      if (autoUpdater) {
        setTimeout(() => {
          try {
            autoUpdater.checkForUpdatesAndNotify().catch((e) => {
              console.log('Update check ignored (offline or dev mode):', e.message);
            });
          } catch (e) {
            console.log('Update check failed:', e);
          }
        }, 5000);
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
      mainWindow.loadURL(devServerUrl);
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  // IPC Handlers for reliable data persistence
  ipcMain.handle('save-progress', async (event, data) => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      // Write backup first
      if (fs.existsSync(progressFilePath)) {
        try {
          fs.copyFileSync(progressFilePath, progressBackupPath);
        } catch {
          // ignore
        }
      }
      fs.writeFileSync(progressFilePath, jsonStr, 'utf-8');
      return { success: true };
    } catch (err) {
      console.error('Failed to save progress to file:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('load-progress', async () => {
    try {
      if (fs.existsSync(progressFilePath)) {
        const raw = fs.readFileSync(progressFilePath, 'utf-8');
        return JSON.parse(raw);
      }
      if (fs.existsSync(progressBackupPath)) {
        const raw = fs.readFileSync(progressBackupPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to read progress from file:', err);
    }
    return null;
  });

  ipcMain.handle('check-for-updates', async () => {
    if (!autoUpdater) {
      return { success: false, error: 'Updater not available in this mode' };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('install-update', () => {
    if (autoUpdater) {
      autoUpdater.quitAndInstall();
    }
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
