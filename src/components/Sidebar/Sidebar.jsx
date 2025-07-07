import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

// --- New, Upgraded Search Modal Component ---
const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('projects'); // 'projects', 'users', 'tags'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // This useEffect triggers a search whenever the user stops typing
  useEffect(() => {
    // If the search term is empty, clear results and stop loading.
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      fetch(`https://dreamcoded.com/api/search.php?q=${encodeURIComponent(searchTerm)}&type=${searchType}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Search failed:", err);
          setLoading(false);
        });
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler); // Cleanup the timeout
    };
  }, [searchTerm, searchType]);

  // Effect to handle closing the modal with the Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the input when the modal opens
      setTimeout(() => {
        document.getElementById('search-modal-input')?.focus();
      }, 100);
    }
    
    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleResultClick = (path) => {
    onClose();
    navigate(path);
  };

  const renderResults = () => {
    if (loading) return <div className="result-item loading">Searching...</div>;
    if (results.length === 0 && searchTerm.length > 1) return <div className="result-item">No results found.</div>;

    switch (searchType) {
        case 'users':
          return results.map(user => (
            <div
              key={user.id}
              className="result-item user-result"
              onClick={() => handleResultClick(`/user/${user.username}`)}
            >
              <img
                src={
                  user.avatar_url
                    ? `https://dreamcoded.com${user.avatar_url}?v=${Date.now()}`
                    : `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=161b22&color=c9d1d9`
                }
                alt={user.username}
              />
              <span>{user.first_name} {user.last_name} (@{user.username})</span>
            </div>
          ));
        case 'tags':
            // We would need to update the homepage to handle a /tag/:tagName route
            return results.map(tag => (
                <div key={tag.name} className="result-item" onClick={() => handleResultClick(`/`)}>
                    <span>#{tag.name}</span>
                    <span className="tag-count">{tag.count} projects</span>
                </div>
            ));
        default: // projects
            return results.map(project => (
                <div key={project.id} className="result-item project-result" onClick={() => handleResultClick(`/project/${project.id}`)}>
                    <img src={project.image_url || `https://placehold.co/40x40/161b22/8b949e?text=...`} alt={project.title} />
                    <span>{project.title}</span>
                </div>
            ));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-modal-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            id="search-modal-input" type="text"
            placeholder="Search..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-modal-input"
          />
        </div>
        <div className="search-type-selector">
          <button onClick={() => setSearchType('projects')} className={searchType === 'projects' ? 'active' : ''}>Projects</button>
          <button onClick={() => setSearchType('tags')} className={searchType === 'tags' ? 'active' : ''}>Tags</button>
          <button onClick={() => setSearchType('users')} className={searchType === 'users' ? 'active' : ''}>Users</button>
        </div>
        <div className="search-results-container">
          {renderResults()}
        </div>
      </div>
    </div>
  );
};


const Sidebar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <aside className="sidebar-container">
        <div className="sidebar-logo">
            <Link to="/">
                <img 
                    src="https://dreamcoded.com/assets/images/dreamcoded_moon.png" 
                    alt="DreamCoded Logo" 
                    className="sidebar-logo-img" 
                />
            </Link>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} title="Home">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </NavLink>
          <button className="nav-link" title="Search" onClick={() => setIsSearchOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <NavLink to="/submit" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} title="Submit">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </NavLink>
        </nav>
      </aside>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Sidebar;