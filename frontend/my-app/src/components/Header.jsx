import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/components/_header.scss';
import { useState, useEffect } from 'react';
import { logout } from '../api';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const menuItems = [
  
  { label: 'Ваш Счет', path: '/account' },
  { label: 'Кредит', path: '/loan' },
  { label: 'Новости', path: '/news' },
];

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    console.log('Header получил данные пользователя:', user);
    console.log('Роль пользователя в Header:', user?.role);
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <header className="custom-header">
      <div className="header__logo">
        <Link to="/" className="header__logo">
          <span className="logo-text">Shah Bank</span>
        </Link>
      </div>
      <nav className="header__menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`header__menu-link${location.pathname === item.path ? ' active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header__actions">
        {user ? (
          <>
            <span className="header__username">{user.username}</span>
            {user.isAdmin && (
              <Button
                color="inherit"
                startIcon={<AdminPanelSettingsIcon />}
                onClick={handleAdminPanel}
              >
                Admin Panel
              </Button>
            )}
            <button className="header__btn header__btn--logout" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          <button className="header__btn header__btn--login" onClick={() => navigate('/login')}>
            Войти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;