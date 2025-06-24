export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-500/20 to-pink-600/30"></div>
      
      <div className="glass-effect p-12 rounded-2xl max-w-4xl mx-auto text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          DreamCoded
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-800 dark:text-gray-200">
          Where creative code meets stunning design. Showcase your most beautiful web creations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            Explore Gallery
          </button>
          <button className="px-8 py-3 border-2 border-purple-500 text-purple-600 dark:text-white rounded-lg font-medium hover:bg-purple-500/10 transition">
            Submit Your Work
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}