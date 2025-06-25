import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // This useEffect will now set up a listener for our custom auth event.
  useEffect(() => {
    // This function checks localStorage and updates the state.
    const handleAuthChange = () => {
      const stored = localStorage.getItem('dreamcodedUser');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser({
          ...userData,
          avatar_url: userData.avatar_url || `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=111&color=fff`
        });
      } else {
        setUser(null);
      }
    };

    // 1. Run it once on initial load to set the user state.
    handleAuthChange();

    // 2. Add an event listener to the window.
    //    Now, whenever the 'dreamcoded-auth-change' event happens, it will run our function.
    window.addEventListener('dreamcoded-auth-change', handleAuthChange);

    // 3. IMPORTANT: Cleanup function.
    //    This runs when the component is removed, preventing memory leaks.
    return () => {
      window.removeEventListener('dreamcoded-auth-change', handleAuthChange);
    };
  }, []); // The empty array [] ensures this setup only runs once.

  const handleLogout = () => {
    localStorage.removeItem('dreamcodedUser');
    // We no longer need to call setUser(null) here because the event listener will handle it!
    window.dispatchEvent(new Event('dreamcoded-auth-change'));
    setMenuOpen(false);
  };

  return (
    <nav className="nav-root">
      {/* Left: Logo */}
      <div className="nav-left">
        <Link to="/" className="brand-text">DreamCoded</Link>
      </div>

      {/* Right: Hamburger */}
      <div className="nav-right">
        <button
          className={`hamburger-icon ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Slide-out Menu */}
      <div className={`slide-menu-drawer ${menuOpen ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setMenuOpen(false)}>&times;</button>

        <div className="menu-content">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link>
          <Link to="/submit" onClick={() => setMenuOpen(false)}>Submit</Link>

          {user ? (
            <div className="user-info">
              <img src={user.avatar_url} alt="avatar" className="user-avatar" />
              <p className="username">{user.first_name}</p>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)} className="signin-button">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
