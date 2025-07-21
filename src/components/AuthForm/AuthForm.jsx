import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// --- Password Strength Meter Component ---
const PasswordStrengthMeter = ({ strength }) => {
    const { score, text } = strength;
    return (
        <div className="strength-meter">
            <div className="strength-bars">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className={`strength-bar ${index < score ? 'filled ' + text.toLowerCase().replace(' ', '-') : ''}`}
                    ></div>
                ))}
            </div>
            <span className={`strength-text ${text.toLowerCase().replace(' ', '-')}`}>{text}</span>
        </div>
    );
};

const AuthForm = () => {
    const { user, login, logout } = useUser();
    const { showMessage } = useMessage();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', username: '', email: '', password: ''
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Weak' });
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
    
    const checkPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const textMap = { 1: 'Weak', 2: 'Medium', 3: 'Strong', 4: 'Very Strong' };
        return { score, text: textMap[score] || 'Weak' };
    };

    const validateForm = () => {
        const newErrors = {};
        if (mode === 'register') {
            if (formData.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                newErrors.username = 'Username must be 3+ characters and contain only letters, numbers, or underscores.';
            }
            if (checkPasswordStrength(formData.password).score < 2) {
                newErrors.password = 'Password is too weak. Try including uppercase letters and numbers.';
            }
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined })); // Clear error on change

        if (name === 'password') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (mode === 'register') {
            const validationErrors = validateForm();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
        }
        
        setIsLoading(true);
        setErrors({});

        const endpoint = mode === 'login' ? 'auth_token.php' : 'auth.php';
        const payload = mode === 'login' 
            ? { email: formData.email, password: formData.password }
            : { action: mode, ...formData };
        
        try {
            const res = await fetch(`${API_BASE}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            if (result.success) {
                if (mode === 'login') {
                    login(result.token);
                    showMessage(`Welcome back!`, 'success');
                    navigate('/');
                } else {
                    showMessage(result.message, 'success');
                    setMode('login');
                    setFormData({ first_name: '', last_name: '', username: '', email: '', password: '' });
                }
            } else {
                showMessage(result.error, 'error');
                if (mode === 'login' && result.error?.includes('verified')) {
                    setShowResend(true);
                }
            }
        } catch (err) {
            showMessage(`An error occurred: ${err.message}`, 'error');
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
        logout();
        showMessage('You have been logged out.', 'success');
        navigate('/');
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setErrors({});
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

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {mode === 'register' && (
                    <>
                        <div className="input-group">
                            <span className="input-icon"><UserIcon /></span>
                            <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required disabled={isLoading}/>
                        </div>
                        <div className="input-group">
                            <span className="input-icon"><UserIcon /></span>
                            <input name="last_name" placeholder="Last Name (Optional)" value={formData.last_name} onChange={handleChange} disabled={isLoading}/>
                        </div>
                        <div className="input-group">
                            <span className="input-icon"><UserIcon /></span>
                            <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required disabled={isLoading}/>
                            {errors.username && <span className="error-text">{errors.username}</span>}
                        </div>
                    </>
                )}
                <div className="input-group">
                    <span className="input-icon"><MailIcon /></span>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isLoading}/>
                </div>
                {mode !== 'forgot-password' && (
                    <div className="input-group">
                        <span className="input-icon"><LockIcon /></span>
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={isLoading}/>
                        {mode === 'register' && formData.password && <PasswordStrengthMeter strength={passwordStrength} />}
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                )}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader /> : (mode === 'login' ? 'Login' : (mode === 'register' ? 'Create Account' : 'Send Reset Link'))}
                </button>
            </form>

            {mode === 'login' && (
                <div className="forgot-password-link">
                    <button type="button" onClick={() => switchMode('forgot-password')}>Forgot Password?</button>
                </div>
            )}
            
            {mode === 'forgot-password' && (
                <div className="forgot-password-link">
                    <button type="button" onClick={() => switchMode('login')}>Back to Login</button>
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