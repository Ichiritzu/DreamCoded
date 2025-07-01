import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './UserProfilePage.css';

const AppCard = ({ app }) => (
  <Link to={`/project/${app.id}`} className="profile-app-card-link">
    <div className="profile-app-card">
      <img src={app.image_url} alt={app.title} className="profile-card-img" />
      <div className="profile-card-overlay">
        <h3 className="profile-card-title">{app.title}</h3>
      </div>
    </div>
  </Link>
);

const UserProfilePage = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://dreamcoded.com/api/user.php?username=${username}&t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then(data => {
        setProfileData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  if (loading) return <p className="page-message">Loading Profile...</p>;
  if (error) return <p className="page-message error">Error: {error}</p>;
  if (!profileData) return <p className="page-message">Could not load profile.</p>;

  const { user, projects } = profileData;

  // Avatar fallback logic
  const avatarSrc = user.avatar_url
    ? `https://dreamcoded.com${user.avatar_url}?v=${Date.now()}`
    : `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=0D1117&color=fff&size=128`;

  return (
    <div className="profile-page-container">
      <header className="profile-header">
        <img
          src={avatarSrc}
          alt={user.username}
          className="profile-avatar"
        />
        <h1 className="profile-username">{user.username}</h1>
        <p className="profile-name">{user.first_name} {user.last_name}</p>
        <p className="profile-joined">Joined on: {new Date(user.created_at).toLocaleDateString()}</p>
      </header>

      <main className="profile-gallery-container">
        <h2 className="gallery-title">Projects by {user.username}</h2>
        {projects.length > 0 ? (
          <div className="profile-gallery-grid">
            {projects.map(app => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <p className="no-projects-message">This user hasn't submitted any projects yet.</p>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;
