import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { useMessage } from '../../context/MessageContext';
import './ProjectDetailPage.css';

// --- Reusable Components ---

function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        if (isOpen) { document.addEventListener('keydown', handleKeyDown); }
        return () => { document.removeEventListener('keydown', handleKeyDown); };
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
                <button type="button" className="modal-button secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="modal-button primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};


// --- Project Detail Components ---

const PlaygroundHeader = ({ project, onLike, onSave, onDelete, onEdit, isOwner, isSaving, isDeleting, liked, totalLikes }) => (
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
            <button onClick={onLike} disabled={isDeleting} className={`action-btn like-btn ${liked ? 'liked' : ''}`}>
                {liked ? 'Unlike' : 'Like'}
            </button>
            {isOwner && (
                <>
                    <button onClick={onEdit} className="action-btn">Edit</button>
                    <button onClick={onSave} disabled={isSaving || isDeleting} className="action-btn">
                        {isSaving ? 'Saving...' : 'Save Code'}
                    </button>
                    <button onClick={onDelete} disabled={isSaving || isDeleting} className="action-btn">
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </>
            )}
        </div>
    </header>
);

const DesktopPlayground = ({ code, onCodeChange, iframeRef }) => (
    <PanelGroup direction="vertical" className="main-panel-group">
        <Panel defaultSize={60} minSize={20}>
            <PanelGroup direction="horizontal">
                <Panel defaultSize={33} minSize={10} className="editor-panel">
                    <div className="editor-label">HTML</div>
                    <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.html} height="100%" theme={dracula} extensions={[html()]} onChange={(v) => onCodeChange(v, 'html')} />
                </Panel>
                <PanelResizeHandle className="resize-handle horizontal" />
                <Panel defaultSize={33} minSize={10} className="editor-panel">
                    <div className="editor-label">CSS</div>
                    <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.css} height="100%" theme={dracula} extensions={[css()]} onChange={(v) => onCodeChange(v, 'css')} />
                </Panel>
                <PanelResizeHandle className="resize-handle horizontal" />
                <Panel defaultSize={34} minSize={10} className="editor-panel">
                    <div className="editor-label">JavaScript</div>
                    <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.js} height="100%" theme={dracula} extensions={[javascript()]} onChange={(v) => onCodeChange(v, 'js')} />
                </Panel>
            </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle vertical" />
        <Panel defaultSize={40} minSize={20}>
            <div className="preview-pane"><iframe ref={iframeRef} title="Live Preview" sandbox="allow-scripts allow-same-origin" className="live-preview-iframe" /></div>
        </Panel>
    </PanelGroup>
);

