import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getCurrentUser, loginUser, getUserRole } from '../../api';
import '../../styles/components/_auth.scss';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(email, password);
            console.log('Login response:', response);
            
            // Сохраняем токены
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            // Получаем данные пользователя
            const userData = await getCurrentUser();
            console.log('User data:', userData);

            // Пытаемся получить роль пользователя по email
            try {
                const roleData = await getUserRole(email); // Используем email вместо id
                console.log('Роль пользователя:', roleData);
                
                // Проверяем роль пользователя
                if (roleData && roleData.name === 'ROLE_ADMIN') {
                    userData.role = roleData;
                    userData.isAdmin = true;
                } else {
                    userData.role = roleData;
                    userData.isAdmin = false;
                }
            } catch (roleError) {
                console.log('Не удалось получить роль пользователя:', roleError);
                // Если не удалось получить роль, считаем пользователя обычным
                userData.role = null;
                userData.isAdmin = false;
            }

            // Обновляем состояние пользователя
            onLogin(userData);
            
            setSuccess(true);
            setErrorMessage('');
            setEmail('');
            setPassword('');
            
            // Перенаправляем в зависимости от роли
            setTimeout(() => {
                if (userData.isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }, 2000);
        } catch (err) {
            console.error('Login error:', err);
            setSuccess(false);
            setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-form">
            {success ? (
                <div className="success-message">
                    <h2>Вход выполнен успешно! ✅</h2>
                    <p>Перенаправляем на главную страницу...</p>
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    <h1>Вход в систему</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Войти</button>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <div className="auth-links">
                            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default Login;