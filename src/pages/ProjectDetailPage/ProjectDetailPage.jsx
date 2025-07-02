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
import { useWindowWidth } from '../../hooks/useWindowWidth';
import './ProjectDetailPage.css';

// --- Helper Components ---

const ViewTopIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="8" rx="1"/><rect x="3" y="13" width="18" height="8" rx="1"/></svg>;
const ViewLeftIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>;
const ViewRightIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="13" y="3" width="8" height="18" rx="1"/><rect x="3" y="3" width="8" height="18" rx="1"/></svg>;

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

const EditDetailsForm = ({ project, onSave, onCancel }) => {
    const [details, setDetails] = useState({ title: project.title || '', description: project.description || '' });
    const [tags, setTags] = useState(project.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleTagKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() !== '') {
            e.preventDefault();
            if (tags.length < 5 && !tags.includes(tagInput.trim().toLowerCase())) {
                setTags([...tags, tagInput.trim().toLowerCase()]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ ...details, tags });
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleFormSubmit} className="edit-details-form">
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" value={details.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={details.description} onChange={handleChange} rows="4" required></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="tags">Tags (up to 5)</label>
                <div className="tag-input-container">
                    {tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => removeTag(tag)}>&times;</button></div>))}
                    <input type="text" id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length<5 ? 'Add a tag...' : ''} disabled={tags.length>=5} />
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="modal-button secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="modal-button primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
        </form>
    );
};

const DesktopLayout = ({ layout, code, handleCodeChange, themeMap, editorTheme, createIframeContent, projectTitle }) => {
    const isVertical = layout === 'vertical';
    const EditorsPanelContent = ( <PanelGroup direction={isVertical ? 'horizontal' : 'vertical'}> <Panel minSize={10} defaultSize={33}><div className="editor-wrapper"><div className="editor-label">HTML</div><CodeMirror value={code.html} height="100%" theme={themeMap[editorTheme]} extensions={[html()]} onChange={(v) => handleCodeChange(v, 'html')} basicSetup={{ lineNumbers: true, foldGutter: true }}/></div></Panel><PanelResizeHandle className={isVertical ? 'resize-handle horizontal' : 'resize-handle vertical'} /><Panel minSize={10} defaultSize={33}><div className="editor-wrapper"><div className="editor-label">CSS</div><CodeMirror value={code.css} height="100%" theme={themeMap[editorTheme]} extensions={[css()]} onChange={(v) => handleCodeChange(v, 'css')} basicSetup={{ lineNumbers: true, foldGutter: true }}/></div></Panel><PanelResizeHandle className={isVertical ? 'resize-handle horizontal' : 'resize-handle vertical'} /><Panel minSize={10} defaultSize={34}><div className="editor-wrapper"><div className="editor-label">JavaScript</div><CodeMirror value={code.js} height="100%" theme={themeMap[editorTheme]} extensions={[javascript()]} onChange={(v) => handleCodeChange(v, 'js')} basicSetup={{ lineNumbers: true, foldGutter: true }}/></div></Panel></PanelGroup> );
    const PreviewPanelContent = ( <div className="preview-pane"><iframe key={code.html + code.css + code.js} srcDoc={createIframeContent()} title={projectTitle} sandbox="allow-scripts" className="live-preview-iframe"/></div> );
    return ( <PanelGroup key={layout} direction={isVertical ? 'vertical' : 'horizontal'} className="main-panel-group">{layout === 'right' && <Panel defaultSize={50} minSize={20}>{PreviewPanelContent}</Panel>}{layout === 'right' && <PanelResizeHandle className="resize-handle horizontal" />}<Panel defaultSize={50} minSize={20}>{EditorsPanelContent}</Panel><PanelResizeHandle className={isVertical ? 'resize-handle vertical' : 'resize-handle horizontal'} />{layout !== 'right' && <Panel defaultSize={50} minSize={20}>{PreviewPanelContent}</Panel>}</PanelGroup> );
};

