import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api, {getCurrentUser, getUserRole} from '../api';
import Loading from './Loading.jsx';

const ProtectedRoute = ({ children, user, roles }) => {
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        const validate = async () => {
            try {
                if (user) {
                    // Проверяем базовую аутентификацию
                    await getCurrentUser();
                    
                    // Если требуются определенные роли, проверяем их
                    if (roles && roles.length > 0) {
                        const roleData = await getUserRole(user.username);
                        if (!roles.includes(roleData.name)) {
                            setIsValid(false);
                            return;
                        }
                    }
                    
                    setIsValid(true);
                } else {
                    setIsValid(false);
                }
            } catch (error) {
                console.error('Validation error:', error);
                setIsValid(false);
            }
        };
        validate();
    }, [user, roles]);

    if (isValid === null) return <Loading />;

    if (!isValid) {
        // Сохраняем целевую страницу для редиректа после логина
        localStorage.setItem('redirectPath', window.location.pathname);
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;