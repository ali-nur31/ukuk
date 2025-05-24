import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Account from './pages/Account';
import Specialists from './pages/Specialists';
import Chat from './pages/Chat';
import News from './pages/News.jsx';
import NewsDetail from './pages/NewsDetail';
import ProtectedRoute from './components/ProtectedRoute';
import { getCurrentUser } from './api';
import './styles/main.scss';
import { Box, CircularProgress } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#2ecc71',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="layout">
        <Sidebar 
          user={user} 
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className={`main-content${sidebarCollapsed && !isMobile ? ' sidebar-collapsed' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register onRegister={setUser} /> : <Navigate to="/" />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/specialists" element={<Specialists />} />
            
            {/* Protected Routes */}
            <Route path="/account" element={
              <ProtectedRoute user={user}>
                <Account user={user} />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute user={user}>
                <Chat user={user} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;