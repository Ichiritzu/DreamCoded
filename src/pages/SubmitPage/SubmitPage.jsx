import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext';
import './SubmitPage.css';

const SubmitPage = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const [projectType, setProjectType] = useState('playground');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    demo_url: '',
    code_html: '',
    code_css: '',
    code_js: '',
  });
  
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loggedInUser = useMemo(() => {
    const storedUser = localStorage.getItem('dreamcodedUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleTagInputChange = (e) => { setTagInput(e.target.value); };
  
  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() !== '') {
      e.preventDefault();
      if (tags.length < 5 && !tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loggedInUser) {
        showMessage("You must be logged in to submit a project.", "error");
        return;
    }
    
    setIsLoading(true);
    
    const submissionData = {
      ...formData,
      user_id: loggedInUser.id,
      project_type: projectType,
      tags: tags.join(',')
    };

    const apiUrl = 'https://dreamcoded.com/api/submit.php';

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        showMessage('Project submitted successfully!');
        setTimeout(() => navigate('/'), 500);
      } else {
        showMessage(data.message, 'error');
      }
    })
    .catch(error => {
        showMessage('A network error occurred. Please try again.', 'error');
        console.error('Submit Error:', error);
    })
    .finally(() => { setIsLoading(false); });
  };

  const createIframeContent = () => `<!DOCTYPE html><html><head><style>${formData.code_css}</style></head><body>${formData.code_html}<script>${formData.code_js}</script></body></html>`;

  return (
    <div className="submit-page-container">
      <form onSubmit={handleSubmit} className="submit-form-redesigned">
        <div className="form-main-column">
            <header className="submit-header">
              <h1>Submit Your Project</h1>
              <p>Share your amazing creation with the DreamCoded community.</p>
            </header>

            <fieldset className="form-section project-type-selector">
                <legend>Project Type</legend>
                <div className="radio-group">
                  <label className={projectType === 'playground' ? 'active' : ''}><input type="radio" name="projectType" value="playground" checked={projectType === 'playground'} onChange={(e) => setProjectType(e.target.value)} />Playground</label>
                  <label className={projectType === 'live' ? 'active' : ''}><input type="radio" name="projectType" value="live" checked={projectType === 'live'} onChange={(e) => setProjectType(e.target.value)} />Live Project</label>
                </div>
            </fieldset>

            <fieldset className="form-section">
                <legend>Project Details</legend>
                <div className="form-group"><label htmlFor="title">Project Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required /></div>
                <div className="form-group"><label htmlFor="description">Description</label><textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" required></textarea></div>
                <div className="form-group"><label htmlFor="tags">Tags (up to 5)</label><div className="tag-input-container">{tags.map((tag, i) => (<div key={i} className="tag-pill">{tag}<button type="button" onClick={() => removeTag(tag)}>&times;</button></div>))}<input type="text" id="tags" value={tagInput} onChange={handleTagInputChange} onKeyDown={handleTagKeyDown} placeholder={tags.length<5?'Add a tag and press Enter...':'Maximum 5 tags reached'} disabled={tags.length>=5} /></div></div>
            </fieldset>
            
            {projectType === 'playground' ? (
              <fieldset className="form-section code-section"><legend>Code Snippets</legend><div className="form-group"><label htmlFor="code_html">HTML</label><textarea className="code-editor" id="code_html" name="code_html" value={formData.code_html} onChange={handleInputChange} rows="6"></textarea></div><div className="form-group"><label htmlFor="code_css">CSS</label><textarea className="code-editor" id="code_css" name="code_css" value={formData.code_css} onChange={handleInputChange} rows="6"></textarea></div><div className="form-group"><label htmlFor="code_js">JavaScript</label><textarea className="code-editor" id="code_js" name="code_js" value={formData.code_js} onChange={handleInputChange} rows="6"></textarea></div></fieldset>
            ) : (
              <fieldset className="form-section"><legend>Links & Media</legend><div className="form-group"><label htmlFor="image_url">Image URL (Preview)</label><input type="url" id="image_url" name="image_url" value={formData.image_url} onChange={handleInputChange} placeholder="https://..." required/></div><div className="form-group"><label htmlFor="project_url">Live Project URL</label><input type="url" id="project_url" name="project_url" value={formData.project_url} onChange={handleInputChange} placeholder="https://..." required/></div><div className="form-group"><label htmlFor="demo_url">Video Demo URL (Optional)</label><input type="url" id="demo_url" name="demo_url" value={formData.demo_url} onChange={handleInputChange} placeholder="https://youtube.com/..." /></div></fieldset>
            )}
            
            <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Project'}</button>
        </div>

        <div className="form-secondary-column preview-column">
            <div className="preview-wrapper">
                <div className="preview-label">Live Preview</div>
                {projectType === 'playground' ? (
                    <iframe srcDoc={createIframeContent()} title="Live Preview" sandbox="allow-scripts" className="form-preview-iframe" />
                ) : (
                    formData.image_url ? 
                        <img src={formData.image_url} alt="Project preview" className="form-preview-image" /> : 
                        <div className="preview-placeholder">Enter an image URL to see a preview</div>
                )}
            </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitPage;
