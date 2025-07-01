// src/pages/ProjectDetailPage/ProjectDetailPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { materialDark } from '@uiw/codemirror-theme-material';
import { githubDark } from '@uiw/codemirror-theme-github';
import { useMessage } from '../../context/MessageContext';
import { useWindowWidth } from '../../hooks/useWindowWidth'; // Corrected import path
import './ProjectDetailPage.css';

// Helper function to call the interaction API (remains the same)
const sendInteraction = (projectId, action, userId) => {
  const payload = { project_id: projectId, action };
  if (userId) payload.user_id = userId;
  return fetch('https://dreamcoded.com/api/interact.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    .catch(err => console.error(`Failed to record ${action}:`, err));
};

// MobileView Component
const MobileView = ({ code, createIframeContent, handleCodeChange, themeMap, editorTheme, handleThemeChange }) => {
  const [activeTab, setActiveTab] = useState('html');

  const renderContent = () => {
    switch (activeTab) {
      case 'html':
        return (
          <CodeMirror
            value={code.html}
            height="100%"
            theme={themeMap[editorTheme]}
            extensions={[html()]}
            onChange={(v) => handleCodeChange(v, 'html')}
            basicSetup={{ lineNumbers: true, foldGutter: true }}
          />
        );
      case 'css':
        return (
          <CodeMirror
            value={code.css}
            height="100%"
            theme={themeMap[editorTheme]}
            extensions={[css()]}
            onChange={(v) => handleCodeChange(v, 'css')}
            basicSetup={{ lineNumbers: true, foldGutter: true }}
          />
        );
      case 'js':
        return (
          <CodeMirror
            value={code.js}
            height="100%"
            theme={themeMap[editorTheme]}
            extensions={[javascript()]}
            onChange={(v) => handleCodeChange(v, 'js')}
            basicSetup={{ lineNumbers: true, foldGutter: true }}
          />
        );
      case 'preview':
        return (
          <div className="preview-pane">
            <iframe
              key={Date.now()}
              srcDoc={createIframeContent()}
              title="Live Preview"
              sandbox="allow-scripts"
              className="live-preview-iframe"
            />
          </div>
        );
      // New case to render the theme selector
      case 'settings':
        return (
          <div className="mobile-settings-pane">
            <div className="theme-select-wrapper">
              <label htmlFor="theme-select" className="theme-label">Editor Theme:</label>
              <select
                id="theme-select"
                className="theme-select"
                value={editorTheme}
                onChange={handleThemeChange}
              >
                <option value="dracula">Dracula</option>
                <option value="material">Material</option>
                <option value="github">GitHub Dark</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mobile-view-wrapper">
      <div className="mobile-tabs">
        <button onClick={() => setActiveTab('html')} className={activeTab === 'html' ? 'active' : ''}>HTML</button>
        <button onClick={() => setActiveTab('css')} className={activeTab === 'css' ? 'active' : ''}>CSS</button>
        <button onClick={() => setActiveTab('js')} className={activeTab === 'js' ? 'active' : ''}>JS</button>
        <button onClick={() => setActiveTab('preview')} className={activeTab === 'preview' ? 'active' : ''}>Preview</button>
        {/* New "Settings" tab button */}
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>⚙️</button>
      </div>
      <div className="mobile-content">
        {renderContent()}
      </div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const windowWidth = useWindowWidth(); // Get window width

  // All your existing state and useEffect hooks remain here...
  const loggedInUser = useMemo(() => {
    const storedUser = localStorage.getItem('dreamcodedUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  const viewCountedRef = useRef(false);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState({ html: '', css: '', js: '' });
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [editorTheme, setEditorTheme] = useState(
    () => localStorage.getItem('dreamcoded_editor_theme') || 'dracula'
  );

  const themeMap = {
    dracula: dracula,
    material: materialDark,
    github: githubDark,
  };

  useEffect(() => {
    const userIdParam = loggedInUser ? `&user_id=${loggedInUser.id}` : '';
    const apiUrl = `https://dreamcoded.com/api/project.php?id=${id}${userIdParam}&t=${Date.now()}`;

    fetch(apiUrl)
      .then(res => res.ok ? res.json() : Promise.reject('Project not found'))
      .then(data => {
        setProject(data);
        setTotalLikes(parseInt(data.total_likes, 10));
        setLiked(data.is_liked_by_user === 1);
        setCode({
          html: data.code_html || '',
          css: data.code_css || '',
          js: data.code_js || ''
        });
        setLoading(false);

        if (!viewCountedRef.current) {
          sendInteraction(data.id, 'view');
          viewCountedRef.current = true;
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, loggedInUser]);
  
  // All your handlers (handleCodeChange, handleLikeToggle, etc.) remain the same...
  const handleCodeChange = (value, editorName) => {
    setCode(prev => ({ ...prev, [editorName]: value }));
  };

  const handleLikeToggle = () => {
    if (!loggedInUser) return showMessage("Please log in to like this project.", "error");
    const newLiked = !liked;
    const action = newLiked ? 'like' : 'unlike';
    setLiked(newLiked);
    sendInteraction(project.id, action, loggedInUser.id)
      .then(data => {
        if (data?.status === 'success' && data.newTotal !== undefined) {
          setTotalLikes(data.newTotal);
        }
      })
      .catch(() => setLiked(!newLiked));
  };

  const handleSave = async () => {
    if (!loggedInUser) {
      return showMessage('You must be logged in to save.', 'error');
    }
    setIsSaving(true);
    const payload = {
      project_id: project.id,
      user_id: loggedInUser.id,
      code_html: code.html,
      code_css: code.css,
      code_js: code.js
    };
    try {
      const res = await fetch('https://dreamcoded.com/api/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      showMessage(data.message, data.status);
    } catch (err) {
      showMessage('An error occurred while saving.', 'error');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch('https://dreamcoded.com/api/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          user_id: loggedInUser.id
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        showMessage('Project deleted successfully!', 'success');
        setTimeout(() => navigate('/'), 500);
      } else {
        showMessage(data.message, 'error');
      }
    } catch (err) {
      showMessage('An error occurred while deleting the project.', 'error');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setEditorTheme(newTheme);
    localStorage.setItem('dreamcoded_editor_theme', newTheme);
  };

  const createIframeContent = () => `<!DOCTYPE html><html><head><style>${code.css}</style></head><body>${code.html}<script>${code.js}</script></body></html>`;

  if (loading) return <p className="page-message">Loading Project...</p>;
  if (error) return <p className="page-message error">Error: {error}</p>;
  if (!project) return <p className="page-message">Project could not be loaded.</p>;

  const isOwner = loggedInUser && loggedInUser.id === project.user_id;

  if (project.project_type === 'live') {
    // This part remains unchanged
    return (
      <div className="live-project-full-page">
        <img src={project.image_url} alt={`${project.title} preview`} className="preview-image-full" />
        <div className="overlay-full">
          <h1>{project.title}</h1>
          <p>by <Link to={`/user/${project.author}`}>{project.author}</Link></p>
          <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="visit-site-button">
            Visit Live Site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="codepen-layout-wrapper">
      <header className="project-header">
        {/* Header content remains the same */}
        <h1 className="project-title">{project.title}</h1>
        <div className="author-section">
          <img
            src={
              project.author_avatar_url
                ? `https://dreamcoded.com${project.author_avatar_url}?v=${Date.now()}`
                : `https://ui-avatars.com/api/?name=${project.author}&background=111&color=fff`
            }
            alt={project.author}
            className="author-avatar"
          />
          <Link to={`/user/${project.author}`} className="author-name-link">{project.author}</Link>
        </div>
        <div className="stats-section">
          <div className="stat-display"><span>❤️</span> {totalLikes.toLocaleString()}</div>
          <div className="stat-display"><span>👁️</span> {(parseInt(project.total_views, 10)).toLocaleString()}</div>
        </div>
        <div className="actions-section">
          {isOwner && (
            <>
              <button onClick={handleSave} disabled={isSaving || isDeleting} className="header-button save-btn">
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleDelete} disabled={isSaving || isDeleting} className="header-button delete-btn">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
          <button onClick={handleLikeToggle} disabled={isDeleting} className={`header-button like-btn ${liked ? 'liked' : ''}`}>
            {liked ? 'Unlike' : 'Like'}
          </button>
          <div className="theme-select-wrapper">
            <label htmlFor="theme-select" className="theme-label">Theme:</label>
            <select
              id="theme-select"
              className="theme-select"
              value={editorTheme}
              onChange={handleThemeChange}
            >
              <option value="dracula">Dracula</option>
              <option value="material">Material</option>
              <option value="github">GitHub Dark</option>
            </select>
          </div>
        </div>
      </header>

      {/* Conditional rendering based on screen width */}
      {windowWidth < 768 ? (
        <MobileView
          code={code}
          createIframeContent={createIframeContent}
          handleCodeChange={handleCodeChange}
          themeMap={themeMap}
          editorTheme={editorTheme}
          handleThemeChange={handleThemeChange}
        />
      ) : (
        <PanelGroup direction="vertical" className="main-panel-group">
          <Panel defaultSize={50} minSize={10}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={33} minSize={10}>
                <div className="editor-wrapper">
                  <div className="editor-label">HTML</div>
                  <CodeMirror
                    value={code.html}
                    height="100%"
                    theme={themeMap[editorTheme]}
                    extensions={[html()]}
                    onChange={(v) => handleCodeChange(v, 'html')}
                    basicSetup={{ lineNumbers: true, foldGutter: true }}
                  />
                </div>
              </Panel>
              <PanelResizeHandle className="resize-handle horizontal" />
              <Panel defaultSize={33} minSize={10}>
                <div className="editor-wrapper">
                  <div className="editor-label">CSS</div>
                  <CodeMirror
                    value={code.css}
                    height="100%"
                    theme={themeMap[editorTheme]}
                    extensions={[css()]}
                    onChange={(v) => handleCodeChange(v, 'css')}
                    basicSetup={{ lineNumbers: true, foldGutter: true }}
                  />
                </div>
              </Panel>
              <PanelResizeHandle className="resize-handle horizontal" />
              <Panel defaultSize={34} minSize={10}>
                <div className="editor-wrapper">
                  <div className="editor-label">JavaScript</div>
                  <CodeMirror
                    value={code.js}
                    height="100%"
                    theme={themeMap[editorTheme]}
                    extensions={[javascript()]}
                    onChange={(v) => handleCodeChange(v, 'js')}
                    basicSetup={{ lineNumbers: true, foldGutter: true }}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="resize-handle vertical" />
          <Panel defaultSize={50} minSize={10}>
            <div className="preview-pane">
              <iframe
                key={code.html + code.css + code.js}
                srcDoc={createIframeContent()}
                title={project.title}
                sandbox="allow-scripts"
                className="live-preview-iframe"
              />
            </div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
};

export default ProjectDetailPage;