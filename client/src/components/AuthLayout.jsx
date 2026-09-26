import Icon from './Icon.jsx';

const HIGHLIGHTS = [
  { icon: 'layers', text: 'Créez, priorisez et organisez vos tâches en un seul endroit.' },
  { icon: 'calendar', text: 'Gardez un œil sur vos échéances et repérez les retards.' },
  { icon: 'zap', text: 'Une interface rapide et claire, pensée pour le quotidien.' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <a className="brand brand-on-dark" href="#/login">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="check" size={16} />
          </span>
          <span className="brand-name">TaskFlow</span>
        </a>

        <div className="auth-aside-body">
          <h1 className="auth-aside-title">
            Vos tâches, enfin organisées.
          </h1>
          <p className="auth-aside-text">
            Centralisez vos projets, suivez vos priorités et terminez vos
            journées l’esprit tranquille.
          </p>
          <ul className="auth-aside-list">
            {HIGHLIGHTS.map((item) => (
              <li key={item.icon}>
                <span className="auth-aside-list-icon" aria-hidden="true">
                  <Icon name={item.icon} size={16} />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-aside-foot">© {new Date().getFullYear()} TaskFlow</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <header className="auth-card-header">
            <h2 className="auth-card-title">{title}</h2>
            <p className="auth-card-subtitle">{subtitle}</p>
          </header>

          {children}

          {footer ? <div className="auth-card-footer">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
