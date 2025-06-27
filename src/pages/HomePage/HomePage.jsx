import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const sortFilters = [
  { key: 'newest', label: 'Newest' },
  { key: 'trending', label: 'Trending' }
];

const HomePage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the main sorting/tag filter
  const [activeFilter, setActiveFilter] = useState('newest');
  // New state to hold the popular tags fetched from the API
  const [popularTags, setPopularTags] = useState([]);

  // --- Effect to fetch the list of popular tags ---
  useEffect(() => {
    fetch('https://dreamcoded.com/api/tags.php')
      .then(res => res.json())
      .then(data => {
        // Add 'all' to the beginning of the fetched tags
        setPopularTags(['all', ...data]);
      })
      .catch(err => {
        console.error("Failed to fetch tags:", err);
        // Provide a fallback if the API fails
        setPopularTags(['all']);
      });
  }, []); // Runs only once on component mount

  // --- Effect to fetch the projects based on the active filter ---
  useEffect(() => {
    setLoading(true);
    
    let apiUrl = 'https://dreamcoded.com/api.php';
    
    // Check if the filter is a sorting option or a tag
    if (sortFilters.some(f => f.key === activeFilter)) {
      apiUrl += `?filter=${activeFilter}`;
    } else if (activeFilter !== 'all') {
      apiUrl += `?tag=${activeFilter}`;
    }
    
    const separator = apiUrl.includes('?') ? '&' : '?';
    apiUrl += `${separator}t=${Date.now()}`;

    fetch(apiUrl)
      .then((res) => res.ok ? res.json() : Promise.reject('Network error'))
      .then((data) => {
        setApps(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch projects.');
        setLoading(false);
      });
  }, [activeFilter]);

  return (
    <div className="dc-page">
      <section className="dc-hero">
        <h1 className="dc-title">DreamCoded</h1>
        <p className="dc-sub">Where digital dreams become interactive reality.</p>
      </section>

      <div className="dc-filters">
        {sortFilters.map((filter) => (
          <button 
            key={filter.key} 
            className={`dc-filter ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
        <div className="filter-separator"></div>
        {/* The tag filter buttons are now generated dynamically */}
        {popularTags.map((tag) => (
          <button 
            key={tag} 
            className={`dc-filter ${activeFilter === tag ? 'active' : ''}`}
            onClick={() => setActiveFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="dc-gallery">
        {loading && <div className="dc-loading">Loading...</div>}
        {error && <div className="dc-error">{error}</div>}
        {!loading && !error && apps.length === 0 && (
          <div className="dc-empty">No projects found for this filter.</div>
        )}
        {!loading && !error && apps.map(app => (
          <div className="dc-card-wrapper" key={app.id}>
            <Link to={`/project/${app.id}`} className="dc-card-image-link">
              <img src={app.image_url} alt={app.title} loading="lazy" className="dc-img" />
              {app.tags && (
                <div className="card-tags-overlay">
                  {/* The tags on the card are now clickable buttons */}
                  {app.tags.split(',').map(tag => (
                    <button key={tag} className="card-tag" onClick={(e) => {
                      e.preventDefault(); // Prevent the Link from navigating
                      setActiveFilter(tag);
                    }}>
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </Link>
            <div className="dc-card-body">
              <h3>{app.title}</h3>
              <div className="dc-meta">
                <Link to={`/user/${app.author}`} className="dc-author-link">{app.author}</Link>
                <span>❤️ {app.total_likes}</span>
                <span>👁️ {app.total_views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
