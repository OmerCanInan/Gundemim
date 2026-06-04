const { app, BrowserWindow, shell, ipcMain, net, session } = require('electron');
let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (e) {
  // Module not found, silent fallback
}
const path = require('path');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let win = null;

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// --- CONSTANTS ---
const LOAD_GRACE_PERIOD_MS = 3000;
const REDIRECT_DELAY_MS = 100;

const isDev = !app.isPackaged;

/**
 * Common redirect handler
 */
const handleRedirect = (contents, url, title, message) => {
  const ignoredDomains = [
    'googlesyndication.com', 'doubleclick.net', 'googleadservices.com', 
    'safeframe.googlesyndication.com', 'ads-twitter.com', 'chartbeat.net',
    'nav-client.bbc.com', 'static.bbc.co.uk'
  ];
  
  if (ignoredDomains.some(domain => url.includes(domain))) return;

  contents.send('show-pc-notification', {
    title: title,
    message: 'Güvenliğiniz için bu haber varsayılan tarayıcıda açılıyor.',
    detail: 'Haber sitesi kısıtlamaları nedeniyle Chrome üzerinde devam ediliyor.',
    type: 'warning'
  });

  shell.openExternal(url);
  // Ana pencereyi kapatma mantığı hatalıydı (Bug #11), kaldırıldı.
};

// Hata Yakalayıcı (Terminalde crash detaylarını görmek için)
process.on('uncaughtException', (error) => {
  console.error('[Electron Main] Uncaught Exception:', error);
});

function createWindow() {
  const isDev = process.env.IS_DEV === 'true' || !app.isPackaged;
  const iconPath = path.join(__dirname, 'resources', 'icon.png');
  
  // İkon dosya kontrolü
  const fs = require('fs');
  const finalIcon = fs.existsSync(iconPath) ? iconPath : undefined;

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Gündemim',
    icon: finalIcon,
    autoHideMenuBar: true,
    show: false, // Hazır olana kadar gizli tut (Siyah/Beyaz ekranı önler)
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com') || url.includes('console.groq.com')) {
       shell.openExternal(url);
       return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (isDev) {
    console.log('[Electron] Loading dev server: http://localhost:5173');
    win.loadURL('http://localhost:5173').catch(() => {
      console.log('[Electron] Retrying loadURL in 1s...');
      setTimeout(() => win.loadURL('http://localhost:5173'), 1000);
    });
    
    win.webContents.on('did-finish-load', () => {
      win.webContents.openDevTools({ mode: 'right' });
    });
    
    win.webContents.session.clearCache().catch(() => {});
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html')).catch(err => {
      console.error('[Electron] Failed to load production file:', err);
    });
  }

  win.once('ready-to-show', () => {
    win.show();
  });
}

// Security: API Key Encryption
const { safeStorage } = require('electron');
const fs = require('fs');

ipcMain.handle('save-api-key', async (event, key) => {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Encryption not supported');
  const encrypted = safeStorage.encryptString(key);
  const keyPath = path.join(app.getPath('userData'), 'apisecret.bin');
  fs.writeFileSync(keyPath, encrypted);
  return true;
});

ipcMain.handle('get-api-key', async () => {
  const keyPath = path.join(app.getPath('userData'), 'apisecret.bin');
  if (!fs.existsSync(keyPath)) return null;
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Decryption not supported');
  const buffer = fs.readFileSync(keyPath);
  return safeStorage.decryptString(buffer);
});

// IPC: RSS Fetching
ipcMain.handle('fetch-rss', async (event, url, timeoutMs = 20000) => {
  const cleanUrl = url.trim();
  const attemptFetch = async (targetUrl) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await net.fetch(targetUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Sec-Ch-Ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`${response.status}`);
      return await response.text();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    return await attemptFetch(cleanUrl);
  } catch (error) {
    if (cleanUrl.startsWith('http://')) {
      const httpsUrl = cleanUrl.replace('http://', 'https://');
      try {
        return await attemptFetch(httpsUrl);
      } catch (retryError) {
        throw new Error(`Failed: ${retryError.message}`);
      }
    }
    throw error;
  }
});

