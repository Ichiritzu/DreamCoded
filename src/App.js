import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import the Message Provider and Component
import { MessageProvider } from './context/MessageContext';
import GlobalMessage from './components/GlobalMessage/GlobalMessage';

// Import all page and layout components
import Sidebar from './components/Sidebar/Sidebar'; // Renamed from Navbar
import Header from './components/Header/Header';   // Your new Header component
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import SubmitPage from './pages/SubmitPage/SubmitPage';
import AuthForm from './components/AuthForm/AuthForm';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ProjectDetailPage from './pages/ProjectDetailPage/ProjectDetailPage';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

function App() {
  return (
    <MessageProvider>
      <Router>
        {/* The new top-level layout container with the correct class */}
        <div className="app-layout">
          <GlobalMessage />
          <Sidebar />
          
          <div className="main-content-wrapper">
            <Header />
            <main className="page-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/project/:id" element={<ProjectDetailPage />} />
                <Route path="/user/:username" element={<UserProfilePage />} />
                <Route path="/search" element={<SearchResultsPage />} /> 
                
                {/* Protected Routes */}
                <Route 
                  path="/submit" 
                  element={
                    <ProtectedRoute>
                      <SubmitPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>

        </div>
      </Router>
    </MessageProvider>
  );
}

export default App;
