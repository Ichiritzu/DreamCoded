import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import * as htmlToImage from 'html-to-image';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { materialDark } from '@uiw/codemirror-theme-material';
import { githubDark } from '@uiw/codemirror-theme-github';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { useMessage } from '../../context/MessageContext';
import { useUser } from '../../context/UserContext';
import { API_BASE } from '../../api';
import './ProjectDetailPage.css';

// --- Reusable Hook ---
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}


// --- Icon Components ---
const HeartIcon = () => ( <svg className="heart-svg" viewBox="0 0 24 24" width="24" height="24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> );
const SettingsIcon = () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> );
const SaveIcon = () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> );
const DeleteIcon = () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );
const SpinnerIcon = () => ( <svg className="spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> );
const HtmlLogo = () => ( <svg viewBox="0 0 128 128" width="24" height="24"><path fill="#E44D26" d="M20.4 114.2l-9.3-104.4h96.2l-9.3 104.4-38.8 10.8z"></path><path fill="#F16529" d="M64 117.3l31.9-8.9 8-89.6H64z"></path><path fill="#EBEBEB" d="M64 50.8v22.1l20.1 5.4 2.1-23.5zM64 27.6h24.4l1.7-19.2H64z"></path><path fill="#FFF" d="M64 88.2l-20.1-5.4.1-.1-2.9-32.1h22.9v-23H39.2l.4 4.3 4.2 46.9 20.2 5.4z"></path></svg> );
const CssLogo = () => ( <svg viewBox="0 0 128 128" width="24" height="24"><path fill="#264DE4" d="M20.4 114.2l-9.3-104.4h96.2l-9.3 104.4-38.8 10.8z"></path><path fill="#2965F1" d="M64 117.3l31.9-8.9 8-89.6H64z"></path><path fill="#EBEBEB" d="M64 50.8v22.1l20.1 5.4 2.1-23.5zm0-23.2h22.4l1.7-19.2H64z"></path><path fill="#FFF" d="M64 88.2L43.9 82.8l-2.9-32.1h23v-23H39.2l.4 4.3 4.2 46.9 20.2 5.4z"></path></svg> );
const JsLogo = () => ( <svg viewBox="0 0 128 128" width="24" height="24"><path fill="#F0DB4F" d="M21.2 21.2h85.6v85.6H21.2z"></path><path d="M93.4 89.2c.4-.7.6-1.5.6-2.5 0-2.4-1.2-4-3.6-5.4-2.7-1.5-4.4-2.5-4.4-4 0-1.1.7-2.1 2.4-2.1 1.6 0 2.8.7 3.6 2.1l3.5-2.2c-.8-1.7-2.5-3.1-5.8-3.1-3.2 0-5.4 1.6-5.4 4.3 0 2.5 1.4 4.1 3.9 5.5 2.8 1.5 4.1 2.6 4.1 4.1 0 1.5-1.1 2.3-2.8 2.3-1.8 0-3.3-.8-4.1-2.4l-3.6 2.1c1.1 2.3 3.3 3.6 6.8 3.6 3.8 0 6.2-1.6 6.2-4.6zm-26.6-1.9c.7 1.6 2.1 2.7 4.3 2.7 2.1 0 3.3-1 3.3-3.6v-13h4.9v13.2c0 3.9-2.2 5.9-6.3 5.9-3.7 0-6.1-2-7.2-4.4z"></path></svg> );
const PreviewIcon = () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> );

