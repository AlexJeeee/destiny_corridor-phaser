import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'

const MainMenu: React.FC = () => {
  const navigate = useNavigate()
  const { settings, volume, toggleMusic, toggleSoundEffects } = useSettingsStore()
  const { playerProgress } = useProgressStore()
  const [showSettings, setShowSettings] = useState(false)

  const handleStartGame = () => {
    navigate('/character-selection')
  }

  const handlePhaserGame = () => {
    navigate('/phaser-game')
  }

  const handleCardCollection = () => {
    navigate('/collection')
  }

  const handleDestinyWheel = () => {
    navigate('/destiny-wheel')
  }

  const handleCreativeWorkshop = () => {
    navigate('/workshop')
  }

  const handleSettings = () => {
    setShowSettings(!showSettings)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 text-yellow-400 tracking-wider">命运回廊</h1>
        <p className="text-xl text-gray-300">踏上命运之旅，探索无尽回廊</p>
      </div>

      <div className="flex flex-col space-y-4 w-64">
        <button
          onClick={handleStartGame}
          className="py-3 px-6 bg-indigo-700 hover:bg-indigo-600 rounded-lg shadow-lg transition duration-300 text-lg font-semibold"
        >
          开始游戏
        </button>
        
        <button
          onClick={handlePhaserGame}
          className="py-3 px-6 bg-purple-700 hover:bg-purple-600 rounded-lg shadow-lg transition duration-300 text-lg font-semibold"
        >
          Phaser游戏
        </button>
        
        <button
          onClick={handleCardCollection}
          className="py-3 px-6 bg-purple-700 hover:bg-purple-600 rounded-lg shadow-lg transition duration-300 text-lg font-semibold"
        >
          卡牌收藏
        </button>
        
        <button
          onClick={handleDestinyWheel}
          className="py-3 px-6 bg-blue-700 hover:bg-blue-600 rounded-lg shadow-lg transition duration-300 text-lg font-semibold"
          disabled={playerProgress.level ? playerProgress.level < 5 : true}
        >
          命运之轮
          {playerProgress.level ? playerProgress.level < 5 && (
            <span className="text-xs block mt-1 text-gray-300">（需要达到等级5解锁）</span>
          ) : (
            <span className="text-xs block mt-1 text-gray-300">（需要达到等级5解锁）</span>
          )}
        </button>
        
        <button
          onClick={handleCreativeWorkshop}
          className="py-3 px-6 bg-teal-700 hover:bg-teal-600 rounded-lg shadow-lg transition duration-300 text-lg font-semibold"
          disabled={!playerProgress.achievementIds?.includes('achievement_005')}
        >
          创意工坊
          {!playerProgress.achievementIds?.includes('achievement_005') && (
            <span className="text-xs block mt-1 text-gray-300">（需要解锁成就：命运征服者）</span>
          )}
        </button>
        
        <button
          onClick={handleSettings}
          className="py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-lg transition duration-300 text-lg font-semibold"
        >
          设置
        </button>
      </div>

      {showSettings && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-xl w-80">
          <h2 className="text-xl font-bold mb-4 text-center">设置</h2>
          
          <div className="mb-4">
            <label className="flex items-center justify-between">
              <span>音乐音量</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.musicVolume * 100} 
                onChange={(e) => toggleMusic(e.target.value !== "0")}
                className="w-32"
              />
            </label>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center justify-between">
              <span>音效音量</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.sfxVolume * 100} 
                onChange={(e) => toggleSoundEffects(e.target.value !== "0")}
                className="w-32"
              />
            </label>
          </div>
          
          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition duration-300"
          >
            关闭
          </button>
        </div>
      )}

      <div className="absolute bottom-4 text-sm text-gray-400">
        版本 1.0.0 | 命运回廊 © 2025
      </div>
    </div>
  )
}

export default MainMenu
