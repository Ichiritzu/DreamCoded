import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const ProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dreamcodedUser');
    window.dispatchEvent(new Event('dreamcoded-auth-change'));
    setIsOpen(false);
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => {
      const stored = localStorage.getItem('dreamcodedUser');
      if (stored) {
        const freshUser = JSON.parse(stored);
        let fullAvatarUrl = freshUser.avatar_url;

        if (!fullAvatarUrl || fullAvatarUrl === 'null' || fullAvatarUrl.trim() === '') {

          fullAvatarUrl = `https://ui-avatars.com/api/?name=${freshUser.first_name}+${freshUser.last_name}&background=161b22&color=c9d1d9`;
        } else {
          if (fullAvatarUrl.startsWith('/')) {
            fullAvatarUrl = `https://dreamcoded.com${fullAvatarUrl}`;
          }
          // Append cache-busting query param
          fullAvatarUrl += `?v=${Date.now()}`;
        }

        setUser({ ...freshUser, avatar_url: fullAvatarUrl });
      } else {
        setUser(null);
      }
    };

    handleAuthChange();
    window.addEventListener('dreamcoded-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('dreamcoded-auth-change', handleAuthChange);
    };
  }, []);

  return (
    <header className="header-container">
      <div className="header-title-container">
        <h2>Home</h2>
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
    </header>
  );
};

export default Header;
