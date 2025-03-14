import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { Card, CardPosition, CardType, ElementType } from '../types'
import { initialDeck, rareCards } from '../data/cards'

const CreativeWorkshop: React.FC = () => {
  const navigate = useNavigate()
  const { playerProgress, updateProgress } = useProgressStore()
  
  const [customCards, setCustomCards] = useState<Card[]>(playerProgress.customCards || [])
  const [isCreating, setIsCreating] = useState(false)
  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  
  // 新卡牌表单数据
  const [newCard, setNewCard] = useState<Partial<Card>>({
    id: '',
    name: '',
    description: '',
    position: CardPosition.UPRIGHT,
    type: CardType.ATTACK,
    element: ElementType.NEUTRAL,
    cost: 1,
    rarity: 1,
    effects: [],
    uprightEffect: '',
    reversedEffect: '',
    isUnlocked: true,
    flipped: false
  })

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'cost' || name === 'rarity' || name === 'baseDamage' || name === 'baseDefense') {
      setNewCard({
        ...newCard,
        [name]: parseInt(value)
      })
    } else {
      setNewCard({
        ...newCard,
        [name]: value
      })
    }
  }

  // 生成预览卡牌
  const generatePreview = () => {
    if (!newCard.name || !newCard.description) return
    
    // 生成唯一ID
    const cardId = `custom_${Date.now()}`
    
    const previewCardData: Card = {
      id: cardId,
      name: newCard.name || '自定义卡牌',
      description: newCard.description || '这是一张自定义卡牌',
      position: newCard.position || CardPosition.UPRIGHT,
      type: newCard.type || CardType.ATTACK,
      element: newCard.element || ElementType.NEUTRAL,
      cost: newCard.cost || 1,
      rarity: newCard.rarity || 1,
      baseDamage: newCard.type === CardType.ATTACK ? (newCard.baseDamage || 5) : undefined,
      baseDefense: newCard.type === CardType.DEFENSE ? (newCard.baseDefense || 5) : undefined,
      effects: [],
      imageUrl: '/assets/cards/custom_card.png',
      uprightEffect: newCard.uprightEffect || '无效果',
      reversedEffect: newCard.reversedEffect || '无效果',
      isUnlocked: true,
      flipped: false
    }
    
    setPreviewCard(previewCardData)
  }

  // 保存自定义卡牌
  const saveCustomCard = () => {
    if (!previewCard) return
    
    const updatedCustomCards = [...customCards, previewCard]
    setCustomCards(updatedCustomCards)
    
    // 更新进度
    updateProgress({
      customCards: updatedCustomCards
    })
    
    // 重置表单
    setNewCard({
      id: '',
      name: '',
      description: '',
      position: CardPosition.UPRIGHT,
      type: CardType.ATTACK,
      element: ElementType.NEUTRAL,
      cost: 1,
      rarity: 1,
      effects: [],
      uprightEffect: '',
      reversedEffect: '',
      isUnlocked: true,
      flipped: false
    })
    
    setPreviewCard(null)
    setIsCreating(false)
  }

  // 删除自定义卡牌
  const deleteCustomCard = (cardId: string) => {
    const updatedCustomCards = customCards.filter(card => card.id !== cardId)
    setCustomCards(updatedCustomCards)
    
    // 更新进度
    updateProgress({
      customCards: updatedCustomCards
    })
  }

  // 渲染卡牌
  const renderCard = (card: Card, index: number) => {
    let cardClass = "card p-2 rounded-lg shadow-md w-32 h-48 mx-2 my-2 "
    
    let bgColor = "bg-gray-700 "
    switch (card.element) {
      case 'fire': bgColor = "bg-red-700 "; break
      case 'ice': bgColor = "bg-blue-700 "; break
      case 'lightning': bgColor = "bg-yellow-700 "; break
      case 'earth': bgColor = "bg-green-700 "; break
      case 'wind': bgColor = "bg-teal-700 "; break
      case 'light': bgColor = "bg-white text-gray-800 "; break
      case 'dark': bgColor = "bg-purple-900 "; break
    }
    
    cardClass += bgColor
    
    return (
      <div key={index} className={cardClass}>
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
        
        {card.isUnlocked && (
          <button 
            className="w-full mt-2 text-xs bg-red-600 hover:bg-red-500 py-1 rounded"
            onClick={() => deleteCustomCard(card.id)}
          >
            删除
          </button>
        )}
      </div>
    )
  }

  // 获取元素名称
  const getElementName = (element: ElementType): string => {
    const elementNames: Record<ElementType, string> = {
      'fire': '火',
      'ice': '冰',
      'lightning': '雷',
      'earth': '土',
      'wind': '风',
      'light': '光',
      'dark': '暗',
      'neutral': '中性',
      'water': '水'
    }
    return elementNames[element]
  }

  // 获取卡牌类型名称
  const getCardTypeName = (type: CardType): string => {
    const typeNames: Record<CardType, string> = {
      'attack': '攻击',
      'defense': '防御',
      'skill': '技能',
      'movement': '移动',
      'special': '特殊'
    }
    return typeNames[type]
  }

  return (
    <div className="creative-workshop min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">创意工坊</h1>
        <div className="flex items-center">
          <button 
            className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg mr-4"
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? '取消创建' : '创建新卡牌'}
          </button>
          
          <button 
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg"
            onClick={() => navigate('/')}
          >
            返回主菜单
          </button>
        </div>
      </div>
      
      {/* 创建卡牌表单 */}
      {isCreating && (
        <div className="create-card-form bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">创建自定义卡牌</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">卡牌名称</label>
              <input 
                type="text"
                name="name"
                value={newCard.name}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
                placeholder="输入卡牌名称"
              />
            </div>
            
            <div>
              <label className="block mb-1">卡牌描述</label>
              <input 
                type="text"
                name="description"
                value={newCard.description}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
                placeholder="输入卡牌描述"
              />
            </div>
            
            <div>
              <label className="block mb-1">卡牌类型</label>
              <select 
                name="type"
                value={newCard.type}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
              >
                <option value="attack">攻击</option>
                <option value="defense">防御</option>
                <option value="skill">技能</option>
                <option value="movement">移动</option>
                <option value="special">特殊</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1">元素类型</label>
              <select 
                name="element"
                value={newCard.element}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
              >
                <option value="fire">火</option>
                <option value="ice">冰</option>
                <option value="lightning">雷</option>
                <option value="earth">土</option>
                <option value="wind">风</option>
                <option value="light">光</option>
                <option value="dark">暗</option>
                <option value="neutral">中性</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1">能量消耗</label>
              <input 
                type="number"
                name="cost"
                value={newCard.cost}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
                min="0"
                max="5"
              />
            </div>
            
            <div>
              <label className="block mb-1">稀有度 (1-5)</label>
              <input 
                type="number"
                name="rarity"
                value={newCard.rarity}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
                min="1"
                max="5"
              />
            </div>
            
            {newCard.type === CardType.ATTACK && (
              <div>
                <label className="block mb-1">基础伤害</label>
                <input 
                  type="number"
                  name="baseDamage"
                  value={newCard.baseDamage || 5}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 p-2 rounded"
                  min="1"
                />
              </div>
            )}
            
            {newCard.type === CardType.DEFENSE && (
              <div>
                <label className="block mb-1">基础防御</label>
                <input 
                  type="number"
                  name="baseDefense"
                  value={newCard.baseDefense || 5}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 p-2 rounded"
                  min="1"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">正位效果</label>
              <textarea 
                name="uprightEffect"
                value={newCard.uprightEffect}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
                placeholder="输入正位效果描述"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block mb-1">逆位效果</label>
              <textarea 
                name="reversedEffect"
                value={newCard.reversedEffect}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded"
                placeholder="输入逆位效果描述"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg mr-2"
              onClick={() => setIsCreating(false)}
            >
              取消
            </button>
            
            <button 
              className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg"
              onClick={generatePreview}
              disabled={!newCard.name || !newCard.description}
            >
              预览卡牌
            </button>
          </div>
        </div>
      )}
      
      {/* 卡牌预览 */}
      {previewCard && (
        <div className="card-preview bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">卡牌预览</h2>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-4 md:mb-0 md:mr-6">
              {renderCard(previewCard, -1)}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">{previewCard.name}</h3>
              <p className="mb-2">{previewCard.description}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <span className="text-gray-400">类型:</span> {getCardTypeName(previewCard.type)}
                </div>
                <div>
                  <span className="text-gray-400">元素:</span> {getElementName(previewCard.element)}
                </div>
                <div>
                  <span className="text-gray-400">消耗:</span> {previewCard.cost} 能量
                </div>
                <div>
                  <span className="text-gray-400">稀有度:</span> {previewCard.rarity}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="mb-2">
                  <span className="text-gray-400">正位效果:</span> {previewCard.uprightEffect}
                </div>
                <div>
                  <span className="text-gray-400">逆位效果:</span> {previewCard.reversedEffect}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg mr-2"
                  onClick={() => setPreviewCard(null)}
                >
                  取消
                </button>
                
                <button 
                  className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg"
                  onClick={saveCustomCard}
                >
                  保存卡牌
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 自定义卡牌列表 */}
      <div className="custom-cards">
        <h2 className="text-xl font-bold mb-4">我的自定义卡牌 ({customCards.length})</h2>
        
        {customCards.length > 0 ? (
          <div className="flex flex-wrap">
            {customCards.map((card, index) => renderCard(card, index))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">你还没有创建任何自定义卡牌</p>
            <button 
              className="mt-4 bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg"
              onClick={() => setIsCreating(true)}
            >
              创建第一张卡牌
            </button>
          </div>
        )}
      </div>
      
      {/* 参考卡牌 */}
      <div className="reference-cards mt-8">
        <h2 className="text-xl font-bold mb-4">参考卡牌</h2>
        <p className="mb-4 text-gray-400">这些是游戏中的一些卡牌，可以作为创建自定义卡牌的参考</p>
        
        <div className="flex flex-wrap">
          {initialDeck.slice(0, 5).map((card, index) => renderCard(card, index))}
        </div>
      </div>
    </div>
  )
}

export default CreativeWorkshop
