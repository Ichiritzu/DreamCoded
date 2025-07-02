import React, { useState, useMemo } from 'react';
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

// Mobile view for the Playground
const PlaygroundMobileView = ({ details, code, tags, tagInput, onDetailChange, onCodeChange, onTagChange, onTagKeyDown, onRemoveTag }) => {
    const [activeTab, setActiveTab] = useState('details');

    const renderContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="mobile-details-form">
                        <input type="text" name="title" placeholder="Project Title" value={details.title} onChange={onDetailChange} required />
                        <textarea name="description" placeholder="Project Description" value={details.description} onChange={onDetailChange} required rows="3" />
                        <div className="tag-input-container">
                            {tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => onRemoveTag(tag)}>&times;</button></div>))}
                            <input type="text" value={tagInput} onChange={onTagChange} onKeyDown={onTagKeyDown} placeholder={tags.length<5 ? 'Add a tag...' : ''} disabled={tags.length>=5} />
                        </div>
                    </div>
                );
            case 'html':
                return <CodeMirror value={code.html} height="100%" theme={dracula} extensions={[html()]} onChange={(v) => onCodeChange(v, 'html')} basicSetup={{ lineNumbers: true, foldGutter: true }} />;
            case 'css':
                return <CodeMirror value={code.css} height="100%" theme={dracula} extensions={[css()]} onChange={(v) => onCodeChange(v, 'css')} basicSetup={{ lineNumbers: true, foldGutter: true }} />;
            case 'js':
                return <CodeMirror value={code.js} height="100%" theme={dracula} extensions={[javascript()]} onChange={(v) => onCodeChange(v, 'js')} basicSetup={{ lineNumbers: true, foldGutter: true }} />;
            case 'preview':
                const iframeContent = `<!DOCTYPE html><html><head><style>${code.css}</style></head><body>${code.html}<script>${code.js}</script></body></html>`;
                return <iframe srcDoc={iframeContent} title="Live Preview" sandbox="allow-scripts" className="playground-preview-iframe" />;
            default:
                return null;
        }
    };
    
    return (
        <div className="playground-mobile-container">
            <div className="mobile-tab-nav">
                <button type="button" onClick={() => setActiveTab('details')} className={activeTab === 'details' ? 'active' : ''}>Details</button>
                <button type="button" onClick={() => setActiveTab('html')} className={activeTab === 'html' ? 'active' : ''}>HTML</button>
                <button type="button" onClick={() => setActiveTab('css')} className={activeTab === 'css' ? 'active' : ''}>CSS</button>
                <button type="button" onClick={() => setActiveTab('js')} className={activeTab === 'js' ? 'active' : ''}>JS</button>
                <button type="button" onClick={() => setActiveTab('preview')} className={activeTab === 'preview' ? 'active' : ''}>Preview</button>
            </div>
            <div className="mobile-tab-content">
                {renderContent()}
            </div>
        </div>
    );
};

