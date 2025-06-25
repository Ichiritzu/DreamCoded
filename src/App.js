import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import SubmitPage from './pages/SubmitPage/SubmitPage';
import AuthForm from './components/AuthForm/AuthForm'; // <-- Corrected path
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ProjectDetailPage from './pages/ProjectDetailPage/ProjectDetailPage';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        
        <main style={{ flexGrow: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthForm />} />
            
            {/* The new route for the detail page. Notice the ':id' which is a dynamic parameter. */}
            <Route path="/project/:id" element={<ProjectDetailPage />} /> 
            
            {/* Protected Route */}
            <Route 
              path="/submit" 
              element={
                <ProtectedRoute>
                  <SubmitPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
