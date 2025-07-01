import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext';
import './ResetPasswordPage.css';

const Loader = () => <div className="loader"></div>;

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { showMessage } = useMessage();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const payload = { action: 'reset-password', token, password };
            const res = await fetch('https://dreamcoded.com/api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                showMessage(result.message, 'success');
                navigate('/auth'); // Redirect to login page
            } else {
                showMessage(result.error, 'error');
            }
        } catch (err) {
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <h2 className="reset-password-title">Set New Password</h2>
            <form onSubmit={handleSubmit} className="reset-password-form">
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader /> : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;