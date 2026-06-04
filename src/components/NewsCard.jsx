// src/components/NewsCard.jsx
// Haberin başlığını ve içeriğini gösteren, çeviri yeteneğine sahip izolasyonlu kart bileşeni.
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../context/TranslationContext';
import { translateTextToTurkish } from '../services/translationService';
import { ImageOff, ExternalLink, Globe, BookOpen, AlertTriangle } from 'lucide-react';

// Renk paleti: her tag için sabit bir renk ata (hash tabanlı)
const TAG_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.5)', text: '#a5b4fc' },   // indigo
  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7' },   // emerald
  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.4)', text: '#fcd34d' },   // amber
  { bg: 'rgba(239, 68, 68, 0.12)',  border: 'rgba(239, 68, 68, 0.4)',  text: '#fca5a5' },   // red
  { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd' },   // blue
  { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.4)', text: '#d8b4fe' },   // purple
  { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.4)', text: '#f9a8d4' },   // pink
  { bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.4)', text: '#5eead4' },   // teal
  { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.4)', text: '#fdba74' },   // orange
  { bg: 'rgba(34, 197, 94, 0.12)',  border: 'rgba(34, 197, 94, 0.4)',  text: '#86efac' },   // green
];

const getTagColor = (tag) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

export default function NewsCard({ news, onTagClick, activeTag }) {
  const { isTranslationEnabled } = useTranslation();
  
  const [translatedTitle, setTranslatedTitle] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Uygulama İçi Okuyucu (Reader Mode) State
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerContent, setReaderContent] = useState('');
  const [readerLoading, setReaderLoading] = useState(false);
  // 'text' | 'webview' | 'fallback-hint'
  const [readerMode, setReaderMode] = useState('text');
  const [readerWebviewUrl, setReaderWebviewUrl] = useState('');
  
  // Google Translate iframe URL'i oluştur
  const buildGTranslateUrl = (url) =>
    `https://translate.google.com/translate?sl=auto&tl=tr&u=${encodeURIComponent(url)}`;

  const openReader = async (e) => {
    e.preventDefault();
    setReaderOpen(true);
    setReaderLoading(true);
    setReaderContent('');
    setReaderMode('text');
    setReaderWebviewUrl('');

    // ------------------------------------------------------------------
    // 1. DENEME: HTML indir → paragraf çıkar → çevir → metin olarak göster
    // ------------------------------------------------------------------
    try {
      const html = await window.electronAPI.fetchRss(news.link, 12000);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let articleNode =
        doc.querySelector('article') ||
        doc.querySelector('main') ||
        doc.querySelector('.post-content') ||
        doc.querySelector('.article-content') ||
        doc.querySelector('.entry-content');

      const isPromotional = (node) => {
        const text = node.textContent.trim().toLowerCase();
        if (text.length < 50) return true;
        const adKeywords = [
          'live blog', 'free app', 'news podcast', 'breaking news email', 'newsletter', 'subscribe to',
          'sign up for', 'click here', 'read more:', 'read more :', 'bizi takip edin', 'abone ol',
          'uygulamamızı indir', 'whatsapp kanal', 'telegram kanal', 'bültene kayıt', 'bültene abone',
          'e-postamızı', 'ücretsiz uygulama', 'podcast', 'haberi okumak için'
        ];
        if (adKeywords.some(kw => text.includes(kw))) return true;
        const links = node.querySelectorAll('a');
        if (links.length > 0) {
          let linksLength = 0;
          links.forEach(a => linksLength += a.textContent.trim().length);
          if ((linksLength / text.length) > 0.6) return true;
        }
        return false;
      };

      let pNodes = articleNode
        ? Array.from(articleNode.querySelectorAll('p'))
        : Array.from(doc.querySelectorAll('p'));
      let paragraphs = pNodes.filter(p => !isPromotional(p)).map(p => p.textContent.trim());

      if (paragraphs.length > 0) {
        if (isTranslationEnabled && (!news.tags || !news.tags.includes('#tr'))) {
          const translationPromises = paragraphs.map(async (p) => {
            try { return (await translateTextToTurkish(p)) || p; }
            catch { return p; }
          });
          const translatedParagraphs = await Promise.all(translationPromises);
          setReaderContent(translatedParagraphs.join('\n\n'));
        } else {
          setReaderContent(paragraphs.join('\n\n'));
        }
        setReaderMode('text');
        setReaderLoading(false);
        return; // Başarılı — sonraki adımlara geçme
      }
      // Paragraf bulunamadı → 2. denemeye düş
      throw new Error('paragraph_empty');

    } catch (fetchOrParseErr) {
      console.warn('[Reader] 1. deneme başarısız, Google Translate iframe deneniyor:', fetchOrParseErr.message);
    }

    // ------------------------------------------------------------------
    // 2. DENEME: Sayfayı Google Translate iframe içinde aç → çeviri yerleşik gelir
    // ------------------------------------------------------------------
    try {
      const gtUrl = buildGTranslateUrl(news.link);
      setReaderWebviewUrl(gtUrl);
      setReaderMode('webview');
      setReaderLoading(false);
      return;
    } catch (webviewErr) {
      console.warn('[Reader] 2. deneme başarısız:', webviewErr.message);
    }

    // ------------------------------------------------------------------
    // 3. SON ÇARE: Varsayılan tarayıcıda aç (Google Translate uzantısı kullanılabilir)
    // ------------------------------------------------------------------
    setReaderMode('fallback-hint');
    setReaderLoading(false);
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(news.link);
    }
  };

  // isTranslationEnabled değiştiğinde, eğer önceden çevrilmemişse API'yi çağır:
  useEffect(() => {
    let active = true;

    const translateContent = async () => {
      // AKILLI FİLTRE: Eğer haber zaten Türkçe ise (#tr etiketi varsa) çevirme.
      const isAlreadyTurkish = news.tags?.includes('#tr');
      
      if (!isTranslationEnabled || translatedTitle || isAlreadyTurkish) return;

      setIsTranslating(true);
      try {
        const titleTr = await translateTextToTurkish(news.title);
        const descTr = await translateTextToTurkish(news.description);
        
        if (active) {
          setTranslatedTitle(titleTr);
          setTranslatedDesc(descTr);
        }
      } catch (error) {
        console.error("Kart çeviri hatası:", error);
      } finally {
        if (active) setIsTranslating(false);
      }
    };

    translateContent();

    return () => { active = false; };
  }, [isTranslationEnabled, news.title, news.description, translatedTitle]);

  // Hangi değerin gösterileceğine karar veriyoruz: Orijinal mi, Çevrilmiş mi?
  const displayTitle = isTranslationEnabled 
    ? (translatedTitle || (isTranslating ? 'Çevriliyor...' : news.title))
    : news.title;
    
  const displayDesc = isTranslationEnabled 
    ? (translatedDesc || (isTranslating ? 'Çevriliyor...' : news.description))
    : news.description;

  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(news.date);

  const getDomainName = (url) => {
    try {
      if (!url || url === '#') return '';
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };
  
  const sourceDomain = getDomainName(news.link) || news.sourceName || 'Bilinmeyen Kaynak';

  const [imageError, setImageError] = useState(false);

  return (
    <article className="news-card fade-in">
      {/* Eğer resim varsa göster, yoksa modern bir placeholder ver */}
      <div className="card-image-container">
        {news.imageUrl && !imageError ? (
          <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="card-image" 
            loading="lazy" 
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="card-no-image" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-secondary)', padding: '2rem' }}>
            <img 
              src={`https://logo.clearbit.com/${sourceDomain}`} 
              alt={`${sourceDomain} logo`}
              style={{ width: '64px', height: '64px', objectFit: 'contain', opacity: 0.9, borderRadius: '8px' }}
              onError={(e) => {
                // Clearbit'te logo yoksa, Google Favicon servisine düş
                if (e.target.src.includes('clearbit')) {
                  e.target.src = `https://s2.googleusercontent.com/s2/favicons?domain=${sourceDomain}&sz=128`;
                } else {
                  // İkisi de yoksa en son çare ikonu gizle
                  e.target.style.display = 'none';
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="card-content">

        <h3 className="card-title">{displayTitle}</h3>
        <p className="card-date">
          {formattedDate} &bull; <span className="card-source">{sourceDomain}</span>
        </p>
        <p className="card-description">{displayDesc}</p>
        
        {/* Etiketler (Tags) - Tıklanabilir */}
        {news.tags && news.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1rem' }}>
            {news.tags.map(tag => {
              const color = getTagColor(tag);
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={(e) => { e.preventDefault(); onTagClick && onTagClick(tag); }}
                  title={`"${tag}" etiketiyle filtrele`}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    color: isActive ? '#fff' : color.text,
                    background: isActive ? color.text.replace(')', ', 0.9)').replace('rgb', 'rgba') : color.bg,
                    padding: '3px 9px',
                    borderRadius: '20px',
                    border: `1px solid ${isActive ? color.text : color.border}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    transform: isActive ? 'scale(1.07)' : 'scale(1)',
                    boxShadow: isActive ? `0 0 8px ${color.border}` : 'none',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = color.text.replace(')', ', 0.15)').replace('rgb', 'rgba');
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = color.bg;
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
          <button onClick={openReader} className="read-more-button" style={{ flex: 1, marginTop: 0, cursor: 'pointer', border: 'none' }}>
            <BookOpen size={16} /> Uygulamada Oku
          </button>
          {/* Direkt Tarayıcıda Aç — Google G logosu */}
          <button
            onClick={() => window.electronAPI?.openExternal(news.link)}
            className="read-more-button"
            title="Tarayıcıda Aç"
            style={{ marginTop: 0, width: '42px', padding: 0, justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          {/* Google Translate ile Aç (Electron Yeni Pencerede) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              const translateUrl = `https://translate.google.com/translate?sl=auto&tl=tr&u=${encodeURIComponent(news.link)}`;
              if (window.electronAPI?.openInWindow) {
                window.electronAPI.openInWindow(translateUrl, news.title || 'Çeviri');
              } else {
                window.open(translateUrl, '_blank');
              }
            }}
            className="read-more-button"
            title="Google Translate ile Aç (Uygulamada)"
            style={{ marginTop: 0, width: '42px', padding: 0, justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* UYGULAMA İÇİ OKUYUCU (POP-UP MODAL) */}
      {readerOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }} onClick={() => setReaderOpen(false)}>
          <div className="fade-in" style={{
            width: readerMode === 'webview' ? '95%' : '90%',
            maxWidth: readerMode === 'webview' ? '1100px' : '800px',
            height: readerMode === 'webview' ? '90vh' : 'auto',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-color)',
            display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)'
          }} onClick={e => e.stopPropagation()}>

            {/* BAŞLIK ÇUBUĞU */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-sans)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {readerMode === 'webview'
                  ? <><Globe size={20} color="var(--primary-color)" /> Çevirili Sayfa (Google Translate)</>
                  : readerMode === 'fallback-hint'
                  ? <><AlertTriangle size={20} color="#f59e0b" /> Tarayıcıda Açıldı</>
                  : <><BookOpen size={20} color="var(--primary-color)" /> Okuyucu Modu</>
                }
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Webview modunda: orijinal sayfayı dışarıda aç */}
                {readerMode === 'webview' && (
                  <button
                    onClick={() => window.electronAPI?.openExternal?.(news.link)}
                    title="Tarayıcıda Aç"
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-light)', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={14} /> Tarayıcıda Aç
                  </button>
                )}
                <button onClick={() => setReaderOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%' }}>&times;</button>
              </div>
            </div>

            {/* İÇERİK ALANI */}
            {readerLoading ? (
              /* Yükleniyor */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-light)', padding: '5rem 2rem' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid var(--primary-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Haber içeriği indiriliyor ve temizleniyor...
              </div>

            ) : readerMode === 'text' ? (
              /* METİN MODU */
              <div style={{ padding: '2.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '850px' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: 'var(--text-color)', fontSize: '2rem', lineHeight: '1.3' }}>{news.title}</h2>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{sourceDomain}</span> • <span>{formattedDate}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.9', fontSize: '1.15rem', color: 'var(--text-color)', fontFamily: 'var(--font-serif)', opacity: 0.95, paddingBottom: '4rem' }}>
                    {readerContent}
                  </div>
                </div>
              </div>

            ) : readerMode === 'webview' ? (
              /* WEBVIEW MODU — Google Translate iframe */
              <iframe
                src={readerWebviewUrl}
                title="Google Translate"
                style={{ flex: 1, border: 'none', width: '100%' }}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />

            ) : (
              /* FALLBACK-HINT MODU — tarayıcıda açıldı bilgisi */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem 2rem', textAlign: 'center' }}>
                <AlertTriangle size={48} color="#f59e0b" />
                <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.3rem' }}>Sayfa Tarayıcınızda Açıldı</h3>
                <p style={{ margin: 0, color: 'var(--text-light)', lineHeight: '1.7', maxWidth: '400px' }}>
                  Haber içeriği otomatik olarak alınamadı. Sayfa varsayılan tarayıcınızda açıldı.
                  Google Translate uzantısı ile Türkçeye çevirebilirsiniz.
                </p>
                <button
                  onClick={() => window.electronAPI?.openExternal?.(news.link)}
                  style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.7rem 1.5rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}
                >
                  <ExternalLink size={16} /> Tekrar Aç
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </article>
  );
}
