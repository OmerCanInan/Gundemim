const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');

// Yeni nesil Electron/Chromium'da CORS ve site izolasyonunu kökten kapatmak için:
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-features', 'IsolateOrigins,site-per-process');
app.commandLine.appendSwitch('disable-site-isolation-trials');

// Vite'nin varsayılan portu 5173'tür. 
// Geliştirmede portu izleriz, derlendiğinde statik dosyaları okuruz.

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Gündemim',
    autoHideMenuBar: true, // Üstteki rahatsız edici menüyü gizler, temiz görünüm için.
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false, // CORS korumasını tamamen kapatır, herhangi bir adresten veri çekilmesine izin verir.
    },
  });

  // GÜVENLİK FİLTRESİ: Dış bağlantıları (örn: Gemini API Sayfası) Electron içinde
  // gömülü popup olarak açmak yerine kullanıcının bilgisayarındaki ana tarayıcıda aç.
  // Bu işlem "Google Bu Tarayıcı Güvenli Olmayabilir" hatasını çözer!
  // GÜVENLİK VE OKUMA AYARI: Sadece giriş yapılması gereken (Login) sayfaları dış tarayıcıda açar,
  // diğer tüm haber içeriklerini uygulamanın kendi penceresinde açar.
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Sadece hesap/login sayfalarını dışarı zorla aktar
    if (url.includes('accounts.google.com') || url.includes('console.groq.com')) {
       require('electron').shell.openExternal(url);
       return { action: 'deny' };
    }
    // Haber sitelerini uygulama içinde (webview gibi) yeni pencerede aç
    return { action: 'allow' };
  });

  if (isDev) {
    // Önbelleği (cache) dev modunda temizliyoruz ki inatçı CSS dosyaları eski haliyle kalmasın.
    win.webContents.session.clearCache().then(() => {
      win.loadURL('http://localhost:5173');
      win.webContents.openDevTools({ mode: 'right' }); // Sistem analizi 
    });
  } else {
    // Uygulama derlendikten sonra .exe dosyası içinde "dist/index.html" dosyasını arayacak.
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// Sitelerin güvenlik duvarlarını aşmak (Tass vb. siteler Electron'u engelleyebilir)
// Uygulamayı tamamen gerçek bir Google Chrome tarayıcısı gibi gösteririz.
app.userAgentFallback = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

// LİNK GÜVENLİK VE HATA YÖNETİMİ (PC ÖZEL)
// Bazı siteler (CORS/X-Frame-Options vb.) uygulama içinde açılmayı reddedebilir.
// Eğer "Access Denied" veya yükleme hatası olursa otomatik olarak dış tarayıcıya (Chrome vb.) aktarır.
app.on('web-contents-created', (event, contents) => {
  // Sadece yeni açılan pencereleri izle
  if (contents.getType() === 'window') {
    // Sayfanın doğum zamanını kaydet (Hayalet yönlendirmeleri engellemek için)
    contents.spawnTime = Date.now();
    
    // 1. Bağlantı Seviyesinde Hatalar (Timeout, DNS vb.)
    contents.on('did-fail-load', async (event, errorCode, errorDescription, validatedURL) => {
      // Sadece ilk 3 saniyedeki yükleme hatalarını ciddiye al (Haber açıldıktan sonra gelen hataları yoksay)
      if (Date.now() - contents.spawnTime > 3000) return;

      if (validatedURL && validatedURL.startsWith('http')) {
        handleRedirect(validatedURL, 'Bağlantı Sorunu', 'Bu site şu an uygulama içinde açılamıyor.');
      }
    });

    // 2. HTTP Seviyesinde Hatalar (Hizmet Engellenmesi v.b.)
    contents.on('did-navigate', (event, url, httpResponseCode) => {
      // Sayfa bir kere başarıyla yüklendiyse (veya 3 sn geçtiyse) yönlendirme yapma
      if (Date.now() - contents.spawnTime > 3500) return;

      if (httpResponseCode === 403 || httpResponseCode === 401) {
        handleRedirect(url, 'Erişim Engellendi', 'Bu site uygulama içinden erişimi reddetti.');
      }
    });

    // Bazı durumlarda did-navigate tetiklenmeyebilir, her ihtimale karşı session bazlı izleme:
    contents.session.webRequest.onCompleted({ urls: ['*://*/*'] }, (details) => {
      // KRİTİK FİLTRELER:
      // 1. Sadece ana sayfa (mainFrame) olacak.
      // 2. Yükleme başladıktan sonraki ilk 3 saniye içinde olacak.
      // 3. Hata veren URL, o an penceremizin gitmeye çalıştığı asıl URL ile aynı olacak (Reklamları eler).
      if (
        details.resourceType === 'mainFrame' && 
        (details.statusCode === 403 || details.statusCode === 401) &&
        (Date.now() - contents.spawnTime < 3000) &&
        details.url === contents.getURL()
      ) {
        handleRedirect(details.url, 'Erişim Engellendi', 'Site güvenliği uygulama içinden görüntülemeyi reddetti.');
      }
    });

    // Ortak yönlendirme fonksiyonu (Premium Bildirim Sistemi)
    const handleRedirect = (url, title, message) => {
      // REKLAM VE STATİK SERVİS FİLTRESİ
      const ignoredDomains = [
        'googlesyndication.com', 'doubleclick.net', 'googleadservices.com', 
        'safeframe.googlesyndication.com', 'ads-twitter.com', 'chartbeat.net',
        'nav-client.bbc.com', 'static.bbc.co.uk'
      ];
      
      if (ignoredDomains.some(domain => url.includes(domain))) return;

      console.warn(`${title}: ${url}`);
      
      // Renderer'a (React) şık bildirimi göstermesi için haber ver
      contents.send('show-pc-notification', {
        title: title,
        message: 'Güvenliğiniz için bu haber varsayılan tarayıcıda açılıyor.',
        detail: 'Haber sitesi kısıtlamaları nedeniyle Chrome üzerinde devam ediliyor.',
        type: 'warning'
      });

      shell.openExternal(url);
      const win = BrowserWindow.fromWebContents(contents);
      if (win) {
        setTimeout(() => win.close(), 100);
      }
    };
  }
});

app.whenReady().then(() => {
  createWindow();

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
