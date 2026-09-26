import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';
import { getInitials } from '../utils/task.js';
import Icon from './Icon.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a className="brand" href="#/dashboard">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="check" size={16} />
          </span>
          <span className="brand-name">TaskFlow</span>
        </a>

        <div className="navbar-actions">
          <div className="user-chip">
            <span className="avatar" aria-hidden="true">
              {getInitials(user?.name)}
            </span>
            <span className="user-chip-text">
              <strong className="user-chip-name">{user?.name}</strong>
              <span className="user-chip-email">{user?.email}</span>
            </span>
          </div>

          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            <span className="btn-label">Se déconnecter</span>
          </button>
        </div>
      </div>
    </header>
  );
}
