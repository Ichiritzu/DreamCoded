import './Navbar.css';
import { Link } from 'react-router-dom';
function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">DreamCoded</h1>
      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/gallery">Gallery</a>
        <Link to="/auth" className="auth-button">
  Login / Register
</Link>
      </div>
    </nav>
  );
}

export default Navbar;