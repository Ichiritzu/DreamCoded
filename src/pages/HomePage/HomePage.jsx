import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import './HomePage.css';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

const HomePage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('newest');
  const [currentGroup, setCurrentGroup] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://dreamcoded.com/api.php?filter=${activeFilter}`);
        const data = await response.json();
        setApps(data.projects);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeFilter]);

  // Group apps into grids (2x2 on desktop, 1x1 on mobile)
  const groupedApps = [];
  const itemsPerGroup = isMobile ? 1 : 4;
  for (let i = 0; i < apps.length; i += itemsPerGroup) {
    groupedApps.push(apps.slice(i, i + itemsPerGroup));
  }

  const nextGroup = () => {
    if (currentGroup < groupedApps.length - 1) {
      setCurrentGroup(currentGroup + 1);
    }
  };

  const prevGroup = () => {
    if (currentGroup > 0) {
      setCurrentGroup(currentGroup - 1);
    }
  };

  return (
    <div className="carousel-container">
      <header className="header">
        <h1>DreamCoded</h1>
        <p>Where digital dreams become interactive reality.</p>
      </header>

      <div className="filter-bar">
        {['newest', 'trending'].map(filter => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter(filter);
              setCurrentGroup(0);
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="carousel-viewport">
        <button 
          className="nav-arrow prev"
          onClick={prevGroup}
          disabled={currentGroup === 0}
          aria-label="Previous projects"
        >
          ◀
        </button>

        <div className="carousel-track">
          {loading ? (
            <div className={`grid-group active-group ${isMobile ? 'mobile' : ''}`}>
              {[...Array(itemsPerGroup)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : groupedApps.length === 0 ? (
            <div className="empty-message">No projects found</div>
          ) : (
            groupedApps.map((group, index) => (
              <div 
                key={index}
                className={`grid-group ${
                  index === currentGroup ? 'active-group' : 
                  index === currentGroup - 1 ? 'prev-group' :
                  index === currentGroup + 1 ? 'next-group' : 'hidden-group'
                } ${isMobile ? 'mobile' : ''}`}
              >
                {group.map(app => (
                  <ProjectCard 
                    key={app.id} 
                    app={app} 
                    isMobile={isMobile}
                    onTagClick={(tag) => {
                      setActiveFilter(tag);
                      setCurrentGroup(0);
                    }}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        <button 
          className="nav-arrow next"
          onClick={nextGroup}
          disabled={currentGroup === groupedApps.length - 1 || groupedApps.length === 0}
          aria-label="Next projects"
        >
          ▶
        </button>
      </div>

      {!loading && !error && groupedApps.length > 0 && (
        <div className="group-indicator">
          {groupedApps.map((_, index) => (
            <div 
              key={index}
              className={`indicator-dot ${index === currentGroup ? 'active' : ''}`}
              onClick={() => setCurrentGroup(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ app, isMobile, onTagClick }) => (
  <div className={`project-card ${isMobile ? 'mobile' : ''}`}>
    <Link to={`/project/${app.id}`} className="card-link">
      <div className="card-image-container">
        <img 
          src={app.image_url} 
          alt={app.title} 
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay">
          <div className="tags">
            {app.tags?.split(',').map(tag => (
              <button
                key={tag}
                className="tag"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick(tag.trim());
                }}
                aria-label={`Filter by ${tag}`}
              >
                {tag.trim()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Link>
    <div className="card-content">
      <h3 className="card-title">{app.title}</h3>
      <div className="card-meta">
        <span className="author">{app.author}</span>
        <div className="stats">
          <span className="likes">❤️ {app.total_likes || 0}</span>
          <span className="views">👁️ {app.total_views || 0}</span>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;