import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { useMessage } from '../../context/MessageContext';
import './SubmitPage.css';

// A custom hook for debouncing
function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// Reusable Modal Component
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
                <div className="modal-header"><h3 className="modal-title">{title}</h3><button onClick={onClose} className="modal-close-btn">&times;</button></div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

// Form for editing details inside the modal
const EditDetailsForm = ({ initialDescription, initialTags, onSave, onCancel }) => {
    const [description, setDescription] = useState(initialDescription);
    const [tags, setTags] = useState(initialTags);
    const [tagInput, setTagInput] = useState('');
    const MAX_DESC_LENGTH = 300;

    const handleDescChange = (e) => {
        if (e.target.value.length <= MAX_DESC_LENGTH) {
            setDescription(e.target.value);
        }
    };
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
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!description.trim()) {
            alert("Description cannot be empty.");
            return;
        }
        onSave({ description, tags });
    };

    return (
        <form onSubmit={handleFormSubmit} className="edit-details-form">
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={description} onChange={handleDescChange} rows="5" required />
                <small className="char-counter">{description.length} / {MAX_DESC_LENGTH}</small>
            </div>
            <div className="form-group">
                <label>Tags (up to 3)</label>
                <div className="tag-input-container">{tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => removeTag(tag)}>&times;</button></div>))}<input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length<3 ? 'Add a tag...' : 'Max tags'} disabled={tags.length>=3} /></div>
            </div>
            <div className="modal-footer"><button type="button" className="modal-button secondary" onClick={onCancel}>Cancel</button><button type="submit" className="modal-button primary">Save Details</button></div>
        </form>
    );
};

const PlaygroundMobileView = ({ details, code, tags, tagInput, onDetailChange, onCodeChange, onTagChange, onTagKeyDown, onRemoveTag, iframeRef, activeTab, setActiveTab, handleSubmit, isLoading }) => {
    const [viewMode, setViewMode] = useState('mobile');

    const renderContent = () => {
        if (viewMode === 'web') {
            return (
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
        }

        switch (activeTab) {
            case 'details':
                return (
                    <div className="mobile-details-form">
                        <input type="text" name="title" placeholder="Project Title" value={details.title} onChange={onDetailChange} required />
                        <textarea name="description" placeholder="Project Description" value={details.description} onChange={onDetailChange} required rows="3" />
                        <div className="tag-input-container">
                            {tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => onRemoveTag(tag)}>&times;</button></div>))}
                            <input type="text" value={tagInput} onChange={onTagChange} onKeyDown={onTagKeyDown} placeholder={tags.length < 3 ? 'Add a tag...' : ''} disabled={tags.length >= 3} />
                        </div>
                    </div>
                );
            case 'html': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.html} height="100%" theme={dracula} extensions={[html()]} onChange={(v) => onCodeChange(v, 'html')} />;
            case 'css': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.css} height="100%" theme={dracula} extensions={[css()]} onChange={(v) => onCodeChange(v, 'css')} />;
            case 'js': return <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.js} height="100%" theme={dracula} extensions={[javascript()]} onChange={(v) => onCodeChange(v, 'js')} />;
            case 'preview': return ( <iframe ref={iframeRef} title="Live Preview" sandbox="allow-scripts allow-same-origin" className="playground-preview-iframe" /> );
            default: return null;
        }
    };

    return (
        <div className="playground-mobile-container">
            <div className="mobile-header">
                <div className="mobile-tab-nav">
                    {viewMode === 'mobile' && ['details', 'html', 'css', 'js', 'preview'].map(tab => (<button type="button" key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>{tab.toUpperCase()}</button>))}
                </div>
                <button onClick={() => setViewMode(prev => prev === 'mobile' ? 'web' : 'mobile')} className="view-toggle-btn">
                    {viewMode === 'mobile' ? 'Web View' : 'Mobile View'}
                </button>
            </div>
            <div className="mobile-tab-content">{renderContent()}</div>
            <button onClick={handleSubmit} className="submit-btn-mobile" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Project'}</button>
        </div>
    );
};


