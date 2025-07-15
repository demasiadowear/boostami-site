import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './contexts/ContentContext';
import { AuthProvider } from './contexts/AuthContext'; // NUOVO
import ProtectedRoute from './components/ui/ProtectedRoute'; // NUOVO
import Home from './components/Home';
import AdminPanel from './components/ui/AdminPanel';

function App() {
  return (
    <AuthProvider> {/* NUOVO WRAPPER */}
      <ContentProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute> {/* PROTEZIONE */}
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
