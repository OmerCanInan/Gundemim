import React from 'react';
import { Bot, Headphones, Shield, Zap, Download, Github, Globe, FileText } from 'lucide-react';
import laptopMockup from './assets/hero-laptop.png';
import radioMockup from './assets/radio-mobile.png';

function App() {
  const latestReleaseUrl = "https://github.com/OmerCanInan/Gundemim/releases/latest";

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="container glass" style={{ 
        position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
        width: '90%', borderRadius: '99px', padding: '0.8rem 2rem', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem' }}>
          <div style={{ background: 'var(--primary)', color: '#000', padding: '4px', borderRadius: '6px' }}>
            <FileText size={20} />
          </div>
          Gündemim
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <a href="#ozellikler" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Özellikler</a>
          <a href={latestReleaseUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>İndir</a>
        </div>
        <a href="https://github.com/OmerCanInan/Gundemim" target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)' }}>
          <Github size={20} />
        </a>
      </nav>

      {/* Hero Section */}
      <header className="hero container">
        <p className="hero-tagline fade-in">Yapay Zeka Destekli Haber Deneyimi</p>
        <h1 className="hero-title fade-in" style={{ animationDelay: '0.1s' }}>
          Haberin Ötesini <span>Dinleyin ve Keşfedin.</span>
        </h1>
        <p className="hero-desc fade-in" style={{ animationDelay: '0.2s' }}>
          Gündemim, karmaşık haber akışlarını yapay zeka ile özetleyen, reklamdan arındırılmış ve 
          kişisel radyo moduna sahip yeni nesil bir haber okuyucudur.
        </p>
        
        <div className="fade-in" style={{ display: 'flex', gap: '1rem', animationDelay: '0.3s' }}>
          <a href={latestReleaseUrl} className="btn btn-primary">
            <Download size={18} /> Windows İçin İndir
          </a>
          <a href="#ozellikler" className="btn btn-outline">
            Daha Fazla Bilgi
          </a>
        </div>

        <div className="mockup-container fade-in" style={{ animationDelay: '0.4s' }}>
          <img src={laptopMockup} alt="Gündemim Desktop Mockup" className="mockup-img" />
        </div>
      </header>

      {/* Features Section */}
      <section id="ozellikler" className="features container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Süper Güçlerinizle Tanışın</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gündemi takip etmek hiç bu kadar zahmetsiz ve akıllıca olmamıştı.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card glass">
            <div className="feature-icon"><Bot /></div>
            <h3>AI Haber Özetleri</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              Saatlerinizi alan haber okuma maratonuna son. Gemini AI ile yüzlerce haberi saniyeler içinde analiz edin ve en önemli noktaları yakalayın.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon"><Headphones /></div>
            <h3>Sesli Radyo Modu</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              Haberleri okumayın, dinleyin. Kendi haber bülteninizi oluşturun ve yolda, sporda veya işte gündemi bir radyo spikeri tadında takip edin.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon"><Shield /></div>
            <h3>Reklamsız & Güvenli</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              İzleyici yok, reklam yok, veri toplama yok. Sadece haberlerin olduğu saf ve temiz bir okuma deneyimi sunuyoruz.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon"><Zap /></div>
            <h3>Gelişmiş Filtreleme</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              Kelime bazlı filtreler ile görmek istemediğiniz içerikleri (spam, reklam, istemediğiniz konular) anında engelleyin.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile Showcase */}
      <section className="container" style={{ padding: '100px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap-reverse' }}>
          <div style={{ flex: '1 1 400px' }}>
            <img src={radioMockup} alt="Android Radio Mode" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }} />
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Her Zaman Yanınızda.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Gündemim sadece masaüstünde değil, Android cihazlarınızda da yanınızda. Cross-platform desteği ile haberleriniz her zaman senkronize.
            </p>
            <a href={latestReleaseUrl} className="btn btn-primary">
              <Globe size={18} /> APK Olarak İndir
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container" style={{ padding: '4rem 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          © 2026 Gündemim - OmerCanInan tarafından geliştirilmiştir. <br/>
          Gizlilik Odaklı, Açık Kaynak RSS Okuyucu.
        </p>
      </footer>
    </div>
  );
}

export default App;
