import React, { useState, useEffect } from 'react';
import './AuthForm.css';

const AuthForm = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dreamcodedUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      setMessage(`✅ Welcome back, ${user.first_name}`);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('⏳ Please wait...');

    const payload = {
      action: mode,
      ...formData
    };

    try {
      const res = await fetch('https://dreamcoded.com/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        localStorage.setItem('dreamcodedUser', JSON.stringify(result.user));
        setUser(result.user);
        setMessage(`✅ ${mode === 'login' ? 'Logged in' : 'Registered'} as ${result.user.first_name}`);
        window.dispatchEvent(new Event('dreamcoded-auth-change')); // 🔥 notify others like Navbar
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (err) {
      setMessage('❌ Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dreamcodedUser');
    setUser(null);
    setMessage('👋 You have logged out');
    window.dispatchEvent(new Event('dreamcoded-auth-change')); // 🔥 notify others
  };

  return (
    <div className="auth-container">
      {user ? (
        <div className="logged-in-message">
          <p>Hello, {user.first_name} {user.last_name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <>
          <div className="auth-toggle">
            <button onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>Login</button>
            <button onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <>
                <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
                <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
                <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
              </>
            )}
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
          </form>
        </>
      )}

      {message && <div className="auth-message">{message}</div>}
    </div>
  );
};

export default AuthForm;
