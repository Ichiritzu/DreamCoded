// src/components/AuthForm/AuthForm.jsx
import React, { useState } from 'react';
import './AuthForm.css';

const AuthForm = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      action: mode,
      ...formData
    };

    // Send to backend
    const res = await fetch('https://dreamcoded.com/api/auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      setMessage(`✅ ${mode === 'login' ? 'Logged in' : 'Registered'} successfully!`);
      // You can store result.user in localStorage or context
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  return (
    <div className="auth-container">
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

      {message && <div className="auth-message">{message}</div>}
    </div>
  );
};

export default AuthForm;
