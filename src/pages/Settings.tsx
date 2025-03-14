import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { volume, language, toggleMusic, toggleSoundEffects, setLanguage } = useSettingsStore()
  const { resetProgress, exportProgress, importProgress } = useProgressStore()
  
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)

  // 处理音量变化
  const handleVolumeChange = (type: 'music' | 'soundEffects', value: number) => {
    if (type === 'music') {
      toggleMusic(value)
    } else {
      toggleSoundEffects(value)
    }
  }

  // 处理语言变化
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
  }

  // 处理重置进度
  const handleResetProgress = () => {
    resetProgress()
    setShowResetConfirm(false)
    // 显示成功消息
    alert('游戏进度已重置')
  }

  // 处理导出进度
  const handleExportProgress = () => {
    const progressData = exportProgress()
    // 复制到剪贴板
    navigator.clipboard.writeText(progressData)
      .then(() => {
        alert('游戏进度已复制到剪贴板')
      })
      .catch(() => {
        alert('无法复制到剪贴板，请手动复制下面的数据')
        console.log(progressData)
      })
  }

  // 处理导入进度
  const handleImportProgress = () => {
    try {
      importProgress(importData)
      setImportError('')
      setImportSuccess(true)
      setImportData('')
      
      // 3秒后隐藏成功消息
      setTimeout(() => {
        setImportSuccess(false)
      }, 3000)
    } catch (error) {
      setImportError('导入失败，请检查数据格式是否正确')
      setImportSuccess(false)
    }
  }

  return (
    <div className="settings min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">设置</h1>
        <button 
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg"
          onClick={() => navigate('/')}
        >
          返回主菜单
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 音频设置 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">音频设置</h2>
          
          <div className="mb-4">
            <label className="flex items-center justify-between">
              <span>音乐音量</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume.music} 
                onChange={(e) => handleVolumeChange('music', parseInt(e.target.value))}
                className="w-32"
              />
              <span className="ml-2 w-8 text-right">{volume.music}%</span>
            </label>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center justify-between">
              <span>音效音量</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume.soundEffects} 
                onChange={(e) => handleVolumeChange('soundEffects', parseInt(e.target.value))}
                className="w-32"
              />
              <span className="ml-2 w-8 text-right">{volume.soundEffects}%</span>
            </label>
          </div>
        </div>
        
        {/* 游戏设置 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">游戏设置</h2>
          
          <div className="mb-4">
            <label className="block mb-2">语言</label>
            <select 
              className="w-full bg-gray-700 p-2 rounded"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        {/* 数据管理 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">数据管理</h2>
          
          <div className="flex flex-col space-y-3">
            <button 
              className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg"
              onClick={() => setShowResetConfirm(true)}
            >
              重置游戏进度
            </button>
            
            <button 
              className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg"
              onClick={handleExportProgress}
            >
              导出游戏进度
            </button>
            
            <div>
              <label className="block mb-2">导入游戏进度</label>
              <textarea 
                className="w-full bg-gray-700 p-2 rounded mb-2"
                rows={4}
                placeholder="粘贴游戏进度数据"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
              
              {importError && (
                <div className="text-red-500 mb-2">{importError}</div>
              )}
              
              {importSuccess && (
                <div className="text-green-500 mb-2">导入成功！</div>
              )}
              
              <button 
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg w-full"
                onClick={handleImportProgress}
                disabled={!importData}
              >
                导入
              </button>
            </div>
          </div>
        </div>
        
        {/* 关于 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">关于</h2>
          
          <div className="mb-4">
            <h3 className="font-bold">命运回廊</h3>
            <p className="text-gray-400">版本 1.0.0</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold">开发者</h3>
            <p className="text-gray-400">命运工作室</p>
          </div>
          
          <div>
            <h3 className="font-bold">联系我们</h3>
            <p className="text-gray-400">contact@destinycorridor.com</p>
          </div>
        </div>
      </div>
      
      {/* 重置确认对话框 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">确认重置</h3>
            <p className="mb-6">你确定要重置所有游戏进度吗？这将删除所有解锁的卡牌、角色和成就。此操作无法撤销。</p>
            
            <div className="flex justify-end">
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg mr-2"
                onClick={() => setShowResetConfirm(false)}
              >
                取消
              </button>
              
              <button 
                className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg"
                onClick={handleResetProgress}
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
