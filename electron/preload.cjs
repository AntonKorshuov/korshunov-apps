const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  saveProgress: (data) => ipcRenderer.invoke('save-progress', data),
  loadProgress: () => ipcRenderer.invoke('load-progress'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  applyRemoteUpdate: (url) => ipcRenderer.invoke('apply-remote-update', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateStatus: (callback) => {
    const handler = (event, val) => callback(val);
    ipcRenderer.on('update-status', handler);
    return () => ipcRenderer.removeListener('update-status', handler);
  }
});
