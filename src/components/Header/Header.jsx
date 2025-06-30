import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

// A new component for the user dropdown menu
const ProfileDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // This effect handles closing the dropdown if the user clicks outside of it
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
    }, [dropdownRef]);

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
        const userData = JSON.parse(stored);
        let fullAvatarUrl = userData.avatar_url;
        if (fullAvatarUrl && fullAvatarUrl.startsWith('/')) {
            fullAvatarUrl = `https://dreamcoded.com${fullAvatarUrl}`;
        }
        setUser({
          ...userData,
          avatar_url: fullAvatarUrl || `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=161b22&color=c9d1d9`
        });
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
        {/* We can place the current page title here later */}
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
