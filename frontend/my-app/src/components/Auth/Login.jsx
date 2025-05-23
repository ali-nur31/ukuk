import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getCurrentUser, loginUser, getUserRole } from '../../api';
import '../../styles/components/_auth.scss';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(username, password);
            console.log('Полученные данные пользователя при входе:', response);
            
            // Сохраняем токены
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            // Получаем данные пользователя
            const userData = await getCurrentUser();
            console.log('Данные пользователя:', userData);

            // Пытаемся получить роль пользователя по username
            try {
                const roleData = await getUserRole(username); // Используем username вместо id
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
            setUsername('');
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
            console.error('Ошибка при входе:', err);
            setSuccess(false);
            setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-form">
            {success ? (
                <div className="success-message">
                    <h2>Вошли успешно! ✅</h2>
                    <p>Перенаправляем на другую страницу...</p>
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    <h1>Войти</h1>
                    <input
                        type="text"
                        placeholder="Имя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin}>Login</button>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <div className="auth-links">
                        Нет аккаунта? <Link to="/register">Так зарегай</Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Login;