// --- Modal & Form Components ---
const SettingsModal = ({ isOpen, onClose, project, onDetailsSave, currentTheme, onThemeChange }) => {
    const [activeTab, setActiveTab] = useState('details');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Settings</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="settings-modal-layout">
                    <nav className="settings-nav">
                        <button className={`settings-nav-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                            Project Details
                        </button>
                        <button className={`settings-nav-btn ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>
                            Editor
                        </button>
                    </nav>
                    <div className="settings-content">
                        {activeTab === 'details' && (
                            <EditDetailsForm project={project} onSave={onDetailsSave} onCancel={onClose} />
                        )}
                        {activeTab === 'editor' && (
                            <EditorSettingsForm currentTheme={currentTheme} onThemeChange={onThemeChange} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditDetailsForm = ({ project, onSave, onCancel }) => {
    const [details, setDetails] = useState({ title: project.title || '', description: project.description || '' });
    const [tags, setTags] = useState(project.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTagKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() !== '') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (tags.length < 3 && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setTagInput('');
            }
        }
    };
    const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave({ ...details, tags });
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleFormSubmit} className="edit-details-form">
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" value={details.title} onChange={(e) => setDetails(p => ({...p, title: e.target.value}))} required />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={details.description} onChange={(e) => setDetails(p => ({...p, description: e.target.value}))} rows="4" required></textarea>
            </div>
            <div className="form-group">
                <label>Tags (up to 3)</label>
                <div className="tag-input-container">
                    {tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => removeTag(tag)}>&times;</button></div>))}
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length < 3 ? 'Add a tag...' : 'Max tags reached'} disabled={tags.length >= 3} />
                </div>
            </div>
            <div className="modal-footer">
                <button type="submit" className="modal-button primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

const EditorSettingsForm = ({ currentTheme, onThemeChange }) => (
    <div className="form-group">
        <label htmlFor="editor-theme">Editor Theme</label>
        <select id="editor-theme" className="settings-select" value={currentTheme} onChange={(e) => onThemeChange(e.target.value)}>
            <option value="dracula">Dracula</option>
            <option value="material">Material Dark</option>
            <option value="github">GitHub Dark</option>
        </select>
    </div>
);


// --- Project Detail Components ---
const PlaygroundHeader = ({ project, onLike, onSave, onDelete, onSettings, isOwner, isSaving, isDeleting, liked, totalLikes }) => (
    <header className="playground-header">
        <div className="header-details">
            <div className="project-info">
                <h1 className="project-title">{project.title}</h1>
                {project.tags && project.tags.length > 0 && (
                    <div className="project-tags-container">
                        {project.tags.map(tag => (
                            <Link key={tag} to={`/tag/${tag}`} className="project-tag">{tag}</Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="header-actions">
            <div className="author-info">
                <img src={project.author_avatar_url ? `https://dreamcoded.com${project.author_avatar_url}` : `https://ui-avatars.com/api/?name=${project.author}&background=111&color=fff`} alt={project.author} className="author-avatar"/>
                <Link to={`/user/${project.author}`} className="author-name">{project.author}</Link>
            </div>
            <div className="stats-group">
                <span className="stat-item">❤️ {totalLikes.toLocaleString()}</span>
                <span className="stat-item">👁️ {(parseInt(project.total_views, 10)).toLocaleString()}</span>
            </div>
            <button onClick={onLike} disabled={isDeleting} className={`action-btn like-btn ${liked ? 'liked' : ''}`} aria-label="Like button">
                <HeartIcon />
            </button>
            {isOwner && (
                <>
                    <button onClick={onSettings} className="action-btn settings-btn" aria-label="Settings">
                        <SettingsIcon />
                    </button>
                    <button onClick={onSave} disabled={isSaving || isDeleting} className="action-btn save-btn" aria-label="Save Code">
                        {isSaving ? <SpinnerIcon /> : <SaveIcon />}
                    </button>
                    <button onClick={onDelete} disabled={isSaving || isDeleting} className="action-btn delete-btn" aria-label="Delete Project">
                        <DeleteIcon />
                    </button>
                </>
            )}
        </div>
    </header>
);

const DesktopPlayground = ({ code, onCodeChange, iframeRef, themeMap, editorTheme }) => (
    <PanelGroup direction="vertical" className="main-panel-group">
        <Panel defaultSize={60} minSize={20}>
            <PanelGroup direction="horizontal">
                <Panel defaultSize={33} minSize={10} className="editor-panel">
                    <div className="editor-label">HTML</div>
                    <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.html} height="100%" theme={themeMap[editorTheme]} extensions={[html()]} onChange={(v) => onCodeChange(v, 'html')} />
                </Panel>
                <PanelResizeHandle className="resize-handle horizontal" />
                <Panel defaultSize={33} minSize={10} className="editor-panel">
                    <div className="editor-label">CSS</div>
                    <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.css} height="100%" theme={themeMap[editorTheme]} extensions={[css()]} onChange={(v) => onCodeChange(v, 'css')} />
                </Panel>
                <PanelResizeHandle className="resize-handle horizontal" />
                <Panel defaultSize={34} minSize={10} className="editor-panel">
                    <div className="editor-label">JavaScript</div>
                    <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.js} height="100%" theme={themeMap[editorTheme]} extensions={[javascript()]} onChange={(v) => onCodeChange(v, 'js')} />
                </Panel>
            </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle vertical" />
        <Panel defaultSize={40} minSize={20}>
            <div className="preview-pane"><iframe ref={iframeRef} title="Live Preview" sandbox="allow-scripts allow-same-origin" className="live-preview-iframe" /></div>
        </Panel>
    </PanelGroup>
);

const MobilePlayground = ({ code, onCodeChange, iframeRef, activeTab, setActiveTab, themeMap, editorTheme }) => {
    const [viewMode, setViewMode] = useState('mobile');
    const tabIcons = { html: <HtmlLogo />, css: <CssLogo />, js: <JsLogo />, preview: <PreviewIcon /> };

    const renderContent = () => {
        if (viewMode === 'web') {
            return <DesktopPlayground code={code} onCodeChange={onCodeChange} iframeRef={iframeRef} themeMap={themeMap} editorTheme={editorTheme} />;
        }
        switch (activeTab) {
            case 'html': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.html} height="100%" theme={themeMap[editorTheme]} extensions={[html()]} onChange={(v) => onCodeChange(v, 'html')} />;
            case 'css': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.css} height="100%" theme={themeMap[editorTheme]} extensions={[css()]} onChange={(v) => onCodeChange(v, 'css')} />;
            case 'js': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.js} height="100%" theme={themeMap[editorTheme]} extensions={[javascript()]} onChange={(v) => onCodeChange(v, 'js')} />;
            case 'preview': return <iframe ref={iframeRef} title="Live Preview" sandbox="allow-scripts allow-same-origin" className="live-preview-iframe" />;
            default: return null;
        }
    };

    return (
        <div className="playground-mobile-container">
            <div className="mobile-header">
                <div className="mobile-tab-nav">
                    {viewMode === 'mobile' && Object.keys(tabIcons).map(tabName => (
                        <button type="button" key={tabName} onClick={() => setActiveTab(tabName)} className={`mobile-tab-btn ${activeTab === tabName ? 'active' : ''}`} aria-label={tabName}>
                            {tabIcons[tabName]}
                        </button>
                    ))}
                </div>
                <button onClick={() => setViewMode(prev => prev === 'mobile' ? 'web' : 'mobile')} className="view-toggle-btn">
                    {viewMode === 'mobile' ? 'Web View' : 'Mobile View'}
                </button>
            </div>
            <div className="mobile-tab-content">{renderContent()}</div>
        </div>
    );
};


