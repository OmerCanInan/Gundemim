import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { TranslationProvider } from './context/TranslationContext';
import { RadioProvider } from './context/RadioContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import NewsFeed from './pages/NewsFeed';
import Discover from './pages/Discover';
import HowToUseDrawer from './components/HowToUseDrawer';
import Legal from './pages/Legal';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getAppSettings, getNewsCache } from './services/dbService';
import FirstLaunchSetup from './components/FirstLaunchSetup';
import { backgroundTranslateNews } from './services/mlKitService';
import { AlertTriangle, Download, X, CheckCircle, RefreshCw } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [pcNotification, setPcNotification] = useState(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Mobil: Soldan sağa kaydırınca sidebar aç, sağdan sola kapat
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    // Yatay hareket dikey hareketten belirgin biçimde fazlaysa (kaydırma, scroll değil)
    if (dy > 60) return; // Dikey scroll'u yoksay
    if (Math.abs(dx) < 60) return; // Kısa dokunuşları yoksay

    if (dx > 0 && touchStartX.current < 40) {
      // Sol kenarden sağa: sidebar aç
      setIsSidebarOpen(true);
    } else if (dx < 0) {
      // Sağdan sola: sidebar kapat
      setIsSidebarOpen(false);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, []);

  useEffect(() => {
    const isMobile = window.Capacitor?.isNativePlatform() || window.innerWidth < 768;
    if (!isMobile) return;
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // İlk açılışta ML Kit Setup ekranı kontrolü + arka plan çevirisi
  useEffect(() => {
    setTimeout(async () => {
      const isMobile = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
      const hasDoneSetup = localStorage.getItem('gundemim_mlkit_setup_done');

      if (isMobile && !hasDoneSetup) {
        setIsSetupOpen(true);
      } else {
        // Rehber kontrolü
        const hasSeenOnboarding = localStorage.getItem('gundemim_first_start');
        if (!hasSeenOnboarding) {
          setIsHowToUseOpen(true);
          localStorage.setItem('gundemim_first_start', 'done');
        }

        // Her açılışta: model hazırsa cache'deki haberleri çevir
        if (isMobile) {
          const cached = getNewsCache();
          if (cached.length > 0) {
            backgroundTranslateNews(cached);
          }
        }
      }
    }, 800);
  }, []);

  // PC (Electron) Bildirim Dinleyicisi
  useEffect(() => {
    // Sadece Electron ortamındaysak çalıştır
    if (window.electronAPI && typeof window.electronAPI.onPcNotification === 'function') {
      const cleanup = window.electronAPI.onPcNotification((data) => {
        setPcNotification(data);
        // 5 saniye sonra otomatik kapat
        setTimeout(() => setPcNotification(null), 5000);
      });
      
      return () => cleanup();
    }
  }, []);

  // Uygulama ayarlarını dinleyip ana DOM'a işliyoruz
  useEffect(() => {
    const applySettings = () => {
      const settings = getAppSettings();
      document.documentElement.setAttribute('data-theme-font', settings.fontTheme || 'mix');
      document.documentElement.setAttribute('data-theme-layout', settings.layoutStrategy || 'grid');
      document.documentElement.setAttribute('data-theme', settings.colorTheme || 'dark');
      document.documentElement.setAttribute('data-cards-per-row', String(settings.cardsPerRow || 2));
    };

    applySettings();
    window.addEventListener('rss_settings_updated', applySettings);
    
    const handleToggleHowToUse = () => setIsHowToUseOpen(prev => !prev);
    window.addEventListener('toggle_how_to_use', handleToggleHowToUse);

    return () => {
      window.removeEventListener('rss_settings_updated', applySettings);
      window.removeEventListener('toggle_how_to_use', handleToggleHowToUse);
    };
  }, []);

  return (
    <TranslationProvider>
      <RadioProvider>
        <Router>
          <AppContent 
            isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
            isHowToUseOpen={isHowToUseOpen} setIsHowToUseOpen={setIsHowToUseOpen}
            isSetupOpen={isSetupOpen} setIsSetupOpen={setIsSetupOpen}
            pcNotification={pcNotification}
          />
        </Router>
      </RadioProvider>
    </TranslationProvider>
  );
}

// Alt bileşende Router context'ine (useLocation) erişebilmek için AppContent oluşturuldu
function AppContent({ isSidebarOpen, setIsSidebarOpen, isHowToUseOpen, setIsHowToUseOpen, isSetupOpen, setIsSetupOpen, pcNotification }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- OTOMATİK GÜNCELLEME STATE & LİSTENERS ---
  const [updateState, setUpdateState] = useState(null);
  const [hideBanner, setHideBanner] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      if (typeof window.electronAPI.getUpdateState === 'function') {
        window.electronAPI.getUpdateState().then(state => {
          if (state && state.status && state.status !== 'idle') {
            setUpdateState(state);
          }
        });
      }
      if (typeof window.electronAPI.onUpdateStatusChanged === 'function') {
        const cleanup = window.electronAPI.onUpdateStatusChanged((state) => {
          setUpdateState(state);
          setHideBanner(false); // Yeni durum geldiğinde banner'ı tekrar göster
        });
        return () => cleanup();
      }
    }
  }, []);

  // --- SCROLL RESET (Tepeden Başlatma) ---
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [location.pathname]);

  // --- ONBOARDING (İlk Karşılama) ---
  // Rehber mantığı App.jsx'teki FirstLaunchSetup tamamlanınca veya es geçilince tetikleniyor.

  // --- PC BAŞLANGIÇ YÖNLENDİRMESİ (Redirect to Discover) ---
  useEffect(() => {
    const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
    if (isElectron && location.pathname === '/') {
      navigate('/discover', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      
      {/* Otomatik Güncelleme Bildirim Şeridi (Banner) */}
      {updateState && updateState.status && updateState.status !== 'idle' && !hideBanner && (
        <div className={`update-banner ${updateState.status}`} style={{
          background: updateState.status === 'downloaded' ? 'var(--primary-color)' : 'var(--bg-secondary)',
          color: updateState.status === 'downloaded' ? 'var(--bg-color)' : 'var(--text-color)',
          padding: '0.8rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.9rem',
          gap: '1rem',
          zIndex: 10000,
          position: 'relative',
          transition: 'all 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            {updateState.status === 'downloading' ? (
              <RefreshCw size={18} className="spin" style={{ animation: 'spin 2s linear infinite', flexShrink: 0 }} />
            ) : updateState.status === 'downloaded' ? (
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
            ) : (
              <Download size={18} style={{ flexShrink: 0 }} />
            )}
            
            {updateState.status === 'checking' && <span>Güncellemeler kontrol ediliyor...</span>}
            {updateState.status === 'available' && <span>Yeni güncelleme mevcut. İndirme başlatılıyor...</span>}
            {updateState.status === 'downloading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minWidth: 0 }}>
                <span style={{ whiteSpace: 'nowrap' }}>Yeni sürüm indiriliyor: %{Math.round(updateState.progress || 0)}</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', maxWidth: '300px' }}>
                  <div style={{ width: `${updateState.progress || 0}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                </div>
              </div>
            )}
            {updateState.status === 'downloaded' && (
              <span style={{ fontWeight: 'bold' }}>Gündemim v{updateState.version} hazır!</span>
            )}
            {updateState.status === 'error' && (
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Güncelleme hatası: {updateState.error}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexShrink: 0 }}>
            {updateState.status === 'downloaded' && (
              <button 
                onClick={() => {
                  if (window.electronAPI?.quitAndInstall) {
                    window.electronAPI.quitAndInstall();
                  }
                }}
                style={{
                  background: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                Kur ve Yeniden Başlat
              </button>
            )}
            <button 
              onClick={() => setHideBanner(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.7
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 1}
              onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
              title="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Premium PC Bildirim Paneli */}
      {pcNotification && (
        <div className="pc-notification-container">
          <div className={`pc-notification ${pcNotification.type || ''}`}>
            <div className="pc-notification-icon">
              <AlertTriangle size={20} />
            </div>
            <div className="pc-notification-content">
              <div className="pc-notification-title">{pcNotification.title}</div>
              <div className="pc-notification-message">
                {pcNotification.message}
                <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.8 }}>{pcNotification.detail}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSetupOpen && (
        <FirstLaunchSetup onComplete={() => {
          setIsSetupOpen(false);
          localStorage.setItem('gundemim_mlkit_setup_done', 'true');
          
          // Kurulum bittikten sonra rehberi göster
          const hasSeenOnboarding = localStorage.getItem('gundemim_first_start');
          if (!hasSeenOnboarding) {
            setIsHowToUseOpen(true);
            localStorage.setItem('gundemim_first_start', 'done');
          }
        }} />
      )}

      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="app-body">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </main>
      </div>
      <HowToUseDrawer isOpen={isHowToUseOpen} onClose={() => setIsHowToUseOpen(false)} />
    </div>
  );
}

export default App;
