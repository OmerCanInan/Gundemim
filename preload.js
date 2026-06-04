const { contextBridge, ipcRenderer } = require('electron');

// Renderer (React) tarafına sunulan güvenli köprü
contextBridge.exposeInMainWorld('electronAPI', {
  // RSS Verilerini çekmek için (CORS-Safe)
  fetchRss: (url, timeoutMs) => ipcRenderer.invoke('fetch-rss', url, timeoutMs),
  
  // Şifreli Veri Saklama (Audit: Groq API Key Güvenliği için)
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  translateText: (text, lang) => ipcRenderer.invoke('translate-text', text, lang),

  // Update check
  checkUpdate: () => ipcRenderer.invoke('check-update'),

  // Harici tarayıcıda aç (son çare fallback)
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Electron içinde yeni pencere aç (Google Translate vb.)
  openInWindow: (url, title) => ipcRenderer.invoke('open-in-window', url, title),

  // PC Bildirimlerini dinlemek için (Listener sızıntısı önlendi)
  onPcNotification: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('show-pc-notification', subscription);
    
    // Temizlik fonksiyonu (React useEffect içinde kullanılabilir)
    return () => {
      ipcRenderer.removeListener('show-pc-notification', subscription);
    };
  }
});
