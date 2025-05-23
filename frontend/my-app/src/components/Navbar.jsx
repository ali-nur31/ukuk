import {Link, useNavigate} from 'react-router-dom';
import '../styles/components/_navbar.scss';

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onLogout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar__links">
                {!user && <Link to="/login" className="nav-link">Login</Link>}
                {!user && <Link to="/register" className="nav-link">Register</Link>}
                {user && <Link to="/account" className="nav-link">Account</Link>}
                {user?.role?.name === 'ROLE_ADMIN' &&
                    <Link to="/admin" className="nav-link">Admin</Link>}
            </div>

            {user && (
                <div className="navbar__user">
                    <span className="user-greeting">Hello, {user.username}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;