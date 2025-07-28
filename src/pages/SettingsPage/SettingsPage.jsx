// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { useUser }       from '../../context/UserContext';
import { useMessage }    from '../../context/MessageContext';
import { API_BASE }      from '../../api';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, setUser, refreshUser } = useUser();
  const { showMessage } = useMessage();

  if (!user) {
    return <p className="page-message">Please log in to view your settings.</p>;
  }

  return (
    <div className="settings-page-container">
      <h1>Account Settings</h1>
      <div className="settings-grid">
        <ProfileCard   user={user} setUser={setUser}           showMessage={showMessage}           />
        <AvatarCard    user={user} setUser={setUser} refreshUser={refreshUser} showMessage={showMessage} />
        <EmailCard     user={user}                              showMessage={showMessage}           />
        <PasswordCard                                                       showMessage={showMessage}           />
      </div>
    </div>
  );
}

// ─── PROFILE DETAILS ───────────────────────────────────────────────────────────
function ProfileCard({ user, setUser, showMessage }) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName , setLastName ] = useState(user.last_name);
  const [username , setUsername ] = useState(user.username);
  const [loading, setLoading]     = useState(false);
  const [error,   setError  ]     = useState('');

  const handleSave = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action:     'update-profile',
          first_name: firstName,
          last_name:  lastName,
          username
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
        <input value={firstName} onChange={e => setFirstName(e.target.value)} />
      </label>
      <label>
        Last Name
        <input value={lastName}  onChange={e => setLastName(e.target.value)}  />
      </label>
      <label>
        Username
        <input value={username}  onChange={e => setUsername(e.target.value)}  />
      </label>
      {error && <div className="error-text">{error}</div>}
      <button
        className="settings-btn"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

// ─── AVATAR UPLOAD ───────────────────────────────────────────────────────────────
function AvatarCard({ user, setUser, refreshUser, showMessage }) {
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
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const body  = new FormData();
      body.append('action', 'update-avatar');
      if (file) {
        body.append('avatar', file);
      } else if (preview === '') {
        // tell the server to remove
        body.append('avatar_url', '');
      }

      const res = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const json = await res.json();
      if (json.status === 'success') {
        // re-fetch fresh user (including new avatar URL)
        await refreshUser();
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
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <button type="button" className="remove-btn" onClick={handleRemove}>
          Remove
        </button>
      )}
      {error && <div className="error-text">{error}</div>}
      <button
        className="settings-btn"
        onClick={handleSave}
        disabled={loading}
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
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/settings.php`, {
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
            onClick={handleSend}
            disabled={loading || !newEmail}
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

// ─── PASSWORD CHANGE (send reset link) ─────────────────────────────────────────────
function PasswordCard({ showMessage }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [loading   , setLoading   ] = useState(false);
  const [error     , setError     ] = useState('');
  const [requested , setRequested ] = useState(false);

  const handleSend = async () => {
    if (!currentPwd) {
      setError('Current password is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action:           'request-password-change',
          current_password: currentPwd
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        showMessage(json.message, 'success');
        setRequested(true);
      } else {
        setError(json.message || 'Failed to send reset link.');
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
      {!requested ? (
        <>
          <label>
            Current Password
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
            />
          </label>
          {error && <div className="error-text">{error}</div>}
          <button
            className="settings-btn"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </>
      ) : (
        <div className="success-text">
          ✔ Check your email for a password‑reset link.
        </div>
      )}
    </div>
  );
}
