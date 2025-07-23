// src/components/AuthForm/AuthForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { API_BASE } from '../../api';
import './AuthForm.css';

// --- Icons & Loader ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const Loader = () => <div className="loader"></div>;

// --- Password Strength Meter ---
const PasswordStrengthMeter = ({ strength }) => {
  const { score, text } = strength;
  return (
    <div className="strength-meter">
      <div className="strength-bars">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`strength-bar ${i < score ? 'filled ' + text.toLowerCase().replace(' ', '-') : ''}`}
          />
        ))}
      </div>
      <span className={`strength-text ${text.toLowerCase().replace(' ', '-')}`}>{text}</span>
    </div>
  );
};

// --- Tips for improving password ---
const getPasswordTips = pw => {
  const tips = [];
  if (pw.length < 12)            tips.push('Use at least 12 characters');
  if (!/[A-Z]/.test(pw))         tips.push('Include an uppercase letter');
  if (!/[a-z]/.test(pw))         tips.push('Include a lowercase letter');
  if (!/[0-9]/.test(pw))         tips.push('Include a number');
  if (!/[^A-Za-z0-9]/.test(pw))  tips.push('Include a special symbol');
  return tips;
};

const AuthForm = () => {
  const { user, refreshUser, setUser } = useUser();
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); 
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Too Short' });
  const [showResend, setShowResend] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);

  // Resend cooldown
  const startCooldownTimer = secs => {
    clearInterval(intervalRef.current);
    setCooldown(secs);
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Strength checker
  const checkPasswordStrength = pw => {
    let rawScore = 0;
    if (pw.length >= 12)       rawScore += 2;
    else if (pw.length >= 8)   rawScore += 1;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    if (hasLower && hasUpper)  rawScore += 1;
    if (/[0-9]/.test(pw))      rawScore += 1;
    if (/[^A-Za-z0-9]/.test(pw)) rawScore += 1;
    const score = Math.min(rawScore, 4);
    const textMap = { 0: 'Too Short', 1: 'Weak', 2: 'Medium', 3: 'Strong', 4: 'Very Strong' };
    return { score, text: textMap[score] };
  };

  // Simple form validation
  const validateForm = () => {
    const errs = {};
    if (mode === 'register') {
      if (formData.username.length < 3 || !/^[A-Za-z0-9_]+$/.test(formData.username)) {
        errs.username = 'Username must be 3+ chars, letters/numbers/underscores only.';
      }
      if (checkPasswordStrength(formData.password).score < 2) {
        errs.password = 'Password too weak; include uppercase, numbers, or symbols.';
      }
    }
    return errs;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: undefined }));
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setShowResend(false);

    if (mode === 'register') {
      const v = validateForm();
      if (Object.keys(v).length) {
        setErrors(v);
        return;
      }
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode, ...formData })
      });
      const result = await res.json();

      if (result.success) {
        if (mode === 'login') {
          localStorage.setItem('token', result.token);
          await refreshUser();
          showMessage(`Welcome back, ${result.user.first_name}!`, 'success');
          navigate('/');
        } else if (mode === 'register') {
          showMessage(result.message, 'success');
          setMode('login');
          setFormData({ first_name:'', last_name:'', username:'', email:'', password:'' });
        } else {
          showMessage(result.message, 'success');
          setMode('login');
        }
      } else {
        showMessage(result.error, 'error');
        if (mode === 'login' && result.error.includes('verified')) {
          setShowResend(true);
        }
      }
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    startCooldownTimer(10);
    try {
      const res = await fetch(`${API_BASE}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-verification', email: formData.email })
      });
      const result = await res.json();
      showMessage(result.message || result.error, result.success ? 'success' : 'error');
    } catch {
      showMessage('Network error when resending.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showMessage('Logged out.', 'success');
    navigate('/');
  };

  const switchMode = m => {
    setMode(m);
    setErrors({});
    setShowResend(false);
  };

  if (user) {
    return (
      <div className="auth-container">
        <p>You are logged in as <strong>{user.first_name}</strong>.</p>
        <button onClick={handleLogout} className="logout-button">Logout</button>
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
        {mode === 'login' && 'Sign in to continue.'}
        {mode === 'register' && 'Join the community of developers.'}
        {mode === 'forgot-password' && 'Enter your email for a reset link.'}
      </p>

      {mode !== 'forgot-password' && (
        <div className="auth-toggle">
          <button onClick={() => switchMode('login')}
                  disabled={isLoading}
                  className={mode==='login'?'active':''}>
            Login
          </button>
          <button onClick={() => switchMode('register')}
                  disabled={isLoading}
                  className={mode==='register'?'active':''}>
            Register
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {mode==='register' && (
          <>
            <div className="input-wrapper">
              <span className="input-icon"><UserIcon/></span>
              <input
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required disabled={isLoading}
              />
            </div>

            <div className="input-wrapper">
              <span className="input-icon"><UserIcon/></span>
              <input
                name="last_name"
                placeholder="Last Name (Optional)"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="input-wrapper">
              <span className="input-icon"><UserIcon/></span>
              <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required disabled={isLoading}
              />
            </div>
            {errors.username && <span className="error-text">{errors.username}</span>}
          </>
        )}

        <div className="input-wrapper">
          <span className="input-icon"><MailIcon/></span>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required disabled={isLoading}
          />
        </div>

        {mode!=='forgot-password' && (
          <>
            <div className="input-wrapper">
              <span className="input-icon"><LockIcon/></span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required disabled={isLoading}
              />
            </div>

            {mode==='register' && formData.password && (
              <>
                <PasswordStrengthMeter strength={passwordStrength}/>
                <div className="password-tips">
                  {getPasswordTips(formData.password).map((tip,i) => (
                    <div key={i} className="tip">• {tip}</div>
                  ))}
                </div>
              </>
            )}

            {errors.password && <span className="error-text">{errors.password}</span>}
          </>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? <Loader/> :
            mode==='login' ? 'Login' :
            mode==='register' ? 'Create Account' :
            'Send Reset Link'
          }
        </button>
      </form>

      {mode==='login' && (
        <div className="forgot-password-link">
          <button onClick={() => switchMode('forgot-password')} disabled={isLoading}>
            Forgot Password?
          </button>
        </div>
      )}
      {mode==='forgot-password' && (
        <div className="forgot-password-link">
          <button onClick={() => switchMode('login')} disabled={isLoading}>
            Back to Login
          </button>
        </div>
      )}

      {showResend && (
        <div className="resend-container">
          <button onClick={handleResendVerification}
                  disabled={isLoading || cooldown>0}
                  className="resend-button">
            {isLoading
              ? <Loader/>
              : cooldown>0
                ? `Wait ${cooldown}s`
                : 'Resend Verification Link'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
