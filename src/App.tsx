import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { 
  MainMenu, 
  GameBoard, 
  CardCollection, 
  DestinyWheel, 
  CreativeWorkshop, 
  Settings,
  CharacterSelection,
  NotFound,
  PhaserGamePage
} from './pages'
import { useSettingsStore } from './store/settingsStore'

const App: React.FC = () => {
  const { loadSettings } = useSettingsStore()

  // 加载用户设置
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<PhaserGamePage />} />
          {/* <Route path="/" element={<MainMenu />} />
          <Route path="/character-selection" element={<CharacterSelection />} />
          <Route path="/game" element={<GameBoard />} />
          <Route path="/collection" element={<CardCollection />} />
          <Route path="/destiny-wheel" element={<DestinyWheel />} />
          <Route path="/workshop" element={<CreativeWorkshop />} />
          <Route path="/settings" element={<Settings />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
