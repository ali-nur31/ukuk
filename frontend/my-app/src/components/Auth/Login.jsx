import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api';
import '../../styles/components/_auth.scss';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await loginUser(email, password);
            onLogin(response.user);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Ошибка входа');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h1>Вход в систему</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="auth-links">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;