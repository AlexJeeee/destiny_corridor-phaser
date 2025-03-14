import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { Card, CardPosition, CardType, ElementType } from '../types'
import { initialDeck, rareCards, getCardsByElement, getCardsByType } from '../data/cards'

const CardCollection: React.FC = () => {
  const navigate = useNavigate()
  const { playerProgress } = useProgressStore()
  
  const [cards, setCards] = useState<Card[]>([])
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [filter, setFilter] = useState({
    element: 'all' as 'all' | ElementType,
    type: 'all' as 'all' | CardType,
    search: '',
    showUnlocked: true
  })

  // 初始化卡牌集合
  useEffect(() => {
    // 合并初始卡组和稀有卡牌
    const allCards = [...initialDeck, ...rareCards]
    
    // 标记已解锁的卡牌
    const markedCards = allCards.map(card => ({
      ...card,
      isUnlocked: playerProgress.unlockedCardIds?.includes(card.id) || false
    }))
    
    setCards(markedCards)
    applyFilters(markedCards)
  }, [playerProgress])

  // 应用筛选条件
  const applyFilters = (cardList: Card[]) => {
    let result = [...cardList]
    
    // 按元素筛选
    if (filter.element !== 'all') {
      result = result.filter(card => card.element === filter.element)
    }
    
    // 按类型筛选
    if (filter.type !== 'all') {
      result = result.filter(card => card.type === filter.type)
    }
    
    // 按名称搜索
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      result = result.filter(card => 
        card.name.toLowerCase().includes(searchLower) || 
        card.description.toLowerCase().includes(searchLower)
      )
    }
    
    // 是否只显示已解锁
    if (filter.showUnlocked) {
      result = result.filter(card => card.isUnlocked)
    }
    
    setFilteredCards(result)
  }

  // 处理筛选条件改变
  const handleFilterChange = (key: string, value: any) => {
    const newFilter = { ...filter, [key]: value }
    setFilter(newFilter)
    
    // 重新应用筛选条件
    setTimeout(() => {
      applyFilters(cards)
    }, 0)
  }

  // 处理卡牌点击
  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  // 渲染卡牌
  const renderCard = (card: Card, index: number) => {
    const isSelected = selectedCard && selectedCard.id === card.id
    
    let cardClass = "card p-2 rounded-lg shadow-md w-32 h-48 mx-2 my-2 transition-transform "
    if (isSelected) cardClass += "border-2 border-yellow-400 transform scale-105 "
    
    let bgColor = "bg-gray-700 "
    switch (card.element) {
      case 'fire': bgColor = "bg-red-700 "; break
      case 'ice': bgColor = "bg-blue-700 "; break
      case 'lightning': bgColor = "bg-yellow-700 "; break
      case 'earth': bgColor = "bg-green-700 "; break
      case 'wind': bgColor = "bg-teal-700 "; break
      case 'water': bgColor = "bg-blue-500 "; break
      case 'light': bgColor = "bg-white text-gray-800 "; break
      case 'dark': bgColor = "bg-purple-900 "; break
    }
    
    cardClass += bgColor
    
    // 未解锁的卡牌显示为灰色
    if (!card.isUnlocked) {
      cardClass = "card p-2 rounded-lg shadow-md w-32 h-48 mx-2 my-2 bg-gray-800 opacity-50"
    }
    
    return (
      <div 
        key={index}
        className={cardClass}
        onClick={() => card.isUnlocked && handleCardClick(card)}
      >
        {card.isUnlocked ? (
          <>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs">{card.cost}能量</span>
              <span className="text-xs">稀有度:{card.rarity}</span>
            </div>
            <div className="text-center font-bold mb-1">{card.name}</div>
            <div className="text-xs mb-2">{card.description}</div>
            <div className="text-xs">
              <div>正位: {card.uprightEffect}</div>
              <div>逆位: {card.reversedEffect}</div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-center">未解锁</span>
          </div>
        )}
      </div>
    )
  }

  // 获取元素名称
  const getElementName = (element: ElementType | 'all'): string => {
    if (element === 'all') return '全部'
    const elementNames: Record<ElementType, string> = {
      'fire': '火',
      'ice': '冰',
      'lightning': '雷',
      'earth': '土',
      'wind': '风',
      'water': '水',
      'light': '光',
      'dark': '暗',
      'neutral': '中性'
    }
    return elementNames[element as ElementType]
  }

  // 获取卡牌类型名称
  const getCardTypeName = (type: CardType | 'all'): string => {
    if (type === 'all') return '全部'
    const typeNames: Record<CardType, string> = {
      'attack': '攻击',
      'defense': '防御',
      'skill': '技能',
      'movement': '移动',
      'special': '特殊'
    }
    return typeNames[type as CardType]
  }

  return (
    <div className="card-collection min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">卡牌收藏</h1>
        <button 
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg"
          onClick={() => navigate('/')}
        >
          返回主菜单
        </button>
      </div>
      
      {/* 筛选条件 */}
      <div className="filter-section bg-gray-800 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2">元素</label>
            <select 
              className="w-full bg-gray-700 p-2 rounded"
              value={filter.element}
              onChange={(e) => handleFilterChange('element', e.target.value)}
            >
              <option value="all">全部</option>
              <option value="fire">火</option>
              <option value="ice">冰</option>
              <option value="lightning">雷</option>
              <option value="earth">土</option>
              <option value="wind">风</option>
              <option value="water">水</option>
              <option value="light">光</option>
              <option value="dark">暗</option>
              <option value="neutral">中性</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2">类型</label>
            <select 
              className="w-full bg-gray-700 p-2 rounded"
              value={filter.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">全部</option>
              <option value="attack">攻击</option>
              <option value="defense">防御</option>
              <option value="skill">技能</option>
              <option value="movement">移动</option>
              <option value="special">特殊</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2">搜索</label>
            <input 
              type="text"
              className="w-full bg-gray-700 p-2 rounded"
              placeholder="输入卡牌名称或描述"
              value={filter.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input 
                type="checkbox"
                checked={filter.showUnlocked}
                onChange={(e) => handleFilterChange('showUnlocked', e.target.checked)}
                className="mr-2"
              />
              只显示已解锁
            </label>
          </div>
        </div>
      </div>
      
      {/* 卡牌统计 */}
      <div className="stats-section bg-gray-800 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="block">已解锁卡牌:</span>
            <span className="text-xl font-bold">{cards.filter(card => card.isUnlocked).length} / {cards.length}</span>
          </div>
          
          <div>
            <span className="block">当前筛选结果:</span>
            <span className="text-xl font-bold">{filteredCards.length} 张卡牌</span>
          </div>
          
          <div>
            <span className="block">已解锁稀有卡牌:</span>
            <span className="text-xl font-bold">
              {cards.filter(card => card.isUnlocked && card.rarity >= 3).length} / {cards.filter(card => card.rarity >= 3).length}
            </span>
          </div>
          
          <div>
            <span className="block">收集进度:</span>
            <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
              <div 
                className="bg-blue-600 h-4 rounded-full"
                style={{ width: `${(cards.filter(card => card.isUnlocked).length / cards.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 卡牌展示区 */}
      <div className="cards-display-section">
        <div className="flex flex-wrap justify-center">
          {filteredCards.map((card, index) => renderCard(card, index))}
        </div>
        
        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            没有找到符合条件的卡牌
          </div>
        )}
      </div>
      
      {/* 卡牌详情模态框 */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">{selectedCard.name}</h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedCard(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="block text-gray-400">元素:</span>
                <span>{getElementName(selectedCard.element)}</span>
              </div>
              
              <div>
                <span className="block text-gray-400">类型:</span>
                <span>{getCardTypeName(selectedCard.type)}</span>
              </div>
              
              <div>
                <span className="block text-gray-400">能量消耗:</span>
                <span>{selectedCard.cost}</span>
              </div>
              
              <div>
                <span className="block text-gray-400">稀有度:</span>
                <span>{selectedCard.rarity}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="block text-gray-400">描述:</span>
              <p>{selectedCard.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="block text-gray-400">正位效果:</span>
                <p>{selectedCard.uprightEffect}</p>
              </div>
              
              <div>
                <span className="block text-gray-400">逆位效果:</span>
                <p>{selectedCard.reversedEffect}</p>
              </div>
            </div>
            
            {selectedCard.baseDamage && (
              <div className="mb-4">
                <span className="block text-gray-400">基础伤害:</span>
                <span>{selectedCard.baseDamage}</span>
              </div>
            )}
            
            {selectedCard.baseDefense && (
              <div className="mb-4">
                <span className="block text-gray-400">基础防御:</span>
                <span>{selectedCard.baseDefense}</span>
              </div>
            )}
            
            <button 
              className="w-full bg-blue-700 hover:bg-blue-600 py-2 rounded-lg mt-4"
              onClick={() => setSelectedCard(null)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardCollection
