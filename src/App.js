import React from 'react';
import './App.css'; // This will hold our global styles and CSS variables

// Import the router components
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our layout and page components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import AuthForm from './components/AuthForm/AuthForm';

function App() {
  return (
    // The Router now wraps the entire application
    <Router>
      <div className="app-container">
        <Navbar />
        
        {/* The 'main' element will contain the content that changes between pages */}
        <main>
          <Routes>
            {/* This Route tells the app: when the URL is "/", render the HomePage component */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthForm />} />
            {/* Later, we could add more pages like this: */}
            {/* <Route path="/submit" element={<SubmitPage />} /> */}
            {/* <Route path="/about" element={<AboutPage />} /> */}
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