const SubmitPage = () => {
    const navigate = useNavigate();
    const { showMessage } = useMessage();
    const windowWidth = useWindowWidth();

    const [projectType, setProjectType] = useState('playground');
    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState({
        title: '',
        description: '',
        image_url: '',
        project_url: '',
    });
    const [code, setCode] = useState({ html: '', css: '', js: '' });
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const loggedInUser = useMemo(() => JSON.parse(localStorage.getItem('dreamcodedUser')), []);

    const handleDetailChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });
    const handleCodeChange = (value, editorName) => setCode(prev => ({ ...prev, [editorName]: value }));
    const handleTagInputChange = (e) => setTagInput(e.target.value);
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!loggedInUser) {
            showMessage("You must be logged in.", "error");
            return;
        }
        setIsLoading(true);

        const submissionData = {
            ...details,
            ...(projectType === 'playground' && { code_html: code.html, code_css: code.css, code_js: code.js }),
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

            if (data.status === 'success' && data.project_id) {
                showMessage('Project submitted successfully!');
                navigate(`/project/${data.project_id}`);
            } else {
                showMessage(data.message || 'An unknown error occurred.', 'error');
            }
        } catch (error) {
            showMessage('A network error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const createIframeContent = () => `<!DOCTYPE html><html><head><style>${code.css}</style></head><body>${code.html}<script>${code.js}</script></body></html>`;

    const renderPlaygroundView = () => (
        <div className="playground-container">
            {windowWidth >= 768 && (
                <header className="playground-header">
                    <div className="header-details">
                        <input type="text" name="title" placeholder="Project Title" value={details.title} onChange={handleDetailChange} required className="playground-title-input" />
                        <input type="text" name="description" placeholder="Project Description" value={details.description} onChange={handleDetailChange} required className="playground-desc-input" />
                        <div className="tag-input-container">
                            {tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => removeTag(tag)}>&times;</button></div>))}
                            <input type="text" value={tagInput} onChange={handleTagInputChange} onKeyDown={handleTagKeyDown} placeholder={tags.length<5 ? 'Add a tag...' : ''} disabled={tags.length>=5} />
                        </div>
                    </div>
                    <button onClick={handleSubmit} className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </header>
            )}

            {windowWidth < 768 ? (
                <PlaygroundMobileView 
                    details={details}
                    code={code}
                    tags={tags}
                    tagInput={tagInput}
                    onDetailChange={handleDetailChange}
                    onCodeChange={handleCodeChange}
                    onTagChange={handleTagInputChange}
                    onTagKeyDown={handleTagKeyDown}
                    onRemoveTag={removeTag}
                />
            ) : (
                <PanelGroup direction="vertical" className="main-panel-group">
                    <Panel defaultSize={50} minSize={20}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={33} minSize={10} className="editor-panel">
                                <div className="editor-label">HTML</div>
                                <CodeMirror value={code.html} height="100%" theme={dracula} extensions={[html()]} onChange={(v) => handleCodeChange(v, 'html')} basicSetup={{ lineNumbers: true, foldGutter: true }} />
                            </Panel>
                            <PanelResizeHandle className="resize-handle horizontal" />
                            <Panel defaultSize={33} minSize={10} className="editor-panel">
                                <div className="editor-label">CSS</div>
                                <CodeMirror value={code.css} height="100%" theme={dracula} extensions={[css()]} onChange={(v) => handleCodeChange(v, 'css')} basicSetup={{ lineNumbers: true, foldGutter: true }} />
                            </Panel>
                            <PanelResizeHandle className="resize-handle horizontal" />
                            <Panel defaultSize={34} minSize={10} className="editor-panel">
                                <div className="editor-label">JavaScript</div>
                                <CodeMirror value={code.js} height="100%" theme={dracula} extensions={[javascript()]} onChange={(v) => handleCodeChange(v, 'js')} basicSetup={{ lineNumbers: true, foldGutter: true }} />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <PanelResizeHandle className="resize-handle vertical" />
                    <Panel defaultSize={50} minSize={20}>
                        <iframe srcDoc={createIframeContent()} title="Live Preview" sandbox="allow-scripts" className="playground-preview-iframe" />
                    </Panel>
                </PanelGroup>
            )}
            
            {windowWidth < 768 && (
                <button onClick={handleSubmit} className="submit-btn-mobile" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Project'}
                </button>
            )}
        </div>
    );

    const renderLiveView = () => (
        <form onSubmit={handleSubmit} className="live-form-container">
             <header className="submit-header">
                <h1>Submit a Live Project</h1>
                <p>Share your creation by providing links to its resources.</p>
            </header>
            <fieldset className="form-section">
                <legend>Project Details</legend>
                <div className="form-group"><label>Title</label><input type="text" name="title" value={details.title} onChange={handleDetailChange} required /></div>
                <div className="form-group"><label>Description</label><textarea name="description" value={details.description} onChange={handleDetailChange} rows="3" required></textarea></div>
                <div className="form-group"><label>Tags (up to 5)</label><div className="tag-input-container">{tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => removeTag(tag)}>&times;</button></div>))}<input type="text" value={tagInput} onChange={handleTagInputChange} onKeyDown={handleTagKeyDown} placeholder={tags.length<5?'Add a tag...':''} disabled={tags.length>=5} /></div></div>
            </fieldset>
            <fieldset className="form-section">
                <legend>Links & Media</legend>
                <div className="form-group"><label>Image URL (Preview)</label><input type="url" name="image_url" value={details.image_url} onChange={handleDetailChange} placeholder="https://..." required/></div>
                <div className="form-group"><label>Live Project URL</label><input type="url" name="project_url" value={details.project_url} onChange={handleDetailChange} placeholder="https://..." required/></div>
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
        </div>
    );
};

export default SubmitPage;