// --- Main Submit Page Component ---
const SubmitPage = () => {
    const navigate = useNavigate();
    const { showMessage } = useMessage();
    const windowWidth = useWindowWidth();

    const [projectType, setProjectType] = useState('playground');
    const [activeMobileTab, setActiveMobileTab] = useState('details');
    const [isLoading, setIsLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [details, setDetails] = useState({ title: '', description: '', image_url: '', project_url: '' });
    const [code, setCode] = useState({ html: '', css: '', js: '' });
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const iframeRef = useRef(null);
    const debouncedCode = useDebounce(code, 300);
    const loggedInUser = useMemo(() => JSON.parse(localStorage.getItem('dreamcodedUser')), []);

    const handleDetailChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });
    const handleCodeChange = (value, editorName) => setCode(prev => ({ ...prev, [editorName]: value }));
    const handleTagInputChange = (e) => setTagInput(e.target.value);
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

    const handleSaveDetailsFromModal = (newDetails) => {
        setDetails(prev => ({ ...prev, description: newDetails.description }));
        setTags(newDetails.tags);
        setShowDetailsModal(false);
        showMessage("Details updated locally. Don't forget to submit your Dream!", "success");
    };

    // In SubmitPage.jsx, replace the whole handleSubmit function

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      showMessage("You must be logged in.", "error");
      return;
    }
    // Add validation for required fields before submitting
    if (!details.title) {
        return showMessage("A title is required.", "error");
    }
    if (projectType === 'live' && !details.image_url) {
        return showMessage("An image URL is required for live projects.", "error");
    }

    setIsLoading(true);
    const submissionData = {
      ...details,
      ...(projectType === 'playground' && {
        code_html: code.html,
        code_css: code.css,
        code_js: code.js
      }),
      user_id: loggedInUser.id,
      project_type: projectType,
      tags: tags.join(',')
    };

    try {
      const response = await fetch('https://dreamcoded.com/api/submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();

      // THE FIX: We only need to check for the success status.
      // The backend will only give a success status if everything worked, including getting an app_id.
      if (data.status === 'success') {
        showMessage('Dream submitted successfully!', 'success'); // This will now be green

        // Also, navigate to the new Dream's page instead of the profile page.
        navigate(`/profile/${loggedInUser.username}`);
      } else {
        showMessage(data.message || 'An unknown error occurred.', 'error');
      }

    } catch {
      showMessage('A network error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || projectType !== 'playground') return;
        const safeJs = `try { ${debouncedCode.js} } catch(e) {}`;
        const htmlContent = `<!DOCTYPE html><html><head><style>${debouncedCode.css}</style></head><body>${debouncedCode.html}<script>${safeJs}</script></body></html>`;
        iframe.srcdoc = htmlContent;
    }, [debouncedCode, projectType, activeMobileTab]);

    const renderPlaygroundView = () => (
        <div className="playground-container">
            {windowWidth >= 768 && (
                <header className="playground-header">
                    <div className="header-details">
                        <input type="text" name="title" placeholder="Dream Title" value={details.title} onChange={handleDetailChange} required className="playground-title-input" />
                        <button type="button" className="edit-details-btn" onClick={() => setShowDetailsModal(true)}>Edit Details</button>
                    </div>
                    <button onClick={handleSubmit} className="submit-btn" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit'}</button>
                </header>
            )}
            {windowWidth < 768 ? (
                <PlaygroundMobileView details={details} code={code} tags={tags} tagInput={tagInput} onDetailChange={handleDetailChange} onCodeChange={handleCodeChange} onTagChange={handleTagInputChange} onTagKeyDown={handleTagKeyDown} onRemoveTag={removeTag} iframeRef={iframeRef} activeTab={activeMobileTab} setActiveTab={setActiveMobileTab} handleSubmit={handleSubmit} isLoading={isLoading} windowWidth={windowWidth}/>
            ) : (
                <PanelGroup direction="vertical" className="main-panel-group">
                    <Panel defaultSize={60} minSize={20}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={33} minSize={10} className="editor-panel">
                                <div className="editor-label">HTML</div>
                                <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.html} height="100%" theme={dracula} extensions={[html()]} onChange={(v) => handleCodeChange(v, 'html')} />
                            </Panel>
                            <PanelResizeHandle className="resize-handle horizontal" />
                            <Panel defaultSize={33} minSize={10} className="editor-panel">
                                <div className="editor-label">CSS</div>
                                <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.css} height="100%" theme={dracula} extensions={[css()]} onChange={(v) => handleCodeChange(v, 'css')} />
                            </Panel>
                            <PanelResizeHandle className="resize-handle horizontal" />
                            <Panel defaultSize={34} minSize={10} className="editor-panel">
                                <div className="editor-label">JavaScript</div>
                                <CodeMirror style={{ height: '100%', overflow: 'auto' }} value={code.js} height="100%" theme={dracula} extensions={[javascript()]} onChange={(v) => handleCodeChange(v, 'js')} />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <PanelResizeHandle className="resize-handle vertical" />
                    <Panel defaultSize={40} minSize={20}>
                        <div className="preview-pane"><iframe ref={iframeRef} title="Live Preview" sandbox="allow-scripts allow-same-origin" className="live-preview-iframe" /></div>
                    </Panel>
                </PanelGroup>
            )}
        </div>
    );

    const renderLiveView = () => (
        <form onSubmit={handleSubmit} className="live-form-container">
            <header className="submit-header"><h1>Submit a Live Project</h1><p>Share your creation by providing links to its resources.</p></header>
            <fieldset className="form-section">
                <legend>Project Details</legend>
                <div className="form-group"><label>Title</label><input type="text" name="title" value={details.title} onChange={handleDetailChange} required /></div>
                <div className="form-group"><label>Description</label><textarea name="description" value={details.description} onChange={handleDetailChange} rows="3" required></textarea></div>
                <div className="form-group"><label>Tags (up to 3)</label><div className="tag-input-container">{tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => removeTag(tag)}>&times;</button></div>))}<input type="text" value={tagInput} onChange={handleTagInputChange} onKeyDown={handleTagKeyDown} placeholder={tags.length < 3 ? 'Add a tag...' : ''} disabled={tags.length >= 3} /></div></div>
            </fieldset>
            <fieldset className="form-section">
                <legend>Links</legend>
                <div className="form-group"><label>Image URL</label><input type="url" name="image_url" value={details.image_url} onChange={handleDetailChange} required /></div>
                <div className="form-group"><label>Project URL</label><input type="url" name="project_url" value={details.project_url} onChange={handleDetailChange} required /></div>
            </fieldset>
            <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Project'}</button>
        </form>
    );

    return (
        <div className="submit-page-container">
            <div className="project-type-toggle">
                <button type="button" onClick={() => setProjectType('playground')} className={projectType === 'playground' ? 'active' : ''}>Playground</button>
                <button type="button" onClick={() => setProjectType('live')} className={projectType === 'live' ? 'active' : ''}>Live Project</button>
            </div>
            {projectType === 'playground' ? renderPlaygroundView() : renderLiveView()}
            <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Edit Details">
                <EditDetailsForm initialDescription={details.description} initialTags={tags} onSave={handleSaveDetailsFromModal} onCancel={() => setShowDetailsModal(false)} />
            </Modal>
        </div>
    );
};

export default SubmitPage;