// --- Main Page Component ---
const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const { user: loggedInUser } = useUser();
  const windowWidth = useWindowWidth();
  const iframeRef = useRef(null);
  const viewCountedRef = useRef(false);
  const token = localStorage.getItem('token');

  const [project, setProject] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [code, setCode]         = useState({ html:'', css:'', js:'' });
  const [liked, setLiked]       = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('html');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorTheme, setEditorTheme] = useState(localStorage.getItem('dreamcoded_editor_theme') || 'dracula');

  const themeMap = { dracula, material: materialDark, github: githubDark };
  const debouncedCode = useDebounce(code);

  // Fetch project data
  useEffect(() => {
    const userParam = loggedInUser ? `&user_id=${loggedInUser.id}` : '';
    fetch(`${API_BASE}/project.php?id=${id}${userParam}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Project not found'))
      .then(data => {
        if (data.error) throw new Error(data.error);
        const tagsArray = data.tags_string?.split(',').filter(t=>t) || [];
        setProject({ ...data, tags: tagsArray });
        setCode({ html: data.code_html||'', css: data.code_css||'', js: data.code_js||'' });
        setTotalLikes(parseInt(data.total_likes,10)||0);
        setLiked(data.is_liked_by_user===1);
        // count the view once
        if (!viewCountedRef.current) {
          fetch(`${API_BASE}/interact.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ project_id: data.id, action:'view' })
          });
          viewCountedRef.current = true;
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, loggedInUser, token]);

  // Update the live preview iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (windowWidth < 768 && activeMobileTab !== 'preview') return;
    const htmlContent = `<!DOCTYPE html><html><head><style>${debouncedCode.css}</style></head><body>${debouncedCode.html}<script>try{${debouncedCode.js}}catch(e){}</script></body></html>`;
    iframe.srcdoc = htmlContent;
  }, [debouncedCode, activeMobileTab, windowWidth]);

  // Handlers
  const handleCodeChange = (value, name) => {
    if (!project || loggedInUser?.id !== project.user_id) {
      showMessage("You can't edit this project.", 'error');
      return;
    }
    setCode(prev => ({ ...prev, [name]: value }));
  };

  const handleLikeToggle = () => {
    if (!loggedInUser) {
      showMessage("Please log in to like this project.", 'error');
      return;
    }
    const origLiked = liked, origCount = totalLikes;
    const newLiked = !origLiked;
    setLiked(newLiked);
    setTotalLikes(newLiked ? origCount+1 : origCount-1);

    fetch(`${API_BASE}/interact.php`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ project_id: project.id, action: newLiked?'like':'unlike' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status!=='success') throw new Error(data.message||'Error');
        if (data.newTotal!==undefined) setTotalLikes(data.newTotal);
      })
      .catch(err => {
        setLiked(origLiked);
        setTotalLikes(origCount);
        showMessage(err.message||"Couldn't update like.", 'error');
      });
  };

  const handleSaveCode = async () => {
    if (!iframeRef.current) {
      showMessage('Preview not ready.', 'error');
      return;
    }
    setIsSaving(true);
    showMessage('Saving and generating thumbnail…', 'info');
    try {
      const dataUrl = await htmlToImage.toPng(iframeRef.current, { width:800, height:500 });
      const payload = {
        project_id: project.id,
        code_html: code.html,
        code_css: code.css,
        code_js: code.js,
        image_data: dataUrl
      };
      const res = await fetch(`${API_BASE}/update.php`, {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status!=='success') throw new Error(data.message);
      showMessage(data.message, 'success');
      if (data.new_url) {
        setProject(p=>({ ...p, image_url: data.new_url }));
      }
    } catch (err) {
      showMessage(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetailsUpdate = async (updated) => {
    setIsSaving(true);
    try {
      const payload = {
        project_id: project.id,
        title: updated.title,
        description: updated.description,
        tags: updated.tags.join(',')
      };
      const res = await fetch(`${API_BASE}/update.php`, {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status!=='success') throw new Error(data.message);
      setProject(p=>({ ...p, ...updated, tags: updated.tags }));
      setIsSettingsOpen(false);
      showMessage('Details updated!', 'success');
    } catch (err) {
      showMessage(`Update failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Really delete this Dream?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/delete.php`, {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ project_id: project.id })
      });
      const data = await res.json();
      if (data.status!=='success') throw new Error(data.message);
      showMessage('Dream deleted!', 'success');
      navigate('/');
    } catch (err) {
      showMessage(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <p className="page-message">Loading Dream…</p>;
  if (error)   return <p className="page-message error">Error: {error}</p>;
  if (!project) return <p className="page-message">Project not found.</p>;

  const isOwner = loggedInUser?.id === project.user_id;

  return (
    <div className="page-container">
      <div className="playground-container">
        <PlaygroundHeader
          project={project}
          onLike={handleLikeToggle}
          onSave={handleSaveCode}
          onDelete={handleDelete}
          onSettings={()=>setIsSettingsOpen(true)}
          isOwner={isOwner}
          isSaving={isSaving}
          isDeleting={isDeleting}
          liked={liked}
          totalLikes={totalLikes}
        />

        {windowWidth < 768 ? (
          <MobilePlayground
            code={code}
            onCodeChange={handleCodeChange}
            iframeRef={iframeRef}
            activeTab={activeMobileTab}
            setActiveTab={setActiveMobileTab}
            themeMap={themeMap}
            editorTheme={editorTheme}
          />
        ) : (
          <DesktopPlayground
            code={code}
            onCodeChange={handleCodeChange}
            iframeRef={iframeRef}
            themeMap={themeMap}
            editorTheme={editorTheme}
          />
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={()=>setIsSettingsOpen(false)}
        project={project}
        onDetailsSave={handleDetailsUpdate}
        currentTheme={editorTheme}
        onThemeChange={setEditorTheme}
      />
    </div>
  );
};

export default ProjectDetailPage;