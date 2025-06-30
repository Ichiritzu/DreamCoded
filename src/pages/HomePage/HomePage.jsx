import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

const HomePage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`https://dreamcoded.com/api.php?limit=12&filter=trending&t=${Date.now()}`)
      .then(res => res.ok ? res.json() : Promise.reject('Error'))
      .then(data => {
        setApps(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const prev = () => setActiveIndex(i => (i > 0 ? i - 1 : i));
  const next = () => setActiveIndex(i => (i < apps.length - 1 ? i + 1 : i));

  return (
    <div className="dc-page">
      <section className="dc-hero">
        <h1 className="dc-title">DreamCoded</h1>
        <p className="dc-sub">Where digital dreams become interactive reality.</p>
      </section>

      <div className="carousel-wrapper">
        <button className="carousel-nav left" onClick={prev} disabled={activeIndex === 0}>
          ‹
        </button>
        <div className="carousel-track">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            apps.map((app, i) => {
              const position =
                i === activeIndex ? 'active' :
                i === activeIndex - 1 || i === activeIndex + 1 ? 'faded' : 'hidden';

              return (
                <div className={`carousel-item ${position}`} key={app.id}>
                  <div className="dc-card-wrapper">
                    <Link to={`/project/${app.id}`} className="dc-card-image-link">
                      <img src={app.image_url} alt={app.title} className="dc-img" />
                      {app.tags && (
                        <div className="card-tags-overlay">
                          {app.tags.split(',').slice(0, 2).map(tag => (
                            <span key={tag} className="card-tag">{tag}</span>
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
                </div>
              );
            })
          )}
        </div>
        <button className="carousel-nav right" onClick={next} disabled={activeIndex === apps.length - 1}>
          ›
        </button>
      </div>
    </div>
  );
};

export default HomePage;
