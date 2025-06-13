import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './contexts/ContentContext';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <ContentProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </Router>
    </ContentProvider>
  );
}

export default App;

