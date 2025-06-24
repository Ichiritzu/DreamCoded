// src/pages/HomePage.jsx
const HomePage = () => {
  return (
    <div className="home-page">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Showcase Your Creative Code
          </h1>
          <p className="text-xl mb-8">
            A gallery for beautiful web designs and UI experiments
          </p>
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
            Explore Gallery
          </button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Featured Styles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💎</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Glassmorphism</h3>
            <p className="text-gray-600">
              Frosted glass effects with backdrop blur
            </p>
          </div>
          
          {/* Feature Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🖍️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Neo-Brutalism</h3>
            <p className="text-gray-600">
              Bold, raw designs with high contrast
            </p>
          </div>
          
          {/* Feature Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🌌</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Aurora UI</h3>
            <p className="text-gray-600">
              Colorful gradient backgrounds
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;