import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useProgressStore } from '../store/progressStore'
import { Card, CardPosition, HexCoord, Enemy } from '../types'
import { generateBattlefield, getNeighbors } from '../utils/battlefieldUtils'
import { getEnemiesByFloor } from '../data/enemies'

const GameBoard: React.FC = () => {
  const navigate = useNavigate()
  const { 
    playerCharacter, 
    currentFloor, 
    enemies, 
    battlefield, 
    currentTurn,
    selectedCard,
    destinyCoins,
    initializeGame,
    drawCards,
    playCard,
    endTurn,
    selectCard,
    flipCard,
    useDestinyCoin,
    movePlayer
  } = useGameStore()
  
  const { updateProgress } = useProgressStore()
  
  const [selectedHex, setSelectedHex] = useState<HexCoord | null>(null)
  const [validMoves, setValidMoves] = useState<HexCoord[]>([])
  const [showEndTurnModal, setShowEndTurnModal] = useState(false)
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [showVictoryModal, setShowVictoryModal] = useState(false)

  // 添加调试信息
  useEffect(() => {
    console.log('战场状态:', battlefield)
    console.log('玩家状态:', playerCharacter)
    console.log('敌人状态:', enemies)
  }, [battlefield, playerCharacter, enemies])

  // 初始化游戏
  useEffect(() => {
    console.log('初始化游戏开始')
    
    // 生成战场
    const newBattlefield = generateBattlefield(5, 5)
    console.log('生成战场:', newBattlefield)
    
    // 创建敌人并设置明确的位置
    const newEnemies = getEnemiesByFloor(currentFloor).map((enemy, index) => {
      // 为每个敌人分配一个固定位置
      let position = { q: 0, r: 0, s: 0 }
      
      if (index === 0) {
        position = { q: 3, r: 1, s: -4 }
      } else if (index === 1) {
        position = { q: 2, r: 3, s: -5 }
      } else {
        position = { q: 4, r: 2, s: -6 }
      }
      
      return {
        ...enemy,
        position: position
      }
    })
    
    console.log('生成敌人:', newEnemies)
    
    // 初始化游戏状态
    initializeGame(newBattlefield, newEnemies)
    
    // 抽取初始手牌
    drawCards(5)
    
    console.log('初始化游戏完成')
    
    // 强制刷新战场
    setTimeout(() => {
      setValidMoves([...validMoves])
    }, 500)
  }, [])

  // 计算可移动的格子
  useEffect(() => {
    if (selectedCard && selectedCard.type === 'movement') {
      const moveRange = selectedCard.effects.find(effect => effect.type === 'move')?.value || 0
      if (moveRange > 0 && playerCharacter) {
        const moves = getValidMoves(playerCharacter.position, moveRange)
        setValidMoves(moves)
      }
    } else {
      setValidMoves([])
    }
  }, [selectedCard])

  // 获取有效移动位置
  const getValidMoves = (startPos: HexCoord, range: number): HexCoord[] => {
    const visited = new Set<string>()
    const result: HexCoord[] = []
    
    const queue: { pos: HexCoord, dist: number }[] = [{ pos: startPos, dist: 0 }]
    visited.add(`${startPos.q},${startPos.r},${startPos.s}`)
    
    while (queue.length > 0) {
      const { pos, dist } = queue.shift()!
      
      if (dist > 0) {
        result.push(pos)
      }
      
      if (dist < range) {
        const neighbors = getNeighbors(pos)
        for (const neighbor of neighbors) {
          const key = `${neighbor.q},${neighbor.r},${neighbor.s}`
          
          // 检查是否在战场内且未访问过
          if (
            !visited.has(key) && 
            battlefield.tiles.some(row => row.some(tile => tile.coord.q === neighbor.q && tile.coord.r === neighbor.r && tile.coord.s === neighbor.s)) &&
            !isHexOccupied(neighbor)
          ) {
            visited.add(key)
            queue.push({ pos: neighbor, dist: dist + 1 })
          }
        }
      }
    }
    
    return result
  }

  // 检查格子是否被占用
  const isHexOccupied = (hex: HexCoord): boolean => {
    // 检查是否有敌人在此格子
    return enemies.some(enemy => 
      enemy.position && 
      enemy.position.q === hex.q && 
      enemy.position.r === hex.r && 
      enemy.position.s === hex.s
    )
  }

  // 处理格子点击
  const handleHexClick = (hex: HexCoord) => {
    // 如果选中了移动卡牌且点击的是有效移动位置
    if (
      selectedCard && 
      selectedCard.type === 'movement' && 
      validMoves.some(move => move.q === hex.q && move.r === hex.r && move.s === hex.s)
    ) {
      movePlayer(hex)
      playCard(selectedCard)
      selectCard(null)
      setValidMoves([])
    } 
    // 如果选中了攻击卡牌且点击的是敌人位置
    else if (selectedCard && selectedCard.type === 'attack') {
      const targetEnemy = enemies.find(enemy => 
        enemy.position && 
        enemy.position.q === hex.q && 
        enemy.position.r === hex.r && 
        enemy.position.s === hex.s
      )
      
      if (targetEnemy) {
        // 这里应该调用攻击敌人的函数
        // attackEnemy(targetEnemy.id, selectedCard)
        playCard(selectedCard)
        selectCard(null)
      }
    }
    
    setSelectedHex(hex)
  }

  // 处理卡牌点击
  const handleCardClick = (card: Card) => {
    if (selectedCard && selectedCard.id === card.id) {
      selectCard(null)
    } else {
      selectCard(card)
    }
  }

  // 处理卡牌翻转
  const handleFlipCard = (card: Card) => {
    flipCard(card.id)
  }

  // 处理回合结束
  const handleEndTurn = () => {
    endTurn()
    setShowEndTurnModal(true)
    
    // 模拟敌人回合
    setTimeout(() => {
      setShowEndTurnModal(false)
      // 检查游戏是否结束
      if (playerCharacter.health <= 0) {
        setShowGameOverModal(true)
      } else if (enemies.length === 0) {
        setShowVictoryModal(true)
        updateProgress({
          floorsCleared: currentFloor,
          experience: currentFloor * 10
        })
      }
    }, 2000)
  }

  // 处理使用命运硬币
  const handleUseDestinyCoin = () => {
    if (destinyCoins > 0) {
      useDestinyCoin()
    }
  }

  // 渲染敌人信息
  const renderEnemyInfo = (enemy: Enemy) => {
    return (
      <div key={enemy.id} className="p-2 bg-red-800 rounded-lg mb-2">
        <div className="flex justify-between">
          <span>{enemy.name}</span>
          <span>{enemy.health}/{enemy.maxHealth} HP</span>
        </div>
        <div className="text-sm">
          意图: {enemy.intent === 'attack' ? '攻击' : enemy.intent === 'defend' ? '防御' : '特殊'}
        </div>
      </div>
    )
  }

  // 渲染卡牌
  const renderCard = (card: Card, index: number) => {
    const isSelected = selectedCard && selectedCard.id === card.id
    
    let cardClass = "card p-2 rounded-lg shadow-md w-32 h-48 mx-1 transition-transform "
    if (isSelected) cardClass += "border-2 border-yellow-400 transform -translate-y-4 "
    
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
      <div 
        key={index}
        className={cardClass}
        onClick={() => handleCardClick(card)}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">{card.cost}能量</span>
          <button 
            className="text-xs bg-gray-600 px-1 rounded"
            onClick={(e) => {
              e.stopPropagation()
              handleFlipCard(card)
            }}
          >
            翻转
          </button>
        </div>
        <div className="text-center font-bold mb-1">{card.name}</div>
        <div className="text-xs mb-2">
          {card.position === CardPosition.UPRIGHT ? card.uprightEffect : card.reversedEffect}
        </div>
        <div className="text-xs text-center mt-auto">
          {card.position === CardPosition.UPRIGHT ? '正位' : '逆位'}
        </div>
      </div>
    )
  }

  return (
    <div className="game-board min-h-screen bg-gray-900 text-white p-4">
      {/* 顶部信息栏 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl">第 {currentFloor} 层</h2>
          <div>回合: {currentTurn}</div>
        </div>
        
        <div className="flex items-center">
          <button 
            className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg mr-4"
            onClick={handleEndTurn}
          >
            结束回合
          </button>
          
          <button 
            className="bg-yellow-700 hover:bg-yellow-600 px-4 py-2 rounded-lg flex items-center"
            onClick={handleUseDestinyCoin}
            disabled={destinyCoins <= 0}
          >
            <span className="mr-2">命运硬币: {destinyCoins}</span>
            <span className="text-2xl">🪙</span>
          </button>
        </div>
      </div>
      
      {/* 玩家信息 */}
      {playerCharacter && (
        <div className="player-info bg-blue-900 p-3 rounded-lg mb-4">
          <div className="flex justify-between">
            <span>{playerCharacter.name}</span>
            <span>{playerCharacter.health}/{playerCharacter.maxHealth} HP</span>
          </div>
          <div className="flex justify-between">
            <span>能量: {playerCharacter.energy}/{playerCharacter.maxEnergy}</span>
            <span>手牌: {playerCharacter.hand.length}</span>
          </div>
        </div>
      )}
      
      {/* 敌人信息 */}
      <div className="enemies-info mb-4">
        <h3 className="text-lg mb-2">敌人</h3>
        <div className="grid grid-cols-3 gap-2">
          {enemies.map(enemy => renderEnemyInfo(enemy))}
        </div>
      </div>
      
      {/* 战场区域 */}
      <div className="battlefield relative h-96 mb-4 border border-gray-700 rounded-lg overflow-hidden bg-gray-900 p-2">
        {/* 添加调试信息 */}
        <div className="absolute top-0 left-0 text-xs text-white bg-black bg-opacity-50 p-1 z-10">
          战场尺寸: {battlefield.tiles.length}x{battlefield.tiles[0]?.length || 0} | 
          玩家位置: {JSON.stringify(playerCharacter?.position)} | 
          敌人数量: {enemies.length}
        </div>
        
        {/* 使用更美观的网格布局 */}
        <div className="grid grid-cols-5 gap-2 p-4 h-full place-content-center">
          {battlefield.tiles.flat().map((tile, index) => {
            const hex = tile.coord;
            
            const isPlayerPosition = playerCharacter && 
              playerCharacter.position && 
              playerCharacter.position.q === hex.q && 
              playerCharacter.position.r === hex.r && 
              playerCharacter.position.s === hex.s;
            
            const enemy = enemies.find(e => 
              e.position && 
              e.position.q === hex.q && 
              e.position.r === hex.r && 
              e.position.s === hex.s
            );
            
            const isValidMove = validMoves.some(move => 
              move.q === hex.q && move.r === hex.r && move.s === hex.s
            );
            
            const isSelected = selectedHex && 
              selectedHex.q === hex.q && 
              selectedHex.r === hex.r && 
              selectedHex.s === hex.s;
            
            // 根据格子类型设置样式
            let bgColor = "bg-gray-700";
            let hoverEffect = "hover:bg-gray-600";
            let borderStyle = "border border-gray-600";
            let textColor = "text-gray-300";
            
            if (isPlayerPosition) {
              bgColor = "bg-blue-600";
              borderStyle = "border-2 border-blue-300";
              textColor = "text-white";
            } else if (enemy) {
              bgColor = "bg-red-600";
              borderStyle = "border-2 border-red-300";
              textColor = "text-white";
            } else if (isValidMove) {
              bgColor = "bg-green-600";
              hoverEffect = "hover:bg-green-500 cursor-pointer";
              borderStyle = "border-2 border-green-300";
              textColor = "text-white";
            } else if (isSelected) {
              bgColor = "bg-yellow-500";
              borderStyle = "border-2 border-yellow-300";
              textColor = "text-white";
            }
            
            return (
              <div 
                key={index}
                className={`w-14 h-14 flex flex-col items-center justify-center ${bgColor} ${hoverEffect} ${borderStyle} ${textColor} rounded-lg transform transition-all duration-200 shadow-md`}
                onClick={() => handleHexClick(hex)}
              >
                <div className="text-xs font-bold">
                  {isPlayerPosition && "玩家"}
                  {enemy && enemy.name}
                </div>
                <div className="text-xs opacity-70">
                  {`${hex.q},${hex.r}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 手牌区域 */}
      <div className="hand-area">
        <h3 className="text-lg mb-2">手牌</h3>
        <div className="flex justify-center overflow-x-auto py-4">
          {playerCharacter?.hand.map((card, index) => renderCard(card, index))}
        </div>
      </div>
      
      {/* 回合结束模态框 */}
      {showEndTurnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl mb-4">敌人回合</h3>
            <p>敌人正在行动...</p>
          </div>
        </div>
      )}
      
      {/* 游戏结束模态框 */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-2xl mb-4 text-red-500">游戏结束</h3>
            <p className="mb-6">你已经被击败了！</p>
            <div className="flex justify-center">
              <button 
                className="bg-blue-700 hover:bg-blue-600 px-6 py-2 rounded-lg mr-4"
                onClick={() => navigate('/')}
              >
                返回主菜单
              </button>
              <button 
                className="bg-green-700 hover:bg-green-600 px-6 py-2 rounded-lg"
                onClick={() => window.location.reload()}
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 胜利模态框 */}
      {showVictoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-2xl mb-4 text-green-500">胜利！</h3>
            <p className="mb-2">你已经击败了所有敌人！</p>
            <p className="mb-6">获得经验值: {currentFloor * 10}</p>
            <div className="flex justify-center">
              <button 
                className="bg-blue-700 hover:bg-blue-600 px-6 py-2 rounded-lg mr-4"
                onClick={() => navigate('/')}
              >
                返回主菜单
              </button>
              <button 
                className="bg-green-700 hover:bg-green-600 px-6 py-2 rounded-lg"
                onClick={() => {
                  // 这里应该调用进入下一层的函数
                  setShowVictoryModal(false)
                }}
              >
                继续探索
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
