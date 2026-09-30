import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

const HIGHLIGHTS = [
  { icon: 'tasks', text: 'Créez, priorisez et organisez vos tâches en un seul endroit.' },
  { icon: 'calendar', text: "Gardez un œil sur vos échéances et repérez les retards." },
  { icon: 'trendingUp', text: 'Suivez votre progression, chaque jour, pas à pas.' },
];

function MomentumVisual() {
  return (
    <div className="momentum-path" aria-hidden="true">
      <svg viewBox="0 0 340 96">
        <defs>
          <linearGradient id="momentumStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ffd7ef" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#67CECB" />
          </linearGradient>
        </defs>
        <path
          d="M14 74 C 90 74, 110 30, 170 34 S 260 78, 326 30"
          fill="none"
          stroke="url(#momentumStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 8"
        />
        <circle cx="14" cy="74" r="7" fill="rgba(255,255,255,0.25)" />
        <circle cx="14" cy="74" r="3.2" fill="#fff" />
        <circle cx="170" cy="34" r="7" fill="rgba(255,255,255,0.25)" />
        <circle cx="170" cy="34" r="3.2" fill="#fff" />
        <circle cx="326" cy="30" r="9" fill="#67CECB" />
        <path d="M322.5 30l2.6 2.6 4.4-5" stroke="#123" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="momentum-steps">
        <span>Tâche</span>
        <span>Progrès</span>
        <span>Objectif</span>
      </div>
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <motion.aside
        className="auth-aside"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <a href="#/login" aria-label="HIMA — accueil">
          <img
            src="/brand/hima-logo-dark.svg"
            alt="HIMA — هِمّة"
            className="auth-logo"
            draggable={false}
          />
        </a>

        <div className="auth-aside-body">
          <span className="auth-aside-kicker">
            <Icon name="sparkles" size={14} />
            HIMA · <span className="arabic" lang="ar" dir="rtl">هِمّة</span>
          </span>
          <h1 className="auth-aside-title">
            Chaque tâche vous rapproche de votre objectif.
          </h1>
          <p className="auth-aside-text">
            Organisez vos tâches, définissez vos priorités et gardez votre
            élan, jour après jour.
          </p>

          <MomentumVisual />

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

        <p className="auth-aside-foot">
          © {new Date().getFullYear()} HIMA —{' '}
          <span className="arabic" lang="ar" dir="rtl">هِمّة</span>
        </p>
      </motion.aside>

      <main className="auth-main">
        <Background_Ambient />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
        >
          <header className="auth-card-header">
            <h2 className="auth-card-title">{title}</h2>
            <p className="auth-card-subtitle">{subtitle}</p>
          </header>

          {children}

          {footer ? <div className="auth-card-footer">{footer}</div> : null}
        </motion.div>
      </main>
    </div>
  );
}

function Background_Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
    </div>
  );
}
