const https = require('https');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const API_MANIFEST_URL = 'https://api.github.com/repos/AntonKorshuov/korshunov-apps/contents/mathe-champion/version.json';
const RAW_MANIFEST_URL = 'https://raw.githubusercontent.com/AntonKorshuov/korshunov-apps/main/mathe-champion/version.json';

// Helper to compare semver '1.0.1' > '1.0.0'
function isNewerVersion(remote, local) {
  const rParts = remote.split('.').map(n => parseInt(n, 10) || 0);
  const lParts = local.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
    const r = rParts[i] || 0;
    const l = lParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const reqUrl = `${url}?t=${Date.now()}`;
    https.get(reqUrl, { 
      headers: { 
        'User-Agent': 'MatheChampion-Client',
        'Accept': 'application/vnd.github.v3+json'
      } 
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          // If GitHub contents API response with base64 content
          if (parsed && parsed.content && parsed.encoding === 'base64') {
            const decoded = Buffer.from(parsed.content, 'base64').toString('utf-8');
            return resolve(JSON.parse(decoded));
          }
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'MatheChampion-Client' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`Download failed with HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      file.close();
      try { fs.unlinkSync(destPath); } catch {}
      reject(err);
    });
  });
}

class RemoteUpdater {
  constructor() {
    this.currentVersion = app.getVersion();
  }

  async checkForUpdates() {
    try {
      let manifest = null;
      try {
        manifest = await fetchJson(API_MANIFEST_URL);
      } catch {
        manifest = await fetchJson(RAW_MANIFEST_URL);
      }
      if (manifest && manifest.version && isNewerVersion(manifest.version, this.currentVersion)) {
        return {
          hasUpdate: true,
          version: manifest.version,
          description: manifest.description || 'Neues Mathe-Update verfügbar',
          downloadUrl: manifest.downloadUrl || 'https://raw.githubusercontent.com/AntonKorshuov/korshunov-apps/main/mathe-champion/update-bundle.zip'
        };
      }
      return { hasUpdate: false, currentVersion: this.currentVersion };
    } catch (err) {
      console.log('Update check failed (likely offline):', err.message);
      return { hasUpdate: false, error: err.message };
    }
  }

  async downloadAndApplyUpdate(downloadUrl, onProgress) {
    try {
      const tempZip = path.join(app.getPath('temp'), `mathe-update-${Date.now()}.zip`);
      await downloadFile(downloadUrl, tempZip);

      // Extract zip using PowerShell Expand-Archive (built-in on Windows, zero external deps!)
      const targetDir = path.join(__dirname, '..'); // app root directory
      const { exec } = require('child_process');
      const cmd = `powershell.exe -NoProfile -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${targetDir}' -Force; Remove-Item '${tempZip}' -Force"`;

      return new Promise((resolve, reject) => {
        exec(cmd, (error) => {
          if (error) {
            return reject(error);
          }
          resolve({ success: true });
        });
      });
    } catch (err) {
      console.error('Apply update failed:', err);
      throw err;
    }
  }
}

module.exports = { RemoteUpdater };
