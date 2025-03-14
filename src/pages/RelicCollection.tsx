import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { relics } from '../data/relics'
import { Relic } from '../types'

const RelicCollection: React.FC = () => {
  const navigate = useNavigate()
  const { playerProgress } = useProgressStore()
  
  const [unlockedRelics, setUnlockedRelics] = useState<Relic[]>([])
  const [lockedRelics, setLockedRelics] = useState<Relic[]>([])
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')
  
  // 初始化遗物列表
  useEffect(() => {
    const unlocked: Relic[] = []
    const locked: Relic[] = []
    
    relics.forEach(relic => {
      if (playerProgress.unlockedRelics.includes(relic.id)) {
        unlocked.push(relic)
      } else {
        locked.push(relic)
      }
    })
    
    setUnlockedRelics(unlocked)
    setLockedRelics(locked)
    
    // 默认选择第一个解锁的遗物
    if (unlocked.length > 0 && !selectedRelic) {
      setSelectedRelic(unlocked[0])
    }
  }, [playerProgress, selectedRelic])
  
  // 过滤遗物
  const getFilteredRelics = (relics: Relic[]): Relic[] => {
    if (filter === 'all') return relics
    return relics.filter(relic => relic.rarity === filter)
  }
  
  // 处理遗物选择
  const handleSelectRelic = (relic: Relic) => {
    setSelectedRelic(relic)
  }
  
  // 获取稀有度颜色
  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: '#9ca3af',     // 灰色
      rare: '#3b82f6',       // 蓝色
      epic: '#8b5cf6',       // 紫色
      legendary: '#f59e0b'   // 橙色
    }
    
    return colors[rarity] || colors.common
  }
  
  // 获取稀有度名称
  const getRarityName = (rarity: string): string => {
    const names: Record<string, string> = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说'
    }
    
    return names[rarity] || '未知'
  }
  
  // 渲染遗物卡片
  const renderRelicCard = (relic: Relic, isLocked: boolean = false) => {
    const cardClass = `relic-card p-3 rounded-lg ${
      selectedRelic?.id === relic.id ? 'border-2 border-yellow-400' : 'border border-gray-700'
    } ${isLocked ? 'opacity-50 bg-gray-800' : 'cursor-pointer hover:bg-gray-700 bg-gray-800'}`
    
    return (
      <div 
        key={relic.id}
        className={cardClass}
        onClick={() => !isLocked && handleSelectRelic(relic)}
      >
        <div className="flex items-center">
          <div className="relic-icon w-12 h-12 rounded-full mr-3 flex items-center justify-center"
            style={{ backgroundColor: getRarityColor(relic.rarity) }}
          >
            {relic.icon || '🔮'}
          </div>
          
          <div className="relic-info flex-1">
            <h3 className="font-bold">{relic.name}</h3>
            <div className="flex items-center">
              <span className="text-xs px-2 py-0.5 rounded mr-2" 
                style={{ backgroundColor: getRarityColor(relic.rarity) }}
              >
                {getRarityName(relic.rarity)}
              </span>
              {isLocked && (
                <span className="text-xs text-gray-400">未解锁</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // 渲染遗物详情
  const renderRelicDetails = () => {
    if (!selectedRelic) {
      return (
        <div className="text-center py-8 bg-gray-800 rounded-lg">
          <p className="text-gray-400">选择一个遗物查看详情</p>
        </div>
      )
    }
    
    return (
      <div className="relic-details bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row">
          <div className="relic-image md:w-1/3 mb-6 md:mb-0 flex justify-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: getRarityColor(selectedRelic.rarity) }}
            >
              {selectedRelic.icon || '🔮'}
            </div>
          </div>
          
          <div className="relic-info md:w-2/3 md:pl-6">
            <div className="flex items-center mb-2">
              <h2 className="text-2xl font-bold mr-3">{selectedRelic.name}</h2>
              <span className="text-sm px-2 py-0.5 rounded" 
                style={{ backgroundColor: getRarityColor(selectedRelic.rarity) }}
              >
                {getRarityName(selectedRelic.rarity)}
              </span>
            </div>
            
            <p className="mb-4">{selectedRelic.description}</p>
            
            <div className="relic-effects mb-4">
              <h3 className="text-lg font-bold mb-2">效果</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedRelic.effects && selectedRelic.effects.map((effect, index) => (
                  <li key={index}>
                    {effect.description}
                    {effect.timing && (
                      <span className="text-gray-400 text-sm ml-2">
                        ({getTimingText(effect.timing)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            {selectedRelic.unlockCondition && (
              <div className="unlock-condition p-3 bg-gray-700 rounded mb-4">
                <h3 className="font-bold mb-1">解锁条件</h3>
                <p>{selectedRelic.unlockCondition}</p>
              </div>
            )}
            
            {selectedRelic.lore && (
              <div className="lore p-3 bg-gray-700 rounded">
                <h3 className="font-bold mb-1">遗物传说</h3>
                <p className="text-gray-400 italic">{selectedRelic.lore}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // 获取效果触发时机文本
  const getTimingText = (timing: string): string => {
    const timingTexts: Record<string, string> = {
      'start_of_turn': '回合开始时',
      'end_of_turn': '回合结束时',
      'on_attack': '攻击时',
      'on_defend': '防御时',
      'on_damage': '受到伤害时',
      'on_heal': '治疗时',
      'on_card_play': '打出卡牌时',
      'on_card_draw': '抽牌时',
      'passive': '被动',
      'on_battle_start': '战斗开始时',
      'on_battle_end': '战斗结束时'
    }
    
    return timingTexts[timing] || timing
  }
  
  return (
    <div className="relic-collection min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">遗物收藏</h1>
          <button 
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg"
            onClick={() => navigate('/')}
          >
            返回主菜单
          </button>
        </div>
        
        {/* 遗物详情 */}
        {renderRelicDetails()}
        
        {/* 过滤器 */}
        <div className="filters bg-gray-800 p-4 rounded-lg my-6">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setFilter('all')}
            >
              全部 ({unlockedRelics.length})
            </button>
            <button 
              className={`px-3 py-1 rounded ${filter === 'common' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setFilter('common')}
            >
              普通 ({unlockedRelics.filter(r => r.rarity === 'common').length})
            </button>
            <button 
              className={`px-3 py-1 rounded ${filter === 'rare' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setFilter('rare')}
            >
              稀有 ({unlockedRelics.filter(r => r.rarity === 'rare').length})
            </button>
            <button 
              className={`px-3 py-1 rounded ${filter === 'epic' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setFilter('epic')}
            >
              史诗 ({unlockedRelics.filter(r => r.rarity === 'epic').length})
            </button>
            <button 
              className={`px-3 py-1 rounded ${filter === 'legendary' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setFilter('legendary')}
            >
              传说 ({unlockedRelics.filter(r => r.rarity === 'legendary').length})
            </button>
          </div>
        </div>
        
        {/* 已解锁遗物 */}
        <div className="unlocked-relics mb-6">
          <h2 className="text-xl font-bold mb-4">已解锁遗物 ({getFilteredRelics(unlockedRelics).length})</h2>
          
          {getFilteredRelics(unlockedRelics).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getFilteredRelics(unlockedRelics).map(relic => renderRelicCard(relic))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <p className="text-gray-400">没有找到符合条件的遗物</p>
            </div>
          )}
        </div>
        
        {/* 未解锁遗物 */}
        <div className="locked-relics">
          <h2 className="text-xl font-bold mb-4">未解锁遗物 ({getFilteredRelics(lockedRelics).length})</h2>
          
          {getFilteredRelics(lockedRelics).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getFilteredRelics(lockedRelics).map(relic => renderRelicCard(relic, true))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <p className="text-gray-400">没有找到符合条件的遗物</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RelicCollection
