const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { RemoteUpdater } = require('./remoteUpdater.cjs');

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

  const remoteUpdater = new RemoteUpdater();

  function sendUpdateStatus(status, details = null) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-status', { status, details });
    }
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

      // Check for updates after 3 seconds from GitHub
      setTimeout(async () => {
        try {
          const res = await remoteUpdater.checkForUpdates();
          if (res && res.hasUpdate) {
            sendUpdateStatus('available', res);
          }
        } catch (e) {
          console.log('Initial update check error:', e.message);
        }
      }, 3000);
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
      if (fs.existsSync(progressFilePath)) {
        try {
          fs.copyFileSync(progressFilePath, progressBackupPath);
        } catch {}
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

  // Remote GitHub Update Handlers
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await remoteUpdater.checkForUpdates();
      return { success: true, ...result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('apply-remote-update', async (event, downloadUrl) => {
    try {
      sendUpdateStatus('downloading');
      await remoteUpdater.downloadAndApplyUpdate(downloadUrl);
      sendUpdateStatus('downloaded');
      // Relaunch app with updated code
      app.relaunch();
      app.exit(0);
      return { success: true };
    } catch (err) {
      sendUpdateStatus('error', err.message);
      return { success: false, error: err.message };
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
