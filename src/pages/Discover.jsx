import React from 'react';
import { PlusCircle, CheckCircle, Globe, AlertCircle, Package, Download, Folder, Search } from 'lucide-react';
import { getRssLinks, addRssLink } from '../services/dbService';
import { useState, useEffect } from 'react';

// Sabit keşfet listemiz - Buraya istenildiği kadar site eklenebilir.
const DISCOVER_FEEDS = [
  { folder: "Teknoloji", feeds: [
    { name: "DonanımHaber", url: "https://www.donanimhaber.com/rss/tum" },
    { name: "Webtekno", url: "https://www.webtekno.com/rss.xml" },
    { name: "ShiftDelete", url: "https://shiftdelete.net/feed" },
    { name: "LOG Dergisi", url: "https://www.log.com.tr/feed/" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" }
  ]},
  { folder: "Ekonomi", feeds: [
    { name: "Bloomberg HT", url: "https://www.bloomberght.com/rss" },
    { name: "Borsagündem", url: "https://www.borsagundem.com.tr/rss" },
    { name: "Ekonomim", url: "https://www.ekonomim.com/rss" },
    { name: "CNBC International", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?profile=12000000&id=10000664" },
    { name: "Financial Times", url: "https://www.ft.com/?format=rss" }
  ]},
  { folder: "Haber & Gündem", feeds: [
    { name: "TRT Haber", url: "https://www.trthaber.com/sondakika_ilan.rss" },
    { name: "NTV", url: "https://www.ntv.com.tr/son-dakika.rss" },
    { name: "Hürriyet", url: "https://www.hurriyet.com.tr/rss/anasayfa" },
    { name: "Habertürk", url: "https://www.haberturk.com/rss" },
    { name: "Sözcü", url: "https://www.sozcu.com.tr/rss" },
    { name: "BBC Türkçe", url: "https://feeds.bbci.co.uk/turkce/rss.xml" },
    { name: "New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" }
  ]},
  { folder: "Spor", feeds: [
    { name: "Beinsports", url: "https://www.beinsports.com.tr/rss/haber" },
    { name: "NTV Spor", url: "https://www.ntvspor.net/rss" },
    { name: "Fotomaç", url: "https://www.fotomac.com.tr/rss/tum" },
    { name: "Sporx", url: "https://www.sporx.com/rss/" },
    { name: "Fanatik", url: "https://www.fanatik.com.tr/rss" }
  ]},
  { folder: "Oyun & Kültür", feeds: [
    { name: "Kayıp Rıhtım", url: "https://kayiprihtim.com/feed/" },
    { name: "IGN Türkiye", url: "https://tr.ign.com/feed.xml" },
    { name: "Polygon", url: "https://www.polygon.com/rss/index.xml" },
    { name: "Eurogamer", url: "https://www.eurogamer.net/rss" }
  ]},
  { folder: "Bilim & Uzay", feeds: [
    { name: "NASA Haberleri", url: "https://www.nasa.gov/feed/" },
    { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml" },
    { name: "Space.com", url: "https://www.space.com/feeds/all" },
    { name: "National Geographic", url: "https://www.nationalgeographic.com/rss/index.xml" }
  ]},
  { folder: "Otomobil", feeds: [
    { name: "DonanımHaber Otomobil", url: "https://www.donanimhaber.com/rss/otomobil" },
    { name: "Log Otomobil", url: "https://www.log.com.tr/kategori/otomobil/feed/" },
    { name: "Motor1 Türkiye", url: "https://tr.motor1.com/rss/all/all/" },
    { name: "Top Gear", url: "https://www.topgear.com/rss/news" }
  ]},
  { folder: "Yaşam & Sağlık", feeds: [
    { name: "BBC News - Health", url: "https://feeds.bbci.co.uk/news/health/rss.xml" },
    { name: "Men's Health", url: "https://www.menshealth.com/rss/all.xml" },
    { name: "Psychology Today", url: "https://www.psychologytoday.com/intl/taxonomy/term/1053/feed" }
  ]}
];

// HAZIR PAKETLER - Tek tıkla tüm kaynakları yükler
const READY_PACKAGES = [
  {
    name: "Türkiye Haber Siteleri",
    emoji: "🇹🇷",
    description: "Türkiye merkezli büyük haber kaynakları",
    color: "#e11d48",
    folder: "Türkiye Haber Siteleri",
    feeds: [
      "https://www.trthaber.com/sondakika_ilan.rss",
      "https://www.ntv.com.tr/son-dakika.rss",
      "https://www.hurriyet.com.tr/rss/anasayfa",
      "https://www.haberturk.com/rss",
      "https://www.sozcu.com.tr/rss",
      "https://feeds.bbci.co.uk/turkce/rss.xml"
    ]
  },
  {
    name: "Teknoloji Paketi",
    emoji: "💻",
    description: "Yazılım, donanım ve yeni ürünler",
    color: "#6366f1",
    folder: "Teknoloji",
    feeds: [
      "https://www.donanimhaber.com/rss/tum",
      "https://www.webtekno.com/rss.xml",
      "https://shiftdelete.net/feed",
      "https://www.log.com.tr/feed/",
      "https://www.theverge.com/rss/index.xml",
      "https://techcrunch.com/feed/"
    ]
  },
  {
    name: "Dünya Gündemi",
    emoji: "🌍",
    description: "Uluslararası haber ajansları",
    color: "#0ea5e9",
    folder: "Dünya",
    feeds: [
      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
      "https://www.aljazeera.com/xml/rss/all.xml",
      "https://feeds.bbci.co.uk/turkce/rss.xml",
      "https://www.wired.com/feed/rss"
    ]
  },
  {
    name: "Ekonomi & Finans",
    emoji: "📈",
    description: "Borsa, döviz ve piyasa haberleri",
    color: "#10b981",
    folder: "Ekonomi",
    feeds: [
      "https://www.bloomberght.com/rss",
      "https://www.borsagundem.com.tr/rss",
      "https://www.ekonomim.com/rss",
      "https://search.cnbc.com/rs/search/combinedcms/view.xml?profile=12000000&id=10000664"
    ]
  },
  {
    name: "Spor Merkezi",
    emoji: "⚽",
    description: "Süper Lig, Avrupa ve transfer haberleri",
    color: "#f59e0b",
    folder: "Spor",
    feeds: [
      "https://www.beinsports.com.tr/rss/haber",
      "https://www.ntvspor.net/rss",
      "https://www.fotomac.com.tr/rss/tum",
      "https://www.sporx.com/rss/",
      "https://www.fanatik.com.tr/rss"
    ]
  }
];

export default function Discover() {
  const [activeLinks, setActiveLinks] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null); // Modal açık/kapalı/veri
  const [folderInput, setFolderInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  
  useEffect(() => {
    setActiveLinks(getRssLinks().map(link => link.url));
  }, []);

  // Mevcut klasörleri getir (Alfabetik sıralı ve eşsiz)
  const getExistingFolders = () => {
    const links = getRssLinks();
    const folders = links.map(link => link.folder || 'Genel');
    return Array.from(new Set(folders)).sort();
  };

  const openFolderModal = (feed, categoryFolder) => {
    setSelectedFeed(feed);
    setFolderInput(categoryFolder);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleQuickAdd = (folderName) => {
    if (!selectedFeed) return;
    const success = addRssLink(selectedFeed.url, folderName);
    if (success) {
      if (!activeLinks.includes(selectedFeed.url)) {
        setActiveLinks([...activeLinks, selectedFeed.url]);
      }
      window.dispatchEvent(new Event('rss_db_updated'));
      showToast(`Haber kaynağı "${folderName}" klasörüne eklendi!`, 'success');
    } else {
      showToast(`Bu kaynak zaten "${folderName}" klasöründe mevcut.`, 'error');
    }
    setSelectedFeed(null);
  };

  const confirmAdd = (e) => {
    e.preventDefault();
    if (!selectedFeed) return;
    
    // Klasör ismi en az 1 karakterli olsun, yoksa varsayılan 'Genel' atanır
    const safeFolder = folderInput.trim() || 'Genel';
    const success = addRssLink(selectedFeed.url, safeFolder);
    
    if (success) {
      if (!activeLinks.includes(selectedFeed.url)) {
        setActiveLinks([...activeLinks, selectedFeed.url]);
      }
      window.dispatchEvent(new Event('rss_db_updated'));
      showToast(`Haber kaynağı "${safeFolder}" klasörüne eklendi!`, 'success');
    } else {
      showToast(`Bu kaynak zaten "${safeFolder}" klasöründe mevcut.`, 'error');
    }
    setSelectedFeed(null);
  };

  const handleInstallPackage = (pkg) => {
    let addedCount = 0;
    pkg.feeds.forEach(feedUrl => {
      const result = addRssLink(feedUrl, pkg.folder);
      if (result) addedCount++;
    });
    
    setActiveLinks(getRssLinks().map(link => link.url));
    window.dispatchEvent(new Event('rss_db_updated'));
    
    if (addedCount > 0) {
      showToast(`"${pkg.name}" paketi yüklendi! (${addedCount} yeni kaynak eklendi)`, 'success');
    } else {
      showToast(`"${pkg.name}" paketindeki tüm kaynaklar zaten ekli.`, 'error');
    }
  };

  const getPackageStatus = (pkg) => {
    const addedFeeds = pkg.feeds.filter(url => activeLinks.includes(url));
    if (addedFeeds.length === pkg.feeds.length) return 'installed';
    if (addedFeeds.length > 0) return 'partial';
    return 'available';
  };

  const getDomainFromUrl = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'google.com';
    }
  };

  return (
    <>
      <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      <div className="feed-header" style={{ marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={28} color="var(--primary-color)" /> Keşfet
        </h2>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
          Hazır paketlerle anında başlayın veya kaynakları tek tek seçin.
        </p>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)',
          padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)', transition: 'all 0.2s'
        }}>
          <Search size={22} color="var(--text-light)" />
          <input 
            type="text"
            placeholder="Kanal adı veya URL ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-color)', fontSize: '1.05rem'
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* HAZIR PAKETLER */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={20} /> Hazır Paketler
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {READY_PACKAGES.map((pkg, idx) => {
            const status = getPackageStatus(pkg);
            return (
              <div key={idx} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem',
                transition: 'all 0.2s', borderTop: `3px solid ${pkg.color}`,
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem' }}>{pkg.emoji}</div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>{pkg.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
                  {pkg.description} • {pkg.feeds.length} kaynak
                </p>
                <button
                  onClick={() => handleInstallPackage(pkg)}
                  disabled={status === 'installed'}
                  style={{
                    marginTop: 'auto', padding: '0.7rem', borderRadius: '8px', border: 'none',
                    cursor: status === 'installed' ? 'default' : 'pointer', fontWeight: '600', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s',
                    background: status === 'installed' ? 'var(--bg-hover)' : pkg.color,
                    color: status === 'installed' ? 'var(--text-light)' : '#fff',
                    opacity: status === 'installed' ? 0.7 : 1
                  }}
                >
                  {status === 'installed' ? <><CheckCircle size={16} /> Yüklü</> : 
                   status === 'partial' ? <><Download size={16} /> Eksikleri Tamamla</> :
                   <><Download size={16} /> Paketi Yükle</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {DISCOVER_FEEDS.map((category) => ({
          ...category,
          feeds: category.feeds.filter(f => 
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            f.url.toLowerCase().includes(searchTerm.toLowerCase())
          )
        })).filter(cat => cat.feeds.length > 0).map((category, catIdx) => (
          <div key={catIdx}>
            <h3 style={{ 
              fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1.2rem', 
              paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' 
            }}>
              {category.folder}
            </h3>
            
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' 
            }}>
              {category.feeds.map((feed, idx) => {
                const isAdded = activeLinks.includes(feed.url);
                const domain = getDomainFromUrl(feed.url);

                return (
                  <div key={idx} style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    padding: '1.2rem', borderRadius: '12px', display: 'flex', gap: '1rem',
                    alignItems: 'center', transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {/* Logo Alanı */}
                    <img 
                      src={`https://logo.clearbit.com/${domain}`}
                      alt={feed.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', background: 'var(--bg-color)', padding: '5px' }}
                      onError={(e) => {
                        if (e.target.src.includes('clearbit')) {
                          e.target.src = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                    
                    {/* Bilgi Alanı */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-color)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {feed.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {domain}
                      </p>
                    </div>

                    {/* Ekle / Sil Butonu */}
                    <button
                      onClick={() => openFolderModal(feed, category.folder)}
                      style={{
                        background: 'var(--primary-color)',
                        color: 'var(--bg-color)',
                        border: 'none',
                        padding: '8px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                      }}
                      title="Kütüphaneye Ekle"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* KLASÖR SEÇİM MODALI */}
      {selectedFeed && (
        <div 
          onClick={(e) => { if(e.target === e.currentTarget) setSelectedFeed(null) }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
        >
          <div className="fade-in" style={{
            background: 'var(--bg-secondary)', width: '380px', borderRadius: '12px',
            padding: '2rem', border: '1px solid var(--border-color)', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)', fontSize: '1.2rem' }}>Klasör Belirle</h3>
             <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-light)', fontSize: '0.85rem' }}>
               <strong>{selectedFeed.name}</strong> kaynağını hangi klasöre kaydetmek istiyorsunuz?
             </p>

            {/* MEVCUT KLASÖRLER LİSTESİ */}
            {getExistingFolders().length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Kayıtlı Klasörlerin
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {getExistingFolders().map(fname => (
                    <button 
                      key={fname}
                      type="button"
                      onClick={() => handleQuickAdd(fname)}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', background: 'var(--bg-color)',
                        border: '1px solid var(--border-color)', color: 'var(--text-color)',
                        fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-color)'; }}
                    >
                      <Folder size={12} /> {fname}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={confirmAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>Klasör Adı</label>
                <input required autoFocus
                  type="text" 
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px',
                    background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                    color: 'var(--text-color)', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedFeed(null)} 
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent',
                    color: 'var(--text-light)', border: '1px solid var(--border-color)', cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--primary-color)',
                    color: 'var(--bg-color)', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST BILDIRIM ALANI */}
      {toast && (
        <div className="fade-in" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: toast.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 10000,
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.95rem'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}
    </>
  );
}
