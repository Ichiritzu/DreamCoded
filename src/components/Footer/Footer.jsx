import React, { useEffect, useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    fetch('/version.json', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setVersion(data.version))
      .catch(err => console.warn('Could not load version:', err));
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        &copy; {new Date().getFullYear()} DreamCoded. All Rights Reserved.
        {version && version.trim() !== '' && (
          <span className="footer-version"> • v{version}</span>
        )}
      </div>
    </footer>
  );
};

export default Footer;
