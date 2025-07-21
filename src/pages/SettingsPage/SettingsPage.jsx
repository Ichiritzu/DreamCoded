import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext';
import { useUser } from '../../context/UserContext';
import { API_BASE } from '../../api';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const { user: loggedInUser, setUser } = useUser();

  const getFullAvatarUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `https://dreamcoded.com${path}`;
  };

  const [formData, setFormData] = useState({
    first_name: loggedInUser?.first_name || '',
    last_name:  loggedInUser?.last_name  || '',
    username:   loggedInUser?.username   || '',
    avatar_url: loggedInUser?.avatar_url || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(getFullAvatarUrl(loggedInUser?.avatar_url));
  const [isSaving, setIsSaving] = useState(false);

  const handleTextChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
      setFormData(f => ({ ...f, avatar_url: '' }));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreview('');
    setFormData(f => ({ ...f, avatar_url: 'REMOVE' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      return showMessage('You must be logged in to update your profile.', 'error');
    }
    setIsSaving(true);

    const dataToSubmit = new FormData();
    dataToSubmit.append('user_id', loggedInUser.id);
    dataToSubmit.append('first_name', formData.first_name);
    dataToSubmit.append('last_name',  formData.last_name);
    dataToSubmit.append('username',   formData.username);

    if (formData.avatar_url === 'REMOVE') {
      dataToSubmit.append('avatar_url', '');
    }
    if (avatarFile) {
      dataToSubmit.append('avatar', avatarFile);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: dataToSubmit
      });
      const result = await response.json();

      if (result.success) {
        // Update user in context
        let updated = result.user;
        // Normalize avatar
        if (updated.avatar_url.startsWith('/')) {
          updated.avatar_url = `https://dreamcoded.com${updated.avatar_url}`;
        }
        setUser(updated);

        showMessage(result.message, 'success');
        navigate(`/user/${updated.username}`);
      } else {
        showMessage(result.error || result.message, 'error');
      }
    } catch (err) {
      console.error('Update error:', err);
      showMessage('An error occurred while updating your profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!loggedInUser) {
    return <p className="page-message">Please log in to view your settings.</p>;
  }

  return (
    <div className="settings-page-container">
      <div className="settings-form-wrapper">
        <header className="settings-header">
          <h1>Account Settings</h1>
          <p>Update your profile information.</p>
        </header>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="avatar-preview-section">
            <img
              src={
                preview ||
                `https://ui-avatars.com/api/?name=${formData.first_name}+${formData.last_name}&background=0D1117&color=fff&size=128`
              }
              alt="Avatar Preview"
              className="settings-avatar-preview"
            />
          </div>

          <div className="form-group avatar-controls">
            <label htmlFor="avatar" className="upload-btn-label">
              {avatarFile ? `Selected: ${avatarFile.name}` : 'Upload New Avatar'}
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
            />
            {preview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="remove-avatar-btn"
              >
                Remove Picture
              </button>
            )}
          </div>

          {/* Text fields */}
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleTextChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleTextChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleTextChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={loggedInUser.email} disabled />
            <small>Email address cannot be changed.</small>
          </div>

          <button
            type="submit"
            className="settings-submit-btn"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
