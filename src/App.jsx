import { useState } from 'react';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';

export default function App() {
  const [page, setPage] = useState('home');
  return page === 'home' ? <Home onNavigate={() => setPage('analyzer')} /> : <Analyzer onNavigate={() => setPage('home')} />;
}