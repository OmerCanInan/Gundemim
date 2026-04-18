// src/pages/Legal.jsx
import { ShieldAlert, ArrowLeft, Scale, Lock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="legal-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontSize: '1rem' }}
      >
        <ArrowLeft size={20} /> Geri Dön
      </button>

      <div className="card fade-in" style={{ padding: '2.5rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={32} color="var(--primary-color)" /> Hukuki Bilgiler & Gizlilik
        </h1>
        
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '2rem' }}>
          Gündemim uygulamasını kullanarak aşağıdaki şartları ve gizlilik politikasını kabul etmiş sayılırsınız. 
          Bu metinler, hem sizin güvenliğiniz hem de yasal süreçlerin şeffaflığı için hazırlanmıştır.
        </p>

        {/* 1. Sorumluluk Reddi */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Scale size={20} color="var(--primary-color)" /> 1. Sorumluluk Reddi (Disclaimer)
          </h2>
          <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            <p><strong>Gündemim bir içerik üreticisi değildir.</strong> Uygulama, haber sitelerinin kamuya açık sunduğu RSS (Really Simple Syndication) servislerini kullanarak içerikleri bir araya getiren teknik bir araçtır.</p>
            <ul>
              <li>Haberlerin doğruluğu, tarafsızlığı ve hukuki sorumluluğu tamamen orijinal kaynak yayıncıya aittir.</li>
              <li>"Devamını Oku" butonu ile yapılan harici bağlantılarda, gidilen sitenin içeriğinden Gündemim sorumlu tutulamaz.</li>
              <li>Telif hakkı ihlali olduğunu düşündüğünüz içerikler için lütfen doğrudan orijinal kaynakla veya bizimle iletişim kanallarımız üzerinden irtibata geçiniz.</li>
            </ul>
          </div>
        </section>

        {/* 2. Gizlilik Politikası */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Lock size={20} color="var(--success-color)" /> 2. Gizlilik Politikası (KVKK/GDPR)
          </h2>
          <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            <p>Gizliliğiniz bizim için önemlidir. Gündemim "Cihaz Üstü Öncelikli" (On-Device First) bir mimariyle çalışır:</p>
            <ul>
              <li><strong>Kişisel Veri:</strong> Uygulama; ad, soyad, rehber gibi kişisel verilere erişmez ve toplamaz.</li>
              <li><strong>Depolama:</strong> Eklediğiniz RSS linkleri ve favorileriniz sadece sizin cihazınızdaki yerel veritabanında (IndexedDB) saklanır. Hiçbir sunucuya aktarılmaz.</li>
              <li><strong>AI İşleme:</strong> "AI Özeti" özelliğini kullandığınızda, haber metni sadece özetleme amacıyla geçici olarak (ve anonim şekilde) yapay zeka sunucularına iletilir. Bu veriler eğitim amaçlı kullanılmaz.</li>
            </ul>
          </div>
        </section>

        {/* 3. Kullanım Şartları */}
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Info size={20} color="#3b82f6" /> 3. Kullanım Şartları
          </h2>
          <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            <p>Uygulamada sunulan hizmet tamamen ücretsizdir. Kullanıcı, eklediği kaynakların içeriğinden bizzat sorumludur. Uygulama, ticari olmayan kişisel kullanım için tasarlanmıştır.</p>
          </div>
        </section>

        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
          © 2024 Gündemim - Tüm hakları saklıdır. <br/>
          Son Güncelleme: 18 Nisan 2026
        </div>
      </div>
    </div>
  );
}
