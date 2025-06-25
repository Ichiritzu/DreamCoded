import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
  // useParams is a hook from react-router-dom that grabs dynamic parts of the URL.
  // In our case, it gets the 'id' from the route path "/project/:id".
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the specific project when the component mounts or the ID changes.
    fetch(`https://dreamcoded.com/api/project.php?id=${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Project not found');
        return response.json();
      })
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]); // The dependency array [id] means this effect re-runs if the URL ID changes.

  // This function builds the complete HTML document to inject into the iframe.
  const createIframeContent = () => {
    if (!project) return '';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${project.code_css || ''}</style>
        </head>
        <body>
          ${project.code_html || ''}
          <script>${project.code_js || ''}</script> 
        </body>
      </html>
    `;
  };

  if (loading) return <p className="page-message">Loading Project...</p>;
  if (error) return <p className="page-message error">Error: {error}</p>;
  if (!project) return <p className="page-message">Project could not be loaded.</p>;

  return (
    <div className="detail-page-layout">
      {/* Left side: The Live Preview Iframe */}
      <div className="preview-pane">
        <iframe
          srcDoc={createIframeContent()}
          title={project.title}
          sandbox="allow-scripts" // Security: allows scripts but blocks dangerous actions
          className="live-preview-iframe"
        />
      </div>

      {/* Right side: Project Information */}
      <div className="info-pane">
        <h1 className="project-title">{project.title}</h1>
        <div className="author-section">
          <img 
            src={project.author_avatar_url || `https://ui-avatars.com/api/?name=${project.author}&background=111&color=fff`} 
            alt={project.author} 
            className="author-avatar"
          />
          <span className="author-name">{project.author}</span>
        </div>
        <p className="project-description">{project.description}</p>
        
        <div className="links-section">
          {project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="project-link">Project Link</a>}
          {project.demo_url && <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="project-link">Video Demo</a>}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
