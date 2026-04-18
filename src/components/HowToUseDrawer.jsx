import { X, Rss, Key, HelpCircle, Info, ExternalLink, MousePointerClick, CheckCircle, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowToUseDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        zIndex: 10001, display: 'flex', justifyContent: 'flex-end'
      }}
    >
      <div className="fade-in" style={{
        background: 'var(--bg-secondary)', width: '450px', height: '100vh',
        padding: '2rem', borderLeft: '1px solid var(--border-color)', 
        boxShadow: '-10px 0 40px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out forwards',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <HelpCircle size={24} color="var(--primary-color)" /> Nasıl Kullanılır?
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', color: 'var(--text-light)', border: 'none', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px', borderRadius: '50%'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* [NEW] Quick Start / Discover CTA - REVISED V8 */}
        <div 
          onClick={() => {
            onClose();
            navigate('/discover');
          }}
          style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--success-color)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '2.5rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'all 0.2s ease',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="var(--success-color)" />
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--success-color)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>HIZLI BAŞLANGIÇ</span>
            </div>
            <div style={{ background: 'var(--success-color)', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold' }}>
              ÖNERİLEN
            </div>
          </div>
          
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: '700' }}>Hazır Paketleri Keşfet</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
              Hiçbir ayarla uğraşmadan 50+ popüler haberi tek tıkla listenize ekleyin.
            </p>
          </div>

          <div style={{ 
            marginTop: '4px', 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '10px', 
            background: 'var(--success-color)', 
            color: '#fff', 
            textAlign: 'center', 
            fontWeight: '700', 
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            Şimdi Keşfet'e Git <Compass size={16} />
          </div>
        </div>
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Rss size={18} color="#f97316" /> RSS Linklerini Bulma
          </h3>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.7' }}>
            <li>Favori haber sitenizin en altına inin, genelde <strong>RSS</strong> ikonu bulunur.</li>
            <li>Google'da <strong>"Site Adı + RSS"</strong> şeklinde arama yapın.</li>
            <li>Popüler sitelerin (örn: <i>DonanımHaber, ShiftDelete</i>) ana sayfalarında genellikle RSS servisleri açıktır.</li>
            <li>Tarayıcı eklentileri (RSS Finder vb.) kullanarak linkleri saniyeler içinde yakalayabilirsiniz.</li>
          </ul>
        </section>

        {/* Section 2: API Key Alma (Simplified) */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Key size={18} color="var(--primary-color)" /> AI Anahtarı Almak
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--primary-color)', color: 'var(--bg-color)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Groq Cloud</strong> sayfasına gidin (Link altta).</p>
            </div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--primary-color)', color: 'var(--bg-color)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Create API Key</strong> butonuna basın ve bir isim verin.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--primary-color)', color: 'var(--bg-color)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Kodu kopyalayın ve <strong>Ayarlar &rarr; AI Anahtarı</strong> kısmına yapıştırın.</p>
            </div>
          </div>
          <a 
            href="https://console.groq.com/keys" 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', 
              background: 'var(--bg-color)', border: '1px solid var(--border-color)',
              color: 'var(--text-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600'
            }}
          >
            <ExternalLink size={16} /> Groq Console'a Git
          </a>
        </section>

        {/* Section 3: Genel İpuçları */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Info size={18} color="#3b82f6" /> Önemli Bilgiler
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
             <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <CheckCircle size={16} color="var(--success-color)" />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Haberleri klasörleyerek daha düzenli takip edebilirsiniz.</p>
             </div>
             <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <CheckCircle size={16} color="var(--success-color)" />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>AI özeti binlerce haberi saniyeler içinde sizin için süzer.</p>
             </div>
             <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <CheckCircle size={16} color="var(--success-color)" />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Radyo özelliği ile yoldayken haberleri dinleyebilirsiniz.</p>
             </div>
          </div>
        </section>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center', opacity: 0.6 }}>
          Gündemim RSS Reader v1.0 • İyi okumalar!
        </div>
      </div>
    </div>
  );
}
