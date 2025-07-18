import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import { useUser } from '../../context/UserContext';
import { useMessage } from '../../context/MessageContext';

const ProfileDropdown = ({ user }) => {
  const { showMessage } = useMessage();
  const { setUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
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

  const handleLogout = () => {
    // remove JWT and clear context
    localStorage.removeItem('token');
    setUser(null);
    showMessage('You have been logged out.', 'success');
    navigate('/auth');
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
              <span className="user-name-dropdown">
                {user.first_name} {user.last_name}
              </span>
              <span className="username-dropdown">@{user.username}</span>
            </div>
          </div>
          <Link
            to={`/user/${user.username}`}
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
          <Link
            to="/settings"
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <button onClick={handleLogout} className="dropdown-item logout">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { user } = useUser();
  const [pageTitle, setPageTitle] = useState('Home');
  const [versionToast, setVersionToast] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setPageTitle('Home');
    else if (path === '/auth') setPageTitle('Authentication');
    else if (path.startsWith('/project/')) setPageTitle('Edit Dream');
    else if (path.startsWith('/user/')) setPageTitle('Profile');
    else if (path === '/search') setPageTitle('Search');
    else if (path === '/submit') setPageTitle('Dream');
    else if (path === '/settings') setPageTitle('Settings');
    else if (path.startsWith('/reset-password/')) setPageTitle('Reset Password');
    else setPageTitle('DreamCoded');
  }, [location]);

  return (
    <header className="header-container">
      <div className="header-title-container">
        <h2>{pageTitle}</h2>
      </div>
      <div className="header-user-container">
        {user ? (
          <ProfileDropdown user={user} />
        ) : (
          <Link to="/auth" className="signin-button">
            Sign In
          </Link>
        )}
      </div>

      {versionToast && (
        <div className="version-toast">
          <span>A new version is available.</span>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      )}
    </header>
  );
};

export default Header;
