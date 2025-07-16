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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dreamcodedUser');
    setUser(null);
    window.dispatchEvent(new Event('dreamcoded-auth-change'));
    setIsOpen(false);
    sessionStorage.setItem('justLoggedOut', 'true');
    showMessage('You have logged out.', 'success', true);
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
  const { user, setUser } = useUser();
  const [pageTitle, setPageTitle] = useState('Home');
  const [versionToast, setVersionToast] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const titleMap = {
      '/': 'Home',
      '/auth': 'Authentication',
      '/search': 'Search',
      '/submit': 'Dream',
      '/settings': 'Settings'
    };
    if (path.startsWith('/project/')) setPageTitle('Edit Dream');
    else if (path.startsWith('/user/')) setPageTitle('Profile');
    else if (path.startsWith('/reset-password/')) setPageTitle('Reset Password');
    else setPageTitle(titleMap[path] || 'DreamCoded');
  }, [location]);

  useEffect(() => {
    const handleAuthChange = () => {
      const stored = localStorage.getItem('dreamcodedUser');
      if (stored) {
        const freshUser = JSON.parse(stored);
        let avatar = freshUser.avatar_url;
        if (!avatar || avatar === 'null' || avatar.trim() === '') {
          avatar = `https://ui-avatars.com/api/?name=${freshUser.first_name}+${freshUser.last_name}&background=161b22&color=c9d1d9`;
        } else {
          if (avatar.startsWith('/')) {
            avatar = `https://dreamcoded.com${avatar}`;
          }
          avatar += `?v=${Date.now()}`;
        }
        setUser({ ...freshUser, avatar_url: avatar });
      } else {
        setUser(null);
      }
    };

    handleAuthChange();
    window.addEventListener('dreamcoded-auth-change', handleAuthChange);
    window.addEventListener('dreamcoded-version-update', () => setVersionToast(true));

    return () => {
      window.removeEventListener('dreamcoded-auth-change', handleAuthChange);
      window.removeEventListener('dreamcoded-version-update', () => setVersionToast(true));
    };
  }, [setUser]);

  return (
    <header className="header-container">
      <div className="header-title-container">
        <h2>{pageTitle}</h2>
      </div>
      <div className="header-user-container">
        {user ? (
          <ProfileDropdown user={user} />
        ) : (
          <Link to="/auth" className="signin-button">Sign In</Link>
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
