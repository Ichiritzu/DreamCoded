// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useMessage } from '../../context/MessageContext';
import { API_BASE } from '../../api';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, setUser } = useUser();
  const { showMessage } = useMessage();

  if (!user) {
    return <p className="page-message">Please log in to view your settings.</p>;
  }

  return (
    <div className="settings-page-container">
      <h1>Account Settings</h1>
      <div className="settings-grid">
        <ProfileCard user={user} setUser={setUser} showMessage={showMessage} />
        <AvatarCard  user={user} setUser={setUser} showMessage={showMessage} />
        <EmailCard   user={user}            showMessage={showMessage} />
        <PasswordCard                      showMessage={showMessage} />
      </div>
    </div>
  );
};

export default SettingsPage;


// ─── PROFILE DETAILS ───────────────────────────────────────────────────────────
function ProfileCard({ user, setUser, showMessage }) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName , setLastName ] = useState(user.last_name);
  const [username , setUsername ] = useState(user.username);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update-profile',
          first_name: firstName,
          last_name:  lastName,
          username:   username
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setUser(json.user);
        showMessage('Profile updated.', 'success');
      } else {
        setError(json.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Profile Details</h2>
      <label>
        First Name
        <input
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
      </label>
      <label>
        Last Name
        <input
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
      </label>
      <label>
        Username
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </label>
      {error && <div className="error-text">{error}</div>}
      <button
        className="settings-btn"
        disabled={loading}
        onClick={handleSave}
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}


// ─── AVATAR UPLOAD ───────────────────────────────────────────────────────────────
function AvatarCard({ user, setUser, showMessage }) {
  const [file,    setFile   ] = useState(null);
  const [preview, setPreview] = useState(user.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState('');

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };
  const handleRemove = () => {
    setFile(null);
    setPreview('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('action', 'update-avatar');
      if (file) {
        body.append('avatar', file);
      } else if (preview === '') {
        // signal “remove avatar”
        body.append('avatar_url', '');
      }

      const res = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const json = await res.json();
      if (json.status === 'success') {
        setUser(json.user);
        showMessage('Avatar updated.', 'success');
      } else {
        setError(json.message || 'Failed to update avatar.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Avatar</h2>
      <div className="avatar-preview-wrapper">
        {preview
          ? <img src={preview} alt="Avatar Preview" className="avatar-preview" />
          : <div className="avatar-placeholder">No avatar</div>
        }
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      {preview && (
        <button
          type="button"
          className="remove-btn"
          onClick={handleRemove}
        >
          Remove
        </button>
      )}
      {error && <div className="error-text">{error}</div>}
      <button
        className="settings-btn"
        disabled={loading}
        onClick={handleSave}
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}


// ─── EMAIL CHANGE ────────────────────────────────────────────────────────────────
function EmailCard({ user, showMessage }) {
  const [newEmail , setNewEmail ] = useState('');
  const [loading  , setLoading  ] = useState(false);
  const [error    , setError    ] = useState('');
  const [requested, setRequested] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action:    'request-email-change',
          new_email: newEmail
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        showMessage(json.message, 'success');
        setRequested(true);
      } else {
        setError(json.message || 'Failed to send verification link.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Email Address</h2>
      <div className="current-email">Current: {user.email}</div>

      {!requested ? (
        <>
          <label>
            New Email
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="you@domain.com"
            />
          </label>
          {error && <div className="error-text">{error}</div>}
          <button
            className="settings-btn"
            disabled={loading || !newEmail}
            onClick={handleSend}
          >
            {loading ? 'Sending…' : 'Send Verification'}
          </button>
        </>
      ) : (
        <div className="success-text">
          ✔ Verification link sent to <strong>{newEmail}</strong>
        </div>
      )}
    </div>
  );
}


// ─── PASSWORD CHANGE ─────────────────────────────────────────────────────────────
function PasswordCard({ showMessage }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd    , setNewPwd    ] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading   , setLoading   ] = useState(false);
  const [error     , setError     ] = useState('');

  const handleChange = async () => {
    if (newPwd !== confirmPwd) {
      setError("New passwords don't match.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action:           'change-password',
          current_password: currentPwd,
          new_password:     newPwd
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        showMessage('Password changed.', 'success');
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else {
        setError(json.message || 'Failed to change password.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Change Password</h2>
      <label>
        Current Password
        <input
          type="password"
          value={currentPwd}
          onChange={e => setCurrentPwd(e.target.value)}
        />
      </label>
      <label>
        New Password
        <input
          type="password"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
        />
      </label>
      <label>
        Confirm New Password
        <input
          type="password"
          value={confirmPwd}
          onChange={e => setConfirmPwd(e.target.value)}
        />
      </label>
      {error && <div className="error-text">{error}</div>}
      <button
        className="settings-btn"
        disabled={loading}
        onClick={handleChange}
      >
        {loading ? 'Saving…' : 'Change Password'}
      </button>
    </div>
  );
}