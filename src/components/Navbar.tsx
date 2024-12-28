import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/restaurants', label: 'Restaurants', icon: '🏪' },
    { path: '/unconfirmed', label: 'Unconfirmed', icon: '⏳' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="tab-container main-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`tab-button ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {user && (
          <button onClick={handleLogout} className="logout-button">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;