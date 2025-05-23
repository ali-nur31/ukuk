import { useState } from 'react';
import { registerUser } from '../../api';
import '../../styles/components/_auth.scss';
import { Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser({ username, password });
            console.log(response);
            setSuccess(true);
            setErrorMessage('');
            setUsername('');
            setPassword('');
        } catch (error) {
            setSuccess(false);
            setErrorMessage(error.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-form">
            {success ? (
                <div className="success-message">
                    <h2>Регистрация прошла успешно! 🎉</h2>
                    <p>Вы теперь можете <Link to="/login">войти</Link> в свой аккаунт.</p>
                </div>
            ) : (
                <>
                    <h1>Создать аккаунт</h1>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Register</button>
                    </form>
                    {errorMessage && <div className="error-message">Аккаунт уже сущевствует</div>}
                    <div className="auth-links">
                        Есть аккаунт, так зайди уже? <Link to="/login">Войти тута</Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Register;