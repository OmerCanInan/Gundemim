import { Bot, Headphones, Shield, Zap, Download, Github, Globe, FileText, Monitor, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';

function App() {
  const latestReleaseUrl = "https://github.com/OmerCanInan/Gundemim/releases/latest"; // v1.1.3 trigger

  return (
    <div className="landing">
      {/* Hero Section */}
      <header className="hero container">
        <p className="hero-tagline fade-in">TÜM HABERLER TEK NOKTADA</p>
        <h1 className="hero-title fade-in" style={{ animationDelay: '0.1s' }}>
          Gündeminizi <span>Tek Bir Yerden</span> Yönetin.
        </h1>
        <p className="hero-desc fade-in" style={{ animationDelay: '0.2s' }}>
          Onlarca farklı haber kaynağını tek bir çatı altında toplayan, kişiselleştirilebilir, 
          tamamen reklamsız ve modern bir haber okuma platformu.
        </p>
        
        <div className="fade-in" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem', 
          width: '100%', 
          maxWidth: '900px',
          marginTop: '4rem',
          animationDelay: '0.3s' 
        }}>
          {/* Windows Download Card */}
          <div className="download-card glass">
            <div className="card-platform">
              <Monitor size={32} />
              <div>
                <h4>Windows Sürümü</h4>
                <p>Masaüstü için taşınabilir (Portable) .exe</p>
              </div>
            </div>
            <a href={latestReleaseUrl} className="btn btn-primary w-full">
              <Download size={18} /> .EXE İndir
            </a>
          </div>

          {/* Android Download Card */}
          <div className="download-card glass">
            <div className="card-platform">
              <Smartphone size={32} />
              <div>
                <h4>Android Sürümü</h4>
                <p>Mobil için yüklenebilir .apk dosyası</p>
              </div>
            </div>
            <a href={latestReleaseUrl} className="btn btn-outline w-full" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
              <Globe size={18} /> .APK İndir
            </a>
          </div>
        </div>

        {/* Lisans ve Güvenlik Bilgilendirmesi */}
        <div className="fade-in" style={{ 
          marginTop: '2rem',
          padding: '1.5rem',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          maxWidth: '900px',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          gap: '1rem',
          animationDelay: '0.4s'
        }}>
          <div style={{ color: '#f59e0b', marginTop: '3px' }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
            <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.5rem', fontSize: '1rem' }}>
              Kurulum Hakkında Önemli Not
            </strong>
            Gündemim, bağımsız bir açık kaynak projesidir. Yüksek yıllık sertifikalandırma maliyetleri (lisans ücretleri) nedeniyle uygulama şu an için dijital olarak imzalanmamıştır. 
            Bu sebeple kurulum sırasında Windows (SmartScreen) veya Android tarafından <strong>"Bilinmeyen Yayıncı"</strong> uyarıları alabilirsiniz. 
            Bu uyarılar uygulamanın güvenliği ile ilgili değil, sadece lisans kaydı maliyetleri ile ilgilidir. Uygulamayı gönül rahatlığıyla "Yine de Çalıştır/Yükle" diyerek kurabilirsiniz.
          </div>
        </div>

        <div className="trust-badges fade-in" style={{ animationDelay: '0.5s', marginTop: '3rem' }}>
          <div className="trust-badge">
            <CheckCircle size={14} /> Açık Kaynak
          </div>
          <div className="trust-badge">
            <Shield size={14} /> %100 Güvenli
          </div>
          <div className="trust-badge">
            <Bot size={14} /> AI Destekli
          </div>
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
              Saatlerinizi alan haber okuma maratonuna son. Groq AI ile yüzlerce haberi saniyeler içinde analiz edin ve en önemli noktaları yakalayın.
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
