// src/components/common/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center text-gray-600">
          <p>© {new Date().getFullYear()} DreamCoded. All rights reserved.</p>
          <p className="mt-1 text-sm">Showcasing beautiful code designs</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;