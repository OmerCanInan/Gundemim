// src/components/Navbar.jsx
// Üst bar. Uygulama adı ve çeviri butonu.
import { useTranslation } from '../context/TranslationContext';
import { Newspaper, Languages, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ toggleSidebar }) {
  const { isTranslationEnabled, toggleTranslation } = useTranslation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="mobile-menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <Link to="/" className="navbar-logo" style={{ gap: '0.5rem' }}>
            <div className="logo-icon">
              <Newspaper size={24} color="var(--success-color)" />
            </div>
            <h1>Gündemim</h1>
          </Link>
        </div>
        
        <div className="navbar-actions">

          <button 
            className={`toggle-button ${isTranslationEnabled ? 'active' : ''}`}
            onClick={toggleTranslation}
            aria-pressed={isTranslationEnabled}
          >
            <Languages size={18} />
            <span>Çeviri: {isTranslationEnabled ? 'AÇIK' : 'KAPALI'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
