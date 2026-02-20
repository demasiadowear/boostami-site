import { useState } from 'react'
import Home from './pages/Home'
import Analyzer from './pages/Analyzer'

export default function App() {
  const [page, setPage] = useState('home')

  return (
    <div>
      {page === 'home' && <Home onNavigate={setPage} />}
      {page === 'analyzer' && <Analyzer onNavigate={setPage} />}
    </div>
  )
}
