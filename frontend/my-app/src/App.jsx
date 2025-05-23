import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import api from './api';
import './styles/main.scss';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Loading from './components/Loading.jsx';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './pages/Home';
import Account from './pages/Account';
import Admin from './pages/Admin';
import AdminNews from './pages/AdminNews';
import ProtectedRoute from './components/ProtectedRoute';
import Loan from "./pages/Loan.jsx";
import News from "./pages/News.jsx";
import NewsDetail from './pages/NewsDetail';
import Sidebar from './components/Sidebar';
import AuthTopBar from './components/AuthTopBar';
import Specialists from './pages/Specialists';
import Chat from './pages/Chat';

const App = () => {
    const [initLoading, setInitLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const checkActivity = setInterval(async () => {
            if (localStorage.getItem('refreshToken')) {
                try {
                    await api.post('/auth/validate-session');
                } catch (error) {
                    localStorage.clear();
                    window.location.reload();
                }
            }
        }, 300000);

        return () => clearInterval(checkActivity);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/me');
                console.log('Получены данные пользователя:', response.data);
                console.log('Роль пользователя:', response.data.role);
                
                setUser({
                    id: response.data.id,
                    username: response.data.username,
                    balance: response.data.balance,
                    role: response.data.role
                });
                
                console.log('Состояние пользователя обновлено:', {
                    id: response.data.id,
                    username: response.data.username,
                    balance: response.data.balance,
                    role: response.data.role
                });
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setInitLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    if (initLoading) return <Loading />;

    return (
        <div className="app-container">
            <AuthTopBar user={user} onLogin={setUser} onLogout={handleLogout} />
            <div className="layout">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                {sidebarCollapsed && (
                  <button
                    className="sidebar-toggle-btn"
                    onClick={() => setSidebarCollapsed(false)}
                    style={{
                      position: 'fixed',
                      left: 8,
                      top: 24,
                      zIndex: 1001,
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      fontSize: 22
                    }}
                    aria-label="Открыть меню"
                  >
                    ⮞
                  </button>
                )}
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login onLogin={setUser} />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute user={user}>
                                    <Account user={user} />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute user={user} roles={['ROLE_ADMIN']}>
                                    <Admin />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/news"
                            element={
                                <ProtectedRoute user={user} roles={['ROLE_ADMIN']}>
                                    <AdminNews />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/loan"
                            element={
                                <ProtectedRoute user={user}>
                                    <Loan userId={user?.id} />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/news"
                            element={
                                <ProtectedRoute user={user}>
                                    <News user={user} />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/news/:id" element={<NewsDetail />} />
                        <Route path="/specialists" element={<Specialists />} />
                        <Route path="/chat/:id" element={<Chat />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;