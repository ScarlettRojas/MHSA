// frontend/src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Clase para resaltar el link activo
  const linkClass = ({ isActive }) =>
    [
      'px-3 py-2 rounded-md transition-colors',
      isActive
        ? 'bg-white text-sky-900 border border-sky-300 shadow-sm'
        : 'hover:text-sky-700',
    ].join(' ');

  return (
    <nav className="bg-sky-200 text-slate-900 border-b border-sky-300">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand + subtitle */}
        <Link to="/" className="block leading-tight tracking-tight">
          <span className="block font-extrabold text-3xl sm:text-4xl text-blue-900">
            BreathIn
          </span>
          <span className="block font-medium text-base sm:text-lg text-blue-800">
            Mental Health Support
          </span>
        </Link>

        {/* Right side menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
              <NavLink to="/sessions" className={linkClass}>
                Sessions
              </NavLink>
              <NavLink to="/moods" className={linkClass}>
                Moods
              </NavLink>
              <NavLink to="/resources" className={linkClass}>
                Resources
              </NavLink>
              <button
                onClick={handleLogout}
                className="ml-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
