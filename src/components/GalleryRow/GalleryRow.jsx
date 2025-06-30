// src/components/GalleryRow/GalleryRow.jsx
import React, { useEffect, useState } from 'react';
import SkeletonCard from '../Skeleton/SkeletonCard';
import { Link } from 'react-router-dom';
import './GalleryRow.css';

const GalleryRow = ({ title, endpoint }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSkeletons, setShowSkeletons] = useState(false);

  useEffect(() => {
    setLoading(true);
    setShowSkeletons(false);
    const timeout = setTimeout(() => setShowSkeletons(true), 150);

    fetch(`${endpoint}&t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });

    return () => clearTimeout(timeout);
  }, [endpoint]);

  return (
    <section className="gallery-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-scroll">
        {loading && showSkeletons &&
          Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        {!loading &&
          projects.map((project) => (
            <div className="dc-card-wrapper" key={project.id}>
              <Link to={`/project/${project.id}`} className="dc-card-image-link">
                <img src={project.image_url} alt={project.title} className="dc-img" />
                {project.tags && (
                  <div className="card-tags-overlay">
                    {project.tags.split(',').map((tag) => (
                      <button className="card-tag" key={tag}>{tag}</button>
                    ))}
                  </div>
                )}
              </Link>
              <div className="dc-card-body">
                <h3>{project.title}</h3>
                <div className="dc-meta">
                  <Link to={`/user/${project.author}`} className="dc-author-link">{project.author}</Link>
                  <span>❤️ {project.total_likes}</span>
                  <span>👁️ {project.total_views}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default GalleryRow;