const MobilePlayground = ({ code, onCodeChange, iframeRef, activeTab, setActiveTab }) => {
    const [viewMode, setViewMode] = useState('mobile');

    const renderContent = () => {
        if (viewMode === 'web') {
            return <DesktopPlayground code={code} onCodeChange={onCodeChange} iframeRef={iframeRef} />;
        }
        switch (activeTab) {
            case 'html': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.html} height="100%" theme={dracula} extensions={[html()]} onChange={(v) => onCodeChange(v, 'html')} />;
            case 'css': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.css} height="100%" theme={dracula} extensions={[css()]} onChange={(v) => onCodeChange(v, 'css')} />;
            case 'js': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.js} height="100%" theme={dracula} extensions={[javascript()]} onChange={(v) => onCodeChange(v, 'js')} />;
            case 'preview': return <iframe ref={iframeRef} title="Live Preview" sandbox="allow-scripts allow-same-origin" className="live-preview-iframe" />;
            default: return null;
        }
    };

    return (
        <div className="playground-mobile-container">
            <div className="mobile-header">
                <div className="mobile-tab-nav">
                    {viewMode === 'mobile' && ['html', 'css', 'js', 'preview'].map(tab => (
                        <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>
                            {tab.toUpperCase()}
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
    const windowWidth = useWindowWidth();
    const loggedInUser = useMemo(() => JSON.parse(localStorage.getItem('dreamcodedUser')), []);
    
    const iframeRef = useRef(null);
    const viewCountedRef = useRef(false);

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState({ html: '', css: '', js: '' });
    const [liked, setLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState('html');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const debouncedCode = useDebounce(code);
    
    useEffect(() => {
        const userIdParam = loggedInUser ? `&user_id=${loggedInUser.id}` : '';
        fetch(`https://dreamcoded.com/api/project.php?id=${id}${userIdParam}&t=${Date.now()}`)
            .then(res => res.ok ? res.json() : Promise.reject('Project not found'))
            .then(data => {
                const tagsArray = data.tags_string ? data.tags_string.split(',').filter(t => t) : [];
                setProject({ ...data, tags: tagsArray });
                setCode({ html: data.code_html || '', css: data.code_css || '', js: data.code_js || '' });
                setTotalLikes(parseInt(data.total_likes, 10) || 0);
                setLiked(data.is_liked_by_user === 1);
                if (!viewCountedRef.current) {
                    // This can be moved to an API service file
                    fetch('https://dreamcoded.com/api/interact.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: data.id, action: 'view' }) });
                    viewCountedRef.current = true;
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, loggedInUser]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        if (windowWidth < 768 && activeMobileTab !== 'preview') return;

        const htmlContent = `<!DOCTYPE html><html><head><style>${debouncedCode.css}</style></head><body>${debouncedCode.html}<script>try { ${debouncedCode.js} } catch(e) { console.error(e) }</script></body></html>`;
        iframe.srcdoc = htmlContent;
    }, [debouncedCode, activeMobileTab, windowWidth]);

    const handleCodeChange = (value, editorName) => {
        if (!project || (loggedInUser?.id !== project.user_id)) {
            showMessage("You can't edit this project.", "error");
            return;
        }
        setCode(prev => ({ ...prev, [editorName]: value }));
    };

    const handleLikeToggle = () => {
        if (!loggedInUser) return showMessage("Please log in to like.", "error");
        // ... (like logic remains the same)
    };
    
    const handleSaveCode = async () => {
        setIsSaving(true);
        const payload = { project_id: project.id, user_id: loggedInUser.id, ...code };
        try {
            const res = await fetch('https://dreamcoded.com/api/update.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            showMessage(data.message, data.status);
        } catch (err) {
            showMessage('An error occurred while saving.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDetailsUpdate = async (updatedDetails) => {
        const payload = {
            project_id: project.id,
            user_id: loggedInUser.id,
            title: updatedDetails.title,
            description: updatedDetails.description,
            tags: updatedDetails.tags.join(','),
        };
        try {
            const res = await fetch('https://dreamcoded.com/api/update.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.status === 'success') {
                setProject(prev => ({ ...prev, ...updatedDetails, tags: updatedDetails.tags }));
                setIsModalOpen(false);
                showMessage('Details updated successfully!', 'success');
            } else {
                showMessage(data.message, 'error');
            }
        } catch (err) {
            showMessage('An error occurred while updating details.', 'error');
        }
    };
    
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this Dream? This cannot be undone.")) return;
        setIsDeleting(true);
        try {
            const res = await fetch('https://dreamcoded.com/api/delete.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: project.id, user_id: loggedInUser.id }) });
            const data = await res.json();
            if (data.status === 'success') {
                showMessage('Dream deleted!', 'success');
                navigate('/');
            } else {
                showMessage(data.message, 'error');
            }
        } catch (err) {
            showMessage('An error occurred.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <p className="page-message">Loading Dream...</p>;
    if (error) return <p className="page-message error">Error: {error}</p>;
    if (!project) return <p className="page-message">Project could not be loaded.</p>;
    
    const isOwner = loggedInUser && loggedInUser.id === project.user_id;

    return (
        <div className="page-container">
            <div className="playground-container">
                <PlaygroundHeader
                    project={project}
                    onLike={handleLikeToggle}
                    onSave={handleSaveCode}
                    onDelete={handleDelete}
                    onEdit={() => setIsModalOpen(true)}
                    isOwner={isOwner}
                    isSaving={isSaving}
                    isDeleting={isDeleting}
                    liked={liked}
                    totalLikes={totalLikes}
                />
                {windowWidth < 768 ? (
                    <MobilePlayground code={code} onCodeChange={handleCodeChange} iframeRef={iframeRef} activeTab={activeMobileTab} setActiveTab={setActiveMobileTab} />
                ) : (
                    <DesktopPlayground code={code} onCodeChange={handleCodeChange} iframeRef={iframeRef} />
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Dream Details">
                <EditDetailsForm project={project} onSave={handleDetailsUpdate} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ProjectDetailPage;