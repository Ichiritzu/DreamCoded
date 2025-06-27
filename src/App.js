import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import the new Message Provider and Component
import { MessageProvider } from './context/MessageContext';
import GlobalMessage from './components/GlobalMessage/GlobalMessage';

// Import all your existing page and layout components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import SubmitPage from './pages/SubmitPage/SubmitPage';
import AuthForm from './components/AuthForm/AuthForm';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ProjectDetailPage from './pages/ProjectDetailPage/ProjectDetailPage';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';

function App() {
  return (
    // 1. MessageProvider wraps the entire application to provide global state.
    <MessageProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* 2. GlobalMessage is rendered at the top level to appear over any page. */}
          <GlobalMessage />
          <Navbar />
          
          <main style={{ flexGrow: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/project/:id" element={<ProjectDetailPage />} />
              <Route path="/user/:username" element={<UserProfilePage />} />
              
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
    </MessageProvider>
  );
}

export default App;