const MobileView = ({ code, createIframeContent, handleCodeChange, themeMap, editorTheme, handleThemeChange }) => {
    const [activeTab, setActiveTab] = useState('html');
    const renderContent = () => {
        switch (activeTab) {
            case 'html': return <CodeMirror value={code.html} height="100%" theme={themeMap[editorTheme]} extensions={[html()]} onChange={(v) => handleCodeChange(v, 'html')} basicSetup={{ lineNumbers: true, foldGutter: true }}/>;
            case 'css': return <CodeMirror value={code.css} height="100%" theme={themeMap[editorTheme]} extensions={[css()]} onChange={(v) => handleCodeChange(v, 'css')} basicSetup={{ lineNumbers: true, foldGutter: true }}/>;
            case 'js': return <CodeMirror value={code.js} height="100%" theme={themeMap[editorTheme]} extensions={[javascript()]} onChange={(v) => handleCodeChange(v, 'js')} basicSetup={{ lineNumbers: true, foldGutter: true }}/>;
            case 'preview': return <div className="preview-pane"><iframe key={Date.now()} srcDoc={createIframeContent()} title="Live Preview" sandbox="allow-scripts" className="live-preview-iframe"/></div>;
            case 'settings': return <div className="mobile-settings-pane"><div className="theme-select-wrapper"><label htmlFor="theme-select" className="theme-label">Editor Theme:</label><select id="theme-select" className="theme-select" value={editorTheme} onChange={handleThemeChange}><option value="dracula">Dracula</option><option value="material">Material</option><option value="github">GitHub Dark</option></select></div></div>;
            default: return null;
        }
    };
    return ( <div className="mobile-view-wrapper"><div className="mobile-tabs"><button type="button" onClick={() => setActiveTab('html')} className={activeTab === 'html' ? 'active' : ''}>HTML</button><button type="button" onClick={() => setActiveTab('css')} className={activeTab === 'css' ? 'active' : ''}>CSS</button><button type="button" onClick={() => setActiveTab('js')} className={activeTab === 'js' ? 'active' : ''}>JS</button><button type="button" onClick={() => setActiveTab('preview')} className={activeTab === 'preview' ? 'active' : ''}>Preview</button><button type="button" onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>⚙️</button></div><div className="mobile-content">{renderContent()}</div></div> );
};

