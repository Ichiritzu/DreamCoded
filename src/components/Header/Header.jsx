import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import { useUser } from '../../context/UserContext';
import { useMessage } from '../../context/MessageContext';

const ProfileDropdown = ({ user }) => {
    const { showMessage } = useMessage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { setUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout.php', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Logout API call failed:', err);
        } finally {
            setUser(null);
            showMessage('You have been logged out.', 'success');
            navigate('/');
        }
    };

    return (
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="profile-trigger-btn">
                <img src={user.avatar_url} alt={user.username} className="user-avatar-header" />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-user-info">
                        <img src={user.avatar_url} alt={user.username} className="user-avatar-dropdown" />
                        <div className="user-details-dropdown">
                            <span className="user-name-dropdown">{user.first_name} {user.last_name}</span>
                            <span className="username-dropdown">@{user.username}</span>
                        </div>
                    </div>
                    <Link to={`/user/${user.username}`} className="dropdown-item" onClick={() => setIsOpen(false)}>My Profile</Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setIsOpen(false)}>Settings</Link>
                    <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                </div>
            )}
        </div>
    );
};

const Header = () => {
    const { user } = useUser();
    const [pageTitle, setPageTitle] = useState('Home');
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        const titleMap = {
            '/': 'Home',
            '/auth': 'Authentication',
            '/search': 'Search',
            '/submit': 'New Dream',
            '/settings': 'Settings'
        };
        if (path.startsWith('/project/')) setPageTitle('Playground');
        else if (path.startsWith('/user/')) setPageTitle('Profile');
        else if (path.startsWith('/reset-password/')) setPageTitle('Reset Password');
        else setPageTitle(titleMap[path] || 'DreamCoded');
    }, [location]);

    return (
        <header className="header-container">
            <div className="header-title-container">
                <h2>{pageTitle}</h2>
                {/* --- This is the new login status indicator --- */}
                {user && (
                    <div className="login-status">
                        <span className="dot"></span>
                        <span>{user.first_name}</span>
                    </div>
                )}
            </div>
            <div className="header-user-container">
                {user ? (
                    <ProfileDropdown user={user} />
                ) : (
                    <Link to="/auth" className="signin-button">Sign In</Link>
                )}
            </div>
        </header>
    );
};

export default Header;