import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SearchResultsPage.css';
// We can reuse the homepage's CSS for the gallery and cards
import '../HomePage/HomePage.css'; 

// This hook allows us to read the query parameters from the URL (e.g., ?q=...)
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
    const query = useQuery();
    const searchTerm = query.get('q'); // Get the value of the 'q' parameter

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (!searchTerm) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // We now call the API with the 'search' parameter
        const apiUrl = `https://dreamcoded.com/api.php?search=${encodeURIComponent(searchTerm)}&t=${Date.now()}`;

        fetch(apiUrl)
            .then(res => res.ok ? res.json() : Promise.reject('Network error'))
            .then(data => {
                setResults(data.projects);
                setTotalCount(data.totalCount);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to fetch search results.');
                setLoading(false);
            });

    }, [searchTerm]); // Re-run the search whenever the searchTerm changes

    return (
        <div className="search-results-page">
            <header className="search-results-header">
                <h1>Search Results for: <span>"{searchTerm}"</span></h1>
                <p>{totalCount} project{totalCount !== 1 ? 's' : ''} found</p>
            </header>

            {/* We can reuse the same gallery layout from the homepage */}
            <div className="dc-gallery">
                {loading && <div className="dc-loading">Searching...</div>}
                {error && <div className="dc-error">{error}</div>}
                {!loading && !error && results.length === 0 && (
                    <div className="dc-empty">No projects found matching your search.</div>
                )}
                {!loading && !error && results.map(app => (
                    <div className="dc-card-wrapper" key={app.id}>
                        <Link to={`/project/${app.id}`} className="dc-card-image-link">
                            <img src={app.image_url} alt={app.title} loading="lazy" className="dc-img" />
                        </Link>
                        <div className="dc-card-body">
                            <h3>{app.title}</h3>
                            <div className="dc-meta">
                                <Link to={`/user/${app.author}`} className="dc-author-link">{app.author}</Link>
                                <span>❤️ {app.total_likes}</span>
                                <span>👁️ {app.total_views}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResultsPage;
