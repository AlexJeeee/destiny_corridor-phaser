import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { 
  NotFound,
  PhaserGamePage
} from './pages'

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<PhaserGamePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
