import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
          &copy; {new Date().getFullYear()} DreamCoded. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
