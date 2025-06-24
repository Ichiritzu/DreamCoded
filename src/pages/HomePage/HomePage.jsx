import React, { useState, useEffect } from 'react';
import './HomePage.css';
import LiveEditor from '../../components/LiveEditor/LiveEditor.jsx';

// Icons
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-heart" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-eye" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

// App Card Component
const AppCard = ({ title, author, image_url, author_avatar_url, likes, views, demo_url, setActiveDemo }) => (
  <div className="app-card">
    <div className="card-image-container">
      <img className="card-image" src={image_url} alt={title} loading="lazy" />
      <div className="card-hover-content">
        {demo_url && (
          <button className="quick-view-button" onClick={() => setActiveDemo(demo_url)}>
            Live Preview
          </button>
        )}
      </div>
    </div>
    <div className="card-content">
      <h3 className="card-title">{title}</h3>
      <div className="card-footer">
        <div className="card-author-info">
          <img src={author_avatar_url} alt={author} className="card-author-avatar" />
          <span>{author}</span>
        </div>
        <div className="card-stats">
          <div className="stat-item"><HeartIcon /> <span>{likes}</span></div>
          <div className="stat-item"><EyeIcon /> <span>{views}</span></div>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const HomePage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [activeDemo, setActiveDemo] = useState(null);

  useEffect(() => {
    const apiUrl = 'http://dreamcoded.com/api.php';

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setApps(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Discovering dreamy projects...</p>
        </div>
      );
    }
    if (error) {
      return <p className="error-message">Error: {error}</p>;
    }
    if (apps.length === 0) {
      return (
        <div className="empty-state">
          <h3>No projects found</h3>
          <p>Be the first to submit your creation!</p>
          <button className="button-primary">Submit Project</button>
        </div>
      );
    }
    return (
      <div className="app-grid">
        {apps.map(app => (
          <AppCard key={app.id} {...app} setActiveDemo={setActiveDemo} />
        ))}
      </div>
    );
  };

  return (
    <div className="dreamcoded-container">
      <header className="hero-section">
        <div className="hero-gradient"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-word">Dream</span>
            <span className="title-word">Coded</span>
          </h1>
          <p className="hero-subtitle">
            Where digital dreams become interactive reality
          </p>
          <div className="hero-search">
            <input type="text" placeholder="Search for glassmorphism, neo-brutalism, aurora..." />
            <button className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
<main className="main-content">
  <LiveEditor />
</main>
      <main className="main-content">
        <div className="filters-container">
          <div className="filters-scroll">
            {['trending', 'newest', 'glassmorphism', 'neo-brutalism', 'aurora', '3d', 'minimal'].map(filter => (
              <button
                key={filter}
                className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </main>

      {/* Modal for Live Demo */}
      {activeDemo && (
        <div className="demo-modal-overlay" onClick={() => setActiveDemo(null)}>
          <div className="demo-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setActiveDemo(null)}>×</button>
            <iframe src={activeDemo} title="Live Preview" className="demo-iframe" allow="fullscreen" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
