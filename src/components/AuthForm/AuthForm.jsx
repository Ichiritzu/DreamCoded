import React, { useState, useEffect, useRef } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { API_BASE } from '../../api';
import './AuthForm.css';

// --- Icons & Loader ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const Loader = () => <div className="loader"></div>;

const AuthForm = () => {
  const { user, setUser, refreshUser } = useUser();
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', username: '', email: '', password: ''
  });
  const [showResend, setShowResend] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);

  const startCooldownTimer = (duration) => {
    clearInterval(intervalRef.current);
    setCooldown(duration);
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          localStorage.removeItem('resendCooldownEnd');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const savedEnd = localStorage.getItem('resendCooldownEnd');
    if (savedEnd) {
      const remaining = Math.ceil((savedEnd - Date.now()) / 1000);
      if (remaining > 0) {
        setShowResend(true);
        startCooldownTimer(remaining);
      } else {
        localStorage.removeItem('resendCooldownEnd');
      }
    }
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleChange = (e) => {
    setShowResend(false);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setShowResend(false);
  setIsLoading(true);

  const payload = { action: mode, ...formData };

  try {
    // Debug: log request
    console.log('→ POST', `${API_BASE}/auth.php`, payload);

    // Perform fetch
    const res = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Read raw text for debugging
    const text = await res.text();
    console.log('← status', res.status, 'response text:', text);

    // Attempt to parse JSON
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      throw new Error(`Invalid JSON: ${parseErr.message}`);
    }

    // Handle application logic
    if (result.success) {
      if (mode === 'login') {
        localStorage.setItem('token', result.token);
        // re-fetch and normalize via me.php
        await refreshUser();
        showMessage(`Welcome back, ${result.user.first_name}!`, 'success');
        navigate('/');
      } else if (mode === 'register') {
        showMessage(result.message, 'success');
        setMode('login');
        setFormData({ first_name: '', last_name: '', username: '', email: '', password: '' });
      } else if (mode === 'forgot-password') {
        showMessage(result.message, 'success');
        setMode('login');
      }
    } else {
      showMessage(result.error, 'error');
      if (mode === 'login' && result.error?.includes('verified')) {
        setShowResend(true);
      }
    }
  } catch (err) {
    console.error('Login error:', err);
    showMessage(`Error: ${err.message}`, 'error');
  } finally {
    setIsLoading(false);
  }
};


  const handleResendVerification = async () => {
    setIsLoading(true);
    const cooldownEnd = Date.now() + 10000;
    localStorage.setItem('resendCooldownEnd', cooldownEnd);
    startCooldownTimer(10);

    try {
      const payload = { action: 'resend-verification', email: formData.email };
      const res = await fetch(`${API_BASE}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      showMessage(result.message || result.error, result.success ? 'success' : 'error');
    } catch (err) {
      showMessage('Network error while resending.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // clear token and user
    localStorage.removeItem('token');
    setUser(null);
    showMessage('You have been logged out.', 'success');
    navigate('/');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setShowResend(false);
  };

  if (user) {
    return (
      <div className="auth-container">
        <div className="logged-in-message">
          <p>You are logged in as <strong>{user.first_name}</strong>.</p>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">
        {mode === 'login' && 'Welcome Back'}
        {mode === 'register' && 'Create Account'}
        {mode === 'forgot-password' && 'Reset Password'}
      </h2>
      <p className="auth-subtitle">
        {mode === 'login' && 'Sign in to continue your journey.'}
        {mode === 'register' && 'Join the community of developers.'}
        {mode === 'forgot-password' && 'Enter your email to receive a reset link.'}
      </p>
      
      {mode !== 'forgot-password' && (
        <div className="auth-toggle">
          <button onClick={() => switchMode('login')} disabled={isLoading} className={mode === 'login' ? 'active' : ''}>Login</button>
          <button onClick={() => switchMode('register')} disabled={isLoading} className={mode === 'register' ? 'active' : ''}>Register</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {mode !== 'forgot-password' ? (
          <>
            {mode === 'register' && (
              <>
                <div className="input-group">
                  <span className="input-icon"><UserIcon /></span>
                  <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required disabled={isLoading}/>
                </div>
                <div className="input-group">
                  <span className="input-icon"><UserIcon /></span>
                  <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required disabled={isLoading}/>
                </div>
                <div className="input-group">
                  <span className="input-icon"><UserIcon /></span>
                  <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required disabled={isLoading}/>
                </div>
              </>
            )}
            <div className="input-group">
              <span className="input-icon"><MailIcon /></span>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isLoading}/>
            </div>
            <div className="input-group">
              <span className="input-icon"><LockIcon /></span>
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={isLoading}/>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? <Loader /> : (mode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </>
        ) : (
          <>
            <div className="input-group">
              <span className="input-icon"><MailIcon /></span>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isLoading}/>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? <Loader /> : 'Send Reset Link'}
            </button>
          </>
        )}
      </form>

      {mode === 'login' && (
        <div className="forgot-password-link">
          <button onClick={() => switchMode('forgot-password')}>Forgot Password?</button>
        </div>
      )}
      
      {mode === 'forgot-password' && (
        <div className="forgot-password-link">
          <button onClick={() => switchMode('login')}>Back to Login</button>
        </div>
      )}

      {showResend && (
        <div className="resend-container">
          <button
            onClick={handleResendVerification}
            disabled={cooldown > 0 || isLoading}
            className="resend-button"
          >
            {isLoading ? <Loader /> : (cooldown > 0 ? `Wait ${cooldown}s` : 'Resend Verification Link')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;