// IPC: Translation with single fallback (Google Translate Informal)
ipcMain.handle('translate-text', async (event, text, targetLang = 'tr') => {
  try {
    const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(trUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data[0])) {
        let translatedText = '';
        data[0].forEach(t => { if (t[0]) translatedText += t[0]; });
        if (translatedText) return translatedText;
      }
    }
  } catch (err) { 
    console.warn('[Electron] Translation fallback failed:', err.message);
  }
  
  return text; // Return original text if translation fails
});

// IPC: Harici tarayıcıda aç (NewsCard fallback son aşama)
ipcMain.handle('open-external', async (event, url) => {
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Geçersiz URL' };
});

// IPC: Electron içinde yeni pencere aç (Google Translate vb.)
ipcMain.handle('open-in-window', async (event, url, title) => {
  if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return { success: false, error: 'Geçersiz URL' };
  }
  const child = new BrowserWindow({
    width: 1100,
    height: 800,
    title: title || 'Gündemim',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Google Translate iframe'lerin çalışması için
    }
  });
  child.loadURL(url);
  child.once('ready-to-show', () => child.show());
  return { success: true };
});

app.userAgentFallback = "Gundemim/1.1 (RSS Reader; +https://github.com/OmerCanInan/Gundemim)";

app.on('web-contents-created', (event, contents) => {
  if (contents.getType() === 'window') {
    contents.spawnTime = Date.now();
    
    contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      // Geliştirme sunucusu (localhost) hatalarını görmezden gel, yönlendirme yapma
      if (validatedURL && (validatedURL.includes('localhost') || validatedURL.includes('127.0.0.1'))) return;

      // Only redirect if it fails immediately during load
      if (Date.now() - contents.spawnTime > LOAD_GRACE_PERIOD_MS) return;
      if (validatedURL && validatedURL.startsWith('http')) {
        handleRedirect(contents, validatedURL, 'Bağlantı Sorunu', 'Sayfa uygulama dışına yönlendirildi.');
      }
    });

    // SPAM PREVENTION: Disabled the 403/401 automatic redirect to avoid constant popups
  }
});

app.whenReady().then(() => {
  createWindow();

  if (autoUpdater) {
    console.log('[Electron] Setting up auto updater...');
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      if (win) {
        win.webContents.send('show-pc-notification', {
          title: 'Güncelleme',
          message: 'Güncellemeler kontrol ediliyor...',
          type: 'info'
        });
      }
    });

    autoUpdater.on('update-available', (info) => {
      if (win) {
        win.webContents.send('show-pc-notification', {
          title: 'Güncelleme Bulundu',
          message: 'Yeni bir sürüm indiriliyor...',
          detail: `Sürüm ${info.version}`,
          type: 'info'
        });
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      if (win) {
        win.webContents.send('show-pc-notification', {
          title: 'Güncelsiniz',
          message: 'Şu an en güncel sürümü kullanıyorsunuz.',
          type: 'success'
        });
      }
    });

    autoUpdater.on('error', (err) => {
      if (win) {
        win.webContents.send('show-pc-notification', {
          title: 'Güncelleme Hatası',
          message: 'Güncellemeler kontrol edilirken bir hata oluştu.',
          detail: err == null ? 'Bilinmeyen Hata' : (err.stack || err).toString(),
          type: 'error'
        });
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      if (win) {
        win.webContents.send('show-pc-notification', {
          title: 'Güncelleme İndirildi',
          message: 'Yeni sürüm kuruluma hazır.',
          detail: 'Uygulamayı kapattığınızda otomatik olarak yüklenecektir.',
          type: 'success'
        });
      }
    });

    if (!isDev) {
      console.log('[Electron] Checking for updates on startup...');
      autoUpdater.checkForUpdatesAndNotify().catch(err => {
        console.warn('[Electron] Update check failed:', err);
      });
    }

    ipcMain.handle('check-update', async () => {
      try {
        if(isDev) {
          // Geliştirici modunda test için uyarı
          return { error: 'Geliştirici modunda güncelleme kontrolü yapılamaz. Lütfen uygulamayı build alıp test edin.' };
        }
        await autoUpdater.checkForUpdatesAndNotify();
        return { success: true };
      } catch (err) {
        return { error: err.message };
      }
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
