import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider,
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  Article as NewsIcon,
  People as SpecialistsIcon,
  Person as AccountIcon,
  Chat as ChatIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';
import '../styles/components/_sidebar.scss';

const menuItems = [
  { label: 'Главная', path: '/', icon: <HomeIcon /> },
  { label: 'Новости', path: '/news', icon: <NewsIcon /> },
  { label: 'Специалисты', path: '/specialists', icon: <SpecialistsIcon /> },
];

const protectedMenuItems = [
  { label: 'Личный кабинет', path: '/account', icon: <AccountIcon /> },
  { label: 'Чат', path: '/chat', icon: <ChatIcon /> },
];

const Sidebar = ({ user, onLogout, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile, setCollapsed]);

  const handleLogout = async () => {
    try {
      await onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <>
      <Drawer
        variant="permanent"
        className={`sidebar ${collapsed ? 'collapsed' : ''}`}
        sx={{
          width: collapsed ? 64 : 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? 64 : 240,
            boxSizing: 'border-box',
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '16px',
          minHeight: '64px'
        }}>
          {!collapsed && (
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              onClick={() => handleNavigation('/')}
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: 'pointer'
              }}
            >
              Law.AI
            </Typography>
          )}
          <IconButton 
            onClick={toggleSidebar}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
              }
            }}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <Divider />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '30',
                  },
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 0,
                mr: collapsed ? 'auto' : 3,
                justifyContent: 'center',
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItem>
          ))}
        </List>

        {user && (
          <>
            <Divider />
            <List>
              {protectedMenuItems.map((item) => (
                <ListItem
                  button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light + '20',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '30',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: collapsed ? 'auto' : 3,
                    justifyContent: 'center',
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Box sx={{ mt: 'auto', p: 2 }}>
          {user ? (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleLogout}
              startIcon={!collapsed && <LogoutIcon />}
              sx={{ 
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&:hover': {
                  backgroundColor: theme.palette.error.light + '20'
                }
              }}
            >
              {!collapsed && 'Выйти'}
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleNavigation('/login')}
                startIcon={!collapsed && <LoginIcon />}
                sx={{ 
                  mb: 1, 
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark
                  }
                }}
              >
                {!collapsed && 'Войти'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNavigation('/register')}
                startIcon={!collapsed && <RegisterIcon />}
                sx={{ 
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '10'
                  }
                }}
              >
                {!collapsed && 'Регистрация'}
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {collapsed && (
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            borderRadius: '0 4px 4px 0',
            padding: '8px',
            zIndex: 999,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
    </>
  );
};

export default Sidebar; 