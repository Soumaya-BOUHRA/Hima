import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { BrandSymbol } from './Brand.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNavigate, routeTitle } from '../hooks/useHashRoute.js';
import { getInitials } from '../utils/task.js';
import { SettingsModal, HelpModal } from './SupportModals.jsx';

export default function Topbar({ route, overdueCount = 0 }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="topbar-title">
          <BrandSymbol size={26} className="mobile-brand-only" />
          {routeTitle(route) || 'HIMA'}
        </span>

        <div className="topbar-right">
          <button
            type="button"
            className="icon-btn notif-btn"
            aria-label={overdueCount > 0 ? `${overdueCount} tâches en retard — voir mes tâches` : 'Notifications — aucune tâche en retard'}
            onClick={() => navigate('/taches')}
          >
            <Icon name="bell" size={19} />
            {overdueCount > 0 ? <span className="notif-dot">{overdueCount}</span> : null}
          </button>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="user-chip"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Menu du profil"
            >
              <span className="avatar" aria-hidden="true">
                {getInitials(user?.name)}
              </span>
              <span className="user-chip-text">
                <strong className="user-chip-name">{user?.name}</strong>
                <span className="user-chip-email">{user?.email}</span>
              </span>
              <Icon name="chevronDown" size={15} className="subtle" />
            </button>

            {menuOpen ? (
              <div className="menu-pop" role="menu">
                <div className="menu-pop-header">
                  <strong style={{ display: 'block', fontSize: 14 }}>{user?.name}</strong>
                  <span className="subtle" style={{ fontSize: 12.5 }}>{user?.email}</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                >
                  <Icon name="settings" size={16} />
                  Paramètres
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setHelpOpen(true);
                  }}
                >
                  <Icon name="help" size={16} />
                  Aide
                </button>
                <div className="menu-theme-row">
                  <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={16} />
                  Mode sombre
                  <button
                    type="button"
                    role="switch"
                    aria-checked={theme === 'dark'}
                    aria-label="Activer le mode sombre"
                    className="theme-switch"
                    onClick={toggleTheme}
                  >
                    <span className="theme-knob">
                      <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={12} />
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="menu-item is-danger"
                  onClick={handleLogout}
                >
                  <Icon name="logout" size={16} />
                  Se déconnecter
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}
