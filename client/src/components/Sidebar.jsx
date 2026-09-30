import Brand from './Brand.jsx';
import Icon from './Icon.jsx';
import { NAV_ITEMS } from '../hooks/useHashRoute.js';
import { useSupportModals } from './SupportModals.jsx';

export default function Sidebar({ route, overdueCount = 0 }) {
  const { modals, openSettings, openHelp } = useSupportModals();
  const isActive = (to) =>
    route === to || (to === '/dashboard' && (route === '/' || route === '/dashboard'));

  return (
    <aside className="sidebar" aria-label="Navigation principale">
      <Brand href="#/dashboard" height={42} />

      <p className="sidebar-section">Principal</p>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.to}
            href={`#${item.to}`}
            className={`sidebar-link${isActive(item.to) ? ' is-active' : ''}`}
            aria-current={isActive(item.to) ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              <Icon name={item.icon} size={18} />
            </span>
            {item.label}
            {item.to === '/taches' && overdueCount > 0 ? (
              <span className="sidebar-badge" aria-label={`${overdueCount} tâches en retard`}>
                {overdueCount}
              </span>
            ) : null}
          </a>
        ))}
      </nav>

      <div className="sidebar-foot">
        <p className="sidebar-section">Compte</p>
        <button type="button" className="sidebar-link" onClick={openSettings} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'start', font: 'inherit' }}>
          <span className="nav-icon" aria-hidden="true">
            <Icon name="settings" size={18} />
          </span>
          Paramètres
        </button>
        <button type="button" className="sidebar-link" onClick={openHelp} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'start', font: 'inherit' }}>
          <span className="nav-icon" aria-hidden="true">
            <Icon name="help" size={18} />
          </span>
          Aide
        </button>
      </div>

      {modals}
    </aside>
  );
}
