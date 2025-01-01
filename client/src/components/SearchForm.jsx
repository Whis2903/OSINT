import React, { useState } from 'react';
import './SearchForm.css';

const SearchForm = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    try {
      console.log(`Searching for posts with keyword: ${keyword}`);
      const response = await fetch(`http://localhost:5000/api/reddit/posts?keyword=${keyword}`);
      const data = await response.json();
      console.log('API response:', data);
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="search-form">
        <form onSubmit={handleSearch}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit">Search Subreddits</button>
          </div>
        </form>
        {error && <p className="error">{error}</p>}
        <div className="results-card">
          {results.map((post, index) => (
            <div key={index} className="card-entry">
              <div className="card-header">
                <h3>{post.title}</h3>
              </div>
              {post.content && (
                <div className="card-content">
                  <p>{post.content}</p>
                </div>
              )}
              <div className="card-actions">
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;