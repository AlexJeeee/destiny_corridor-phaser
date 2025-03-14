import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { achievements } from '../data/achievements'
import { Achievement } from '../types'

const Achievements: React.FC = () => {
  const navigate = useNavigate()
  const { playerProgress, updateProgress } = useProgressStore()
  
  const [achievementsList, setAchievementsList] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all')
  const [sortBy, setSortBy] = useState<'default' | 'progress' | 'reward'>('default')
  
  // 初始化成就列表
  useEffect(() => {
    // 合并成就数据和玩家进度
    const mergedAchievements = achievements.map(achievement => {
      const playerAchievement = playerProgress.achievements.find(
        a => a.id === achievement.id
      )
      
      return {
        ...achievement,
        progress: playerAchievement?.progress || 0,
        completed: playerAchievement?.completed || false
      }
    })
    
    setAchievementsList(mergedAchievements)
  }, [playerProgress])
  
  // 过滤成就
  const filteredAchievements = achievementsList.filter(achievement => {
    if (filter === 'all') return true
    if (filter === 'completed') return achievement.completed
    if (filter === 'incomplete') return !achievement.completed
    return true
  })
  
  // 排序成就
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (sortBy === 'progress') {
      // 按进度百分比排序
      const progressA = a.progress / a.requiredProgress
      const progressB = b.progress / b.requiredProgress
      return progressB - progressA
    } else if (sortBy === 'reward') {
      // 按奖励类型排序
      return (b.reward?.value || 0) - (a.reward?.value || 0)
    } else {
      // 默认排序：已完成的放后面，未完成的按ID排序
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1
      return a.id.localeCompare(b.id)
    }
  })
  
  // 计算总进度
  const calculateTotalProgress = (): number => {
    const completed = achievementsList.filter(a => a.completed).length
    return Math.round((completed / achievementsList.length) * 100)
  }
  
  // 渲染成就卡片
  const renderAchievementCard = (achievement: Achievement) => {
    const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.requiredProgress) * 100))
    
    return (
      <div 
        key={achievement.id}
        className={`achievement-card p-4 rounded-lg border ${
          achievement.completed ? 'border-green-500 bg-gray-800' : 'border-gray-700 bg-gray-800'
        } mb-4`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="achievement-icon w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4 md:mb-0 md:mr-4">
            {achievement.completed ? (
              <span className="text-green-500 text-2xl">✓</span>
            ) : (
              <span className="text-gray-500 text-2xl">?</span>
            )}
          </div>
          
          <div className="achievement-details flex-1">
            <h3 className="text-lg font-bold mb-1">{achievement.name}</h3>
            <p className="text-gray-400 mb-2">{achievement.description}</p>
            
            <div className="progress-bar w-full h-4 bg-gray-700 rounded-full mb-2">
              <div 
                className={`h-full rounded-full ${achievement.completed ? 'bg-green-500' : 'bg-blue-600'}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>{achievement.progress} / {achievement.requiredProgress}</span>
              <span>{progressPercent}%</span>
            </div>
            
            {achievement.reward && (
              <div className="achievement-reward mt-3 p-2 bg-gray-700 rounded">
                <span className="text-sm text-yellow-400">奖励: </span>
                <span className="text-sm">
                  {getRewardText(achievement.reward)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // 获取奖励文本
  const getRewardText = (reward: { type: string, value: number, id?: string }): string => {
    switch (reward.type) {
      case 'character':
        return `解锁角色: ${getCharacterName(reward.id || '')}`
      case 'card':
        return `解锁卡牌: ${getCardName(reward.id || '')}`
      case 'relic':
        return `解锁遗物: ${getRelicName(reward.id || '')}`
      case 'destiny_coins':
        return `${reward.value} 命运币`
      case 'exp':
        return `${reward.value} 经验值`
      default:
        return `${reward.value} ${reward.type}`
    }
  }
  
  // 获取角色名称（实际项目中应从数据中获取）
  const getCharacterName = (id: string): string => {
    const characterNames: Record<string, string> = {
      'fire_mage': '火焰法师',
      'ice_knight': '冰霜骑士',
      'thunder_archer': '雷电射手',
      // 更多角色...
    }
    
    return characterNames[id] || id
  }
  
  // 获取卡牌名称（实际项目中应从数据中获取）
  const getCardName = (id: string): string => {
    const cardNames: Record<string, string> = {
      'fireball': '火球术',
      'ice_shield': '冰盾',
      'lightning_strike': '雷击',
      // 更多卡牌...
    }
    
    return cardNames[id] || id
  }
  
  // 获取遗物名称（实际项目中应从数据中获取）
  const getRelicName = (id: string): string => {
    const relicNames: Record<string, string> = {
      'phoenix_feather': '凤凰羽毛',
      'dragon_scale': '龙鳞',
      'ancient_coin': '远古硬币',
      // 更多遗物...
    }
    
    return relicNames[id] || id
  }
  
  return (
    <div className="achievements min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">成就</h1>
          <button 
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg"
            onClick={() => navigate('/')}
          >
            返回主菜单
          </button>
        </div>
        
        {/* 进度概览 */}
        <div className="progress-overview bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-2">总体进度</h2>
          
          <div className="progress-bar w-full h-6 bg-gray-700 rounded-full mb-2">
            <div 
              className="h-full rounded-full bg-green-600"
              style={{ width: `${calculateTotalProgress()}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>已完成: {achievementsList.filter(a => a.completed).length} / {achievementsList.length}</span>
            <span>{calculateTotalProgress()}%</span>
          </div>
        </div>
        
        {/* 过滤和排序 */}
        <div className="filters-and-sorts bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="filter-options mb-4 md:mb-0">
              <span className="mr-2">显示:</span>
              <button 
                className={`px-3 py-1 rounded mr-2 ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setFilter('all')}
              >
                全部
              </button>
              <button 
                className={`px-3 py-1 rounded mr-2 ${filter === 'completed' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setFilter('completed')}
              >
                已完成
              </button>
              <button 
                className={`px-3 py-1 rounded ${filter === 'incomplete' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setFilter('incomplete')}
              >
                未完成
              </button>
            </div>
            
            <div className="sort-options">
              <span className="mr-2">排序:</span>
              <button 
                className={`px-3 py-1 rounded mr-2 ${sortBy === 'default' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setSortBy('default')}
              >
                默认
              </button>
              <button 
                className={`px-3 py-1 rounded mr-2 ${sortBy === 'progress' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setSortBy('progress')}
              >
                进度
              </button>
              <button 
                className={`px-3 py-1 rounded ${sortBy === 'reward' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => setSortBy('reward')}
              >
                奖励
              </button>
            </div>
          </div>
        </div>
        
        {/* 成就列表 */}
        <div className="achievements-list">
          {sortedAchievements.length > 0 ? (
            sortedAchievements.map(achievement => renderAchievementCard(achievement))
          ) : (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <p className="text-gray-400">没有找到符合条件的成就</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Achievements
