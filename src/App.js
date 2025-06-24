// src/App.js
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <HomePage />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;