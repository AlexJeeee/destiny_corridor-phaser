import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { rareCards } from '../data/cards'
import { relics } from '../data/relics'

// 奖励类型
type RewardType = 'card' | 'relic' | 'health' | 'energy' | 'coin'

// 奖励项
interface RewardItem {
  id: string
  type: RewardType
  name: string
  description: string
  color: string
}

const DestinyWheel: React.FC = () => {
  const navigate = useNavigate()
  const { playerProgress, updateProgress } = useProgressStore()
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [spinning, setSpinning] = useState(false)
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null)
  const [rotation, setRotation] = useState(0)
  const [destinyPoints, setDestinyPoints] = useState(playerProgress.destinyPoints || 0)
  const wheelRef = useRef<HTMLDivElement>(null)

  // 初始化奖励
  useEffect(() => {
    generateRewards()
  }, [])

  // 生成随机奖励
  const generateRewards = () => {
    const newRewards: RewardItem[] = []
    
    // 添加卡牌奖励
    const unlockedCardIds = playerProgress.unlockedCardIds || []
    const availableCards = rareCards.filter(card => !unlockedCardIds.includes(card.id))
    
    if (availableCards.length > 0) {
      // 随机选择2张卡牌
      for (let i = 0; i < Math.min(2, availableCards.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length)
        const card = availableCards.splice(randomIndex, 1)[0]
        
        newRewards.push({
          id: card.id,
          type: 'card',
          name: card.name,
          description: `获得稀有卡牌: ${card.name}`,
          color: 'bg-purple-600'
        })
      }
    }
    
    // 添加遗物奖励
    const unlockedRelics = playerProgress.unlockedRelics || []
    const unlockedRelicIds = unlockedRelics.map(relic => relic.id)
    const availableRelics = relics.filter(relic => !unlockedRelicIds.includes(relic.id) && !relic.isUnlocked)
    
    if (availableRelics.length > 0) {
      // 随机选择1个遗物
      const randomIndex = Math.floor(Math.random() * availableRelics.length)
      const relic = availableRelics[randomIndex]
      
      newRewards.push({
        id: relic.id,
        type: 'relic',
        name: relic.name,
        description: `获得遗物: ${relic.name}`,
        color: 'bg-yellow-600'
      })
    }
    
    // 添加生命值奖励
    newRewards.push({
      id: 'health_boost',
      type: 'health',
      name: '生命提升',
      description: '永久增加10点最大生命值',
      color: 'bg-red-600'
    })
    
    // 添加能量奖励
    newRewards.push({
      id: 'energy_boost',
      type: 'energy',
      name: '能量提升',
      description: '永久增加1点最大能量值',
      color: 'bg-blue-600'
    })
    
    // 添加命运硬币奖励
    newRewards.push({
      id: 'destiny_coins',
      type: 'coin',
      name: '命运硬币',
      description: '获得3枚命运硬币',
      color: 'bg-green-600'
    })
    
    // 如果奖励不足8个，随机添加更多奖励
    while (newRewards.length < 8) {
      const types: RewardType[] = ['health', 'energy', 'coin']
      const randomType = types[Math.floor(Math.random() * types.length)]
      
      if (randomType === 'health') {
        newRewards.push({
          id: 'health_boost_extra',
          type: 'health',
          name: '生命提升',
          description: '永久增加10点最大生命值',
          color: 'bg-red-600'
        })
      } else if (randomType === 'energy') {
        newRewards.push({
          id: 'energy_boost_extra',
          type: 'energy',
          name: '能量提升',
          description: '永久增加1点最大能量值',
          color: 'bg-blue-600'
        })
      } else {
        newRewards.push({
          id: 'destiny_coins_extra',
          type: 'coin',
          name: '命运硬币',
          description: '获得3枚命运硬币',
          color: 'bg-green-600'
        })
      }
    }
    
    setRewards(newRewards)
  }

  // 旋转命运之轮
  const spinWheel = () => {
    if (spinning || destinyPoints < 10) return
    
    setSpinning(true)
    setDestinyPoints(prev => prev - 10)
    
    // 更新命运点数
    updateProgress({
      destinyPoints: destinyPoints - 10
    })
    
    // 随机旋转角度 (5-10圈 + 随机角度)
    const spinDegrees = 1800 + Math.floor(Math.random() * 1800)
    const finalRotation = rotation + spinDegrees
    setRotation(finalRotation)
    
    // 计算最终停止位置
    setTimeout(() => {
      const sectorAngle = 360 / rewards.length
      const normalizedDegree = finalRotation % 360
      const sectorIndex = Math.floor((360 - normalizedDegree) / sectorAngle)
      const reward = rewards[sectorIndex % rewards.length]
      
      setSelectedReward(reward)
      setSpinning(false)
    }, 5000) // 旋转时间
  }

  // 领取奖励
  const claimReward = () => {
    if (!selectedReward) return
    
    // 根据奖励类型更新进度
    if (selectedReward.type === 'card') {
      updateProgress({
        unlockedCardIds: [...(playerProgress.unlockedCardIds || []), selectedReward.id]
      })
    } else if (selectedReward.type === 'relic') {
      // 找到对应的遗物对象
      const selectedRelic = relics.find(r => r.id === selectedReward.id)
      if (selectedRelic) {
        updateProgress({
          unlockedRelics: [...(playerProgress.unlockedRelics || []), {
            ...selectedRelic,
            isUnlocked: true
          }]
        })
      }
    } else if (selectedReward.type === 'health') {
      updateProgress({
        maxHealthBonus: (playerProgress.maxHealthBonus || 0) + 10
      })
    } else if (selectedReward.type === 'energy') {
      updateProgress({
        maxEnergyBonus: (playerProgress.maxEnergyBonus || 0) + 1
      })
    } else if (selectedReward.type === 'coin') {
      updateProgress({
        destinyCoins: (playerProgress.destinyCoins || 0) + 3
      })
    }
    
    // 重置选中的奖励
    setSelectedReward(null)
    
    // 重新生成奖励
    generateRewards()
  }

  // 渲染命运之轮扇区
  const renderWheelSectors = () => {
    const sectorAngle = 360 / rewards.length
    
    return rewards.map((reward, index) => {
      const startAngle = index * sectorAngle
      const endAngle = (index + 1) * sectorAngle
      
      // 计算扇区路径
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      
      const x1 = 150 + 140 * Math.cos(startRad)
      const y1 = 150 + 140 * Math.sin(startRad)
      const x2 = 150 + 140 * Math.cos(endRad)
      const y2 = 150 + 140 * Math.sin(endRad)
      
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
      
      const pathData = [
        `M 150 150`,
        `L ${x1} ${y1}`,
        `A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ')
      
      // 计算文本位置
      const textAngle = startAngle + sectorAngle / 2
      const textRad = (textAngle * Math.PI) / 180
      const textX = 150 + 80 * Math.cos(textRad)
      const textY = 150 + 80 * Math.sin(textRad)
      
      return (
        <g key={index}>
          <path
            d={pathData}
            fill={reward.color}
            stroke="#333"
            strokeWidth="1"
          />
          <text
            x={textX}
            y={textY}
            fill="white"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            {reward.name}
          </text>
        </g>
      )
    })
  }

  return (
    <div className="destiny-wheel min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">命运之轮</h1>
        <div className="flex items-center">
          <span className="mr-4">命运点数: {destinyPoints}</span>
          <button 
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg"
            onClick={() => navigate('/')}
          >
            返回主菜单
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* 左侧 - 命运之轮 */}
        <div className="w-full md:w-2/3 flex justify-center items-center mb-8 md:mb-0">
          <div className="relative w-80 h-80">
            {/* 命运之轮 */}
            <div 
              ref={wheelRef}
              className="absolute inset-0 transition-transform duration-5000 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg width="300" height="300" viewBox="0 0 300 300">
                {renderWheelSectors()}
                <circle cx="150" cy="150" r="20" fill="#333" />
              </svg>
            </div>
            
            {/* 指针 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-yellow-500"></div>
            </div>
          </div>
        </div>
        
        {/* 右侧 - 控制面板 */}
        <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">命运之轮</h2>
          
          <p className="mb-4">
            使用命运点数旋转命运之轮，获得随机奖励。每次旋转消耗10点命运点数。
          </p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">可能的奖励:</h3>
            <ul className="list-disc list-inside">
              <li>稀有卡牌</li>
              <li>遗物</li>
              <li>最大生命值提升</li>
              <li>最大能量值提升</li>
              <li>命运硬币</li>
            </ul>
          </div>
          
          <button 
            className={`w-full py-3 rounded-lg font-bold mb-4 ${
              destinyPoints >= 10 && !spinning
                ? 'bg-yellow-600 hover:bg-yellow-500'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
            onClick={spinWheel}
            disabled={spinning || destinyPoints < 10}
          >
            {spinning ? '旋转中...' : '旋转命运之轮 (10点)'}
          </button>
          
          <div className="text-center text-sm text-gray-400">
            通过完成成就和探索命运回廊获得命运点数
          </div>
          
          {/* 获得的奖励 */}
          {selectedReward && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">恭喜!</h3>
              <p className="mb-4">{selectedReward.description}</p>
              <button 
                className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold"
                onClick={claimReward}
              >
                领取奖励
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DestinyWheel
