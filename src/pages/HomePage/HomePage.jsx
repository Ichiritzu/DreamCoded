import React, { useState, useEffect } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://dreamcoded.com/api.php')
      .then((res) => res.ok ? res.json() : Promise.reject('Network error'))
      .then((data) => {
        setApps(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="dc-page">
      <section className="dc-hero">
        <h1 className="dc-title">DreamCoded</h1>
        <p className="dc-sub">Where digital dreams become interactive reality.</p>
      </section>

      <div className="dc-filters">
        {['trending', 'newest', 'glassmorphism', 'neo-brutalism', 'aurora', '3d', 'minimal'].map((tag) => (
          <button key={tag} className="dc-filter">{tag}</button>
        ))}
      </div>

      <div className="dc-gallery">
        {loading && <div className="dc-loading">Loading...</div>}
        {error && <div className="dc-error">{error}</div>}
        {!loading && !error && apps.length === 0 && (
          <div className="dc-empty">Be the first to submit something!</div>
        )}
        {!loading && !error && apps.map(app => (
          <div className="dc-card" key={app.id}>
            <img src={app.image_url} alt={app.title} loading="lazy" className="dc-img" />
            <div className="dc-card-body">
              <h3>{app.title}</h3>
              <div className="dc-meta">
                <span>{app.author}</span>
                <span>❤️ {app.likes}</span>
                <span>👁️ {app.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
