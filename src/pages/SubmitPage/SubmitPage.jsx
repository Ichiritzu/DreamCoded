import React, { useState } from 'react';
import './SubmitPage.css';

const SubmitPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    demo_url: '',
    code_html: '',
    code_css: '',
    code_js: ''
  });
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);
    
    // --- Get Logged-In User ---
    // Since this is a protected route, we can be confident this user data exists.
    const user = JSON.parse(localStorage.getItem('dreamcodedUser'));

    // A safety check in case something goes wrong
    if (!user || !user.id) {
        setMessage('Error: Could not find user information. Please log in again.');
        setIsError(true);
        setIsLoading(false);
        return;
    }

    // Add the real user ID to the data we're sending to the backend.
    const submissionData = {
      ...formData,
      user_id: user.id // <-- Using the dynamic user ID from localStorage
    };

    const apiUrl = 'https://dreamcoded.com/api/submit.php';

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })
    .then(response => response.json())
    .then(data => {
      setMessage(data.message);
      setIsError(data.status === 'error');
      if (data.status === 'success') {
        setFormData({
            title: '', description: '', image_url: '', 
            project_url: '', demo_url: '',
            code_html: '', code_css: '', code_js: ''
        });
      }
    })
    .catch(error => {
      console.error('Fetch Error:', error);
      setMessage('A network error occurred. Please try again.');
      setIsError(true);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="submit-page-container">
      <div className="submit-form-wrapper">
        <header className="submit-header">
          <h1>Submit Your Project</h1>
          <p>Share your amazing creation with the DreamCoded community.</p>
        </header>
        <form onSubmit={handleSubmit} className="submit-form">
          {/* Form fields remain the same... */}
          <fieldset className="form-section">
            <legend>Project Details</legend>
            <div className="form-group">
              <label htmlFor="title">Project Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" required></textarea>
            </div>
          </fieldset>
          
          <fieldset className="form-section">
            <legend>Code Snippets</legend>
             <div className="form-group">
              <label htmlFor="code_html">HTML</label>
              <textarea className="code-editor" id="code_html" name="code_html" value={formData.code_html} onChange={handleChange} rows="8"></textarea>
            </div>
             <div className="form-group">
              <label htmlFor="code_css">CSS</label>
              <textarea className="code-editor" id="code_css" name="code_css" value={formData.code_css} onChange={handleChange} rows="8"></textarea>
            </div>
             <div className="form-group">
              <label htmlFor="code_js">JavaScript</label>
              <textarea className="code-editor" id="code_js" name="code_js" value={formData.code_js} onChange={handleChange} rows="8"></textarea>
            </div>
          </fieldset>

           <fieldset className="form-section">
            <legend>Links & Media</legend>
             <div className="form-group">
              <label htmlFor="image_url">Image URL (Preview)</label>
              <input type="url" id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
            </div>
             <div className="form-group">
              <label htmlFor="project_url">Project URL (Live Demo, GitHub, etc.)</label>
              <input type="url" id="project_url" name="project_url" value={formData.project_url} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label htmlFor="demo_url">Video Demo URL (Optional)</label>
              <input type="url" id="demo_url" name="demo_url" value={formData.demo_url} onChange={handleChange} placeholder="https://youtube.com/..." />
            </div>
          </fieldset>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Project'}
          </button>
          
          {message && (
            <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubmitPage;