const sendInteraction = (projectId, action, userId) => {
    const payload = { project_id: projectId, action };
    if (userId) payload.user_id = userId;
    return fetch('https://dreamcoded.com/api/interact.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(res => { if (!res.ok) { throw new Error('Network response was not ok'); } return res.json(); });
};

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showMessage } = useMessage();
    const windowWidth = useWindowWidth();
    const loggedInUser = useMemo(() => JSON.parse(localStorage.getItem('dreamcodedUser')), []);
    const viewCountedRef = useRef(false);

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState({ html: '', css: '', js: '' });
    const [liked, setLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    
    const [editorTheme, setEditorTheme] = useState(() => localStorage.getItem('dreamcoded_editor_theme') || 'dracula');
    const [layout, setLayout] = useState(() => localStorage.getItem('dreamcoded_layout') || 'vertical');

    const themeMap = { dracula, material: materialDark, github: githubDark };

    useEffect(() => {
        const userIdParam = loggedInUser ? `&user_id=${loggedInUser.id}` : '';
        const apiUrl = `https://dreamcoded.com/api/project.php?id=${id}${userIdParam}&t=${Date.now()}`;
        fetch(apiUrl)
            .then(res => res.ok ? res.json() : Promise.reject('Project not found'))
            .then(data => {
                setProject({ ...data, tags: data.tags_string ? data.tags_string.split(',') : [] });
                setTotalLikes(parseInt(data.total_likes, 10));
                setLiked(data.is_liked_by_user === 1);
                setCode({ html: data.code_html || '', css: data.code_css || '', js: data.code_js || '' });
                setLoading(false);
                if (!viewCountedRef.current) {
                    sendInteraction(data.id, 'view');
                    viewCountedRef.current = true;
                }
            })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [id, loggedInUser]);
    
    const handleCodeChange = (value, editorName) => setCode(prev => ({ ...prev, [editorName]: value }));

    const handleLikeToggle = () => {
        if (!loggedInUser) return showMessage("Please log in to like this project.", "error");
        const originalLikedState = liked;
        const newLiked = !originalLikedState;
        setLiked(newLiked);
        setTotalLikes(prev => newLiked ? prev + 1 : prev - 1);
        sendInteraction(project.id, newLiked ? 'like' : 'unlike', loggedInUser.id)
            .then(data => { if (data?.status === 'success' && data.newTotal !== undefined) setTotalLikes(data.newTotal); else { setLiked(originalLikedState); setTotalLikes(prev => newLiked ? prev - 1 : prev + 1); } })
            .catch(() => { setLiked(originalLikedState); setTotalLikes(prev => newLiked ? prev - 1 : prev + 1); showMessage("Could not update like status.", "error"); });
    };

    const handleSave = async () => {
        if (!loggedInUser) return showMessage('You must be logged in to save.', 'error');
        setIsSaving(true);
        const payload = { project_id: project.id, user_id: loggedInUser.id, code_html: code.html, code_css: code.css, code_js: code.js };
        try {
            const res = await fetch('https://dreamcoded.com/api/update.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            showMessage(data.message, data.status);
        } catch (err) { showMessage('An error occurred while saving.', 'error'); } 
        finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch('https://dreamcoded.com/api/delete.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: project.id, user_id: loggedInUser.id }) });
            const data = await res.json();
            if (data.status === 'success') { showMessage('Project deleted!', 'success'); setTimeout(() => navigate('/'), 500); } 
            else { showMessage(data.message, 'error'); }
        } catch (err) { showMessage('An error occurred.', 'error'); } 
        finally { setIsDeleting(false); }
    };
    
    const handleOpenModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleDetailsUpdate = async (updatedDetails) => {
        setIsSaving(true);
        const payload = { project_id: project.id, user_id: loggedInUser.id, title: updatedDetails.title, description: updatedDetails.description, tags: updatedDetails.tags.join(','), };
        try {
            const res = await fetch('https://dreamcoded.com/api/update.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            showMessage(data.message, data.status);
            if (data.status === 'success') {
                setProject(prev => ({ ...prev, ...updatedDetails, tags_string: payload.tags }));
                setIsModalOpen(false);
            }
        } catch (err) { showMessage('An error occurred.', 'error'); } 
        finally { setIsSaving(false); }
    };

    const handleThemeChange = (e) => {
        const newTheme = e.target.value;
        setEditorTheme(newTheme);
        localStorage.setItem('dreamcoded_editor_theme', newTheme);
    };

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        localStorage.setItem('dreamcoded_layout', newLayout);
    };

    const createIframeContent = () => `<!DOCTYPE html><html><head><style>${code.css}</style></head><body>${code.html}<script>${code.js}</script></body></html>`;

    if (loading) return <p className="page-message">Loading Project...</p>;
    if (error) return <p className="page-message error">Error: {error}</p>;
    if (!project) return <p className="page-message">Project could not be loaded.</p>;

    const isOwner = loggedInUser && loggedInUser.id === project.user_id;

    if (project.project_type === 'live') {
        return <div className="live-project-full-page"><img src={project.image_url} alt={`${project.title} preview`} className="preview-image-full" /><div className="overlay-full"><h1>{project.title}</h1><p>by <Link to={`/user/${project.author}`}>{project.author}</Link></p><a href={project.project_url} target="_blank" rel="noopener noreferrer" className="visit-site-button">Visit Live Site</a></div></div>;
    }

    return (
        <div className="codepen-layout-wrapper">
            <header className="project-header">
                <h1 className="project-title">{project.title}</h1>
                <div className="author-section">
                    <img src={project.author_avatar_url ? `https://dreamcoded.com${project.author_avatar_url}?v=${Date.now()}` : `https://ui-avatars.com/api/?name=${project.author}&background=111&color=fff`} alt={project.author} className="author-avatar"/>
                    <Link to={`/user/${project.author}`} className="author-name-link">{project.author}</Link>
                </div>
                <div className="stats-section">
                    <div className="stat-display"><span>❤️</span> {totalLikes.toLocaleString()}</div>
                    <div className="stat-display"><span>👁️</span> {(parseInt(project.total_views, 10)).toLocaleString()}</div>
                </div>
                <div className="actions-section">
                    <div className="view-controls">
                        <button onClick={() => handleLayoutChange('vertical')} className={`header-button view-btn ${layout === 'vertical' ? 'active' : ''}`} title="Top/Bottom View"><ViewTopIcon /></button>
                        <button onClick={() => handleLayoutChange('left')} className={`header-button view-btn ${layout === 'left' ? 'active' : ''}`} title="Code Left View"><ViewLeftIcon /></button>
                        <button onClick={() => handleLayoutChange('right')} className={`header-button view-btn ${layout === 'right' ? 'active' : ''}`} title="Code Right View"><ViewRightIcon /></button>
                    </div>
                    {isOwner && (
                        <>
                            <button onClick={() => handleOpenModal('editDetails')} className="header-button edit-btn">Edit Details</button>
                            <button onClick={handleSave} disabled={isSaving || isDeleting} className="header-button save-btn">{isSaving ? 'Saving...' : 'Save Code'}</button>
                            <button onClick={handleDelete} disabled={isSaving || isDeleting} className="header-button delete-btn">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                        </>
                    )}
                    <button onClick={handleLikeToggle} disabled={isDeleting} className={`header-button like-btn ${liked ? 'liked' : ''}`}>{liked ? 'Unlike' : 'Like'}</button>
                    <div className="theme-select-wrapper">
                        <label htmlFor="theme-select" className="theme-label">Theme:</label>
                        <select id="theme-select" className="theme-select" value={editorTheme} onChange={handleThemeChange}>
                            <option value="dracula">Dracula</option>
                            <option value="material">Material</option>
                            <option value="github">GitHub Dark</option>
                        </select>
                    </div>
                </div>
            </header>

            {windowWidth < 768 ? (
                <MobileView code={code} createIframeContent={createIframeContent} handleCodeChange={handleCodeChange} themeMap={themeMap} editorTheme={editorTheme} handleThemeChange={handleThemeChange} />
            ) : (
                <DesktopLayout layout={layout} code={code} handleCodeChange={handleCodeChange} themeMap={themeMap} editorTheme={editorTheme} createIframeContent={createIframeContent} projectTitle={project?.title} />
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent === 'editDetails' ? 'Edit Project Details' : 'Settings'}>
                {modalContent === 'editDetails' && project && (
                    <EditDetailsForm project={project} onSave={handleDetailsUpdate} onCancel={() => setIsModalOpen(false)} />
                )}
            </Modal>
        </div>
    );
};

export default ProjectDetailPage;