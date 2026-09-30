import { useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getInitials } from '../utils/task.js';

export function SettingsModal({ open, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Paramètres"
      description="Votre compte et vos préférences HIMA."
      size="sm"
    >
      <div className="field">
        <span className="field-label">Compte</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          <span className="avatar" aria-hidden="true">
            {getInitials(user?.name)}
          </span>
          <span style={{ minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 14 }}>{user?.name}</strong>
            <span className="subtle" style={{ fontSize: 12.5 }}>{user?.email}</span>
          </span>
        </div>
      </div>

      <div className="field">
        <span className="field-label">Apparence</span>
        <div className="menu-theme-row" style={{ padding: '12px 14px', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={17} />
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
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-danger-outline btn-block"
          onClick={() => {
            logout();
            onClose?.();
            window.location.hash = '#/login';
          }}
        >
          <Icon name="logout" size={16} />
          Se déconnecter
        </button>
      </div>
    </Modal>
  );
}

export function HelpModal({ open, onClose }) {
  const tips = [
    { icon: 'tasks', text: 'Cochez une tâche depuis « Aujourd’hui » pour la terminer en un geste.' },
    { icon: 'flag', text: 'Triez vos priorités pour savoir par quoi commencer.' },
    { icon: 'calendar', text: 'Les points du calendrier signalent échéances et retards.' },
    { icon: 'chart', text: 'Les statistiques racontent votre rythme de la semaine.' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aide"
      description="Tirez le meilleur de HIMA au quotidien."
      size="sm"
    >
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none' }}>
        {tips.map((tip) => (
          <li key={tip.text} style={{ display: 'flex', gap: 12, fontSize: 13.5, color: 'var(--text-muted)' }}>
            <span className="auth-aside-list-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary-strong)' }} aria-hidden="true">
              <Icon name={tip.icon} size={16} />
            </span>
            {tip.text}
          </li>
        ))}
      </ul>
      <div className="form-actions" style={{ marginTop: 18 }}>
        <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
          C’est compris
        </button>
      </div>
    </Modal>
  );
}

export function useSupportModals() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const modals = (
    <>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );

  return {
    modals,
    openSettings: () => setSettingsOpen(true),
    openHelp: () => setHelpOpen(true),
  };
}
