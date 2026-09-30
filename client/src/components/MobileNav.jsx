import { NAV_ITEMS } from '../hooks/useHashRoute.js';
import Icon from './Icon.jsx';

const SHORT_LABELS = {
  '/dashboard': 'Aperçu',
  '/taches': 'Tâches',
  '/projets': 'Projets',
  '/calendrier': 'Agenda',
  '/priorites': 'Prio',
  '/statistiques': 'Stats',
};

export default function MobileNav({ route }) {
  const isActive = (to) =>
    route === to || (to === '/dashboard' && (route === '/' || route === '/dashboard'));

  return (
    <nav className="bottom-nav" aria-label="Navigation mobile">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.to}
            href={`#${item.to}`}
            className={`bottom-link${isActive(item.to) ? ' is-active' : ''}`}
            aria-current={isActive(item.to) ? 'page' : undefined}
          >
            <Icon name={item.icon} size={21} />
            {SHORT_LABELS[item.to] ?? item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
