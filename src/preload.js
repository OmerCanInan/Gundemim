const { contextBridge, ipcRenderer } = require('electron');

// Renderer (React) tarafına sadece ihtiyacı olan API'ları güvenli bir şekilde sunuyoruz.
contextBridge.exposeInMainWorld('electronAPI', {
  // RSS Verilerini çekmek için köprü
  fetchRss: (url) => ipcRenderer.invoke('fetch-rss', url),
  
  // PC Tarafından gelen bildirimleri dinlemek için
  onPcNotification: (callback) => ipcRenderer.on('show-pc-notification', (_event, value) => callback(value))
});
