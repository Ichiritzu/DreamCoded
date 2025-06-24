import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">DreamCoded</h1>
      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/gallery">Gallery</a>
      </div>
    </nav>
  );
}

export default Navbar;