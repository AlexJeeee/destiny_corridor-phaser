import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { useGameStore } from '../store/gameStore'
import { Character, ElementType } from '../types'
import { playerCharacters } from '../data/characters'
import { generateBattlefield } from '../utils/battlefieldUtils'
import { getEnemiesByFloor } from '../data/enemies'

const CharacterSelection: React.FC = () => {
  const navigate = useNavigate()
  const { playerProgress } = useProgressStore()
  const { initializeGame } = useGameStore()
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [unlockedCharacters, setUnlockedCharacters] = useState<Character[]>([])
  const [lockedCharacters, setLockedCharacters] = useState<Character[]>([])
  
  // 初始化角色列表
  useEffect(() => {
    const unlocked: Character[] = []
    const locked: Character[] = []
    
    playerCharacters.forEach(character => {
      if (character.id === 'default' || playerProgress.unlockedCharacters.includes(character.id)) {
        unlocked.push(character)
      } else {
        locked.push(character)
      }
    })
    
    setUnlockedCharacters(unlocked)
    setLockedCharacters(locked)
    
    // 默认选择第一个角色
    if (unlocked.length > 0 && !selectedCharacter) {
      setSelectedCharacter(unlocked[0])
    }
  }, [playerProgress, selectedCharacter])
  
  // 处理角色选择
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character)
  }
  
  // 开始游戏
  const handleStartGame = () => {
    if (selectedCharacter) {
      // 生成初始战场和敌人
      const initialBattlefield = generateBattlefield(5, 5);
      const initialEnemies = getEnemiesByFloor(1); // 假设从第1层开始
      
      // 初始化游戏状态
      initializeGame(initialBattlefield, initialEnemies);
      navigate('/game')
    }
  }
  
  // 渲染角色卡片
  const renderCharacterCard = (character: Character, isLocked: boolean = false) => {
    const cardClass = `character-card p-4 rounded-lg ${
      selectedCharacter?.id === character.id ? 'border-4 border-yellow-400' : 'border border-gray-700'
    } ${isLocked ? 'opacity-50' : 'cursor-pointer hover:bg-gray-700'}`
    
    return (
      <div 
        key={character.id}
        className={cardClass}
        onClick={() => !isLocked && handleSelectCharacter(character)}
      >
        <div className="flex flex-col items-center">
          <div className="character-avatar w-24 h-24 rounded-full bg-gray-600 mb-3 overflow-hidden">
            {character.avatarUrl ? (
              <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {character.name.charAt(0)}
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold mb-1">{character.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{character.title}</p>
          
          {isLocked && (
            <div className="locked-badge bg-red-800 text-white text-xs px-2 py-1 rounded mb-2">
              未解锁
            </div>
          )}
          
          <div className="character-stats grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div><span className="text-gray-400">生命:</span> {character.maxHp}</div>
            <div><span className="text-gray-400">攻击:</span> {character.attack}</div>
            <div><span className="text-gray-400">防御:</span> {character.defense}</div>
            <div><span className="text-gray-400">速度:</span> {character.speed}</div>
          </div>
          
          <div className="character-element mt-2 px-3 py-1 rounded text-xs" 
            style={{
              backgroundColor: getElementColor(character.element)
            }}
          >
            {getElementName(character.element)}
          </div>
        </div>
      </div>
    )
  }
  
  // 获取元素颜色
  const getElementColor = (element: ElementType | string | undefined): string => {
    if (!element) return '#718096'; // 默认颜色
    
    const colors: Record<string, string> = {
      [ElementType.FIRE]: '#e53e3e',
      [ElementType.ICE]: '#3182ce',
      [ElementType.LIGHTNING]: '#d69e2e',
      [ElementType.EARTH]: '#38a169',
      [ElementType.WIND]: '#319795',
      [ElementType.WATER]: '#4299e1',
      [ElementType.LIGHT]: '#f6e05e',
      [ElementType.DARK]: '#6b46c1',
      [ElementType.NEUTRAL]: '#718096'
    }
    
    return colors[element as string] || colors[ElementType.NEUTRAL]
  }
  
  // 获取元素名称
  const getElementName = (element: ElementType | string | undefined): string => {
    if (!element) return '未知';
    
    const names: Record<string, string> = {
      [ElementType.FIRE]: '火',
      [ElementType.ICE]: '冰',
      [ElementType.LIGHTNING]: '雷',
      [ElementType.EARTH]: '土',
      [ElementType.WIND]: '风',
      [ElementType.WATER]: '水',
      [ElementType.LIGHT]: '光',
      [ElementType.DARK]: '暗',
      [ElementType.NEUTRAL]: '中性'
    }
    
    return names[element as string] || '未知'
  }
  
  // 渲染角色详情
  const renderCharacterDetails = () => {
    if (!selectedCharacter) return null
    
    return (
      <div className="character-details bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row">
          <div className="character-image md:w-1/3 mb-6 md:mb-0 flex justify-center">
            <div className="w-48 h-48 rounded-full bg-gray-700 overflow-hidden">
              {selectedCharacter.avatarUrl ? (
                <img 
                  src={selectedCharacter.avatarUrl} 
                  alt={selectedCharacter.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {selectedCharacter.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          
          <div className="character-info md:w-2/3 md:pl-6">
            <h2 className="text-2xl font-bold mb-1">{selectedCharacter.name}</h2>
            <p className="text-lg text-gray-400 mb-4">{selectedCharacter.title}</p>
            
            <p className="mb-4">{selectedCharacter.description}</p>
            
            <div className="character-abilities mb-4">
              <h3 className="text-lg font-bold mb-2">特殊能力</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedCharacter.abilities && selectedCharacter.abilities.map((ability, index) => (
                  <li key={index}>{ability.name}: {ability.description}</li>
                ))}
              </ul>
            </div>
            
            <div className="character-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="stat-box bg-gray-700 p-3 rounded text-center">
                <div className="text-gray-400 text-sm">生命</div>
                <div className="text-xl font-bold">{selectedCharacter.maxHp}</div>
              </div>
              <div className="stat-box bg-gray-700 p-3 rounded text-center">
                <div className="text-gray-400 text-sm">攻击</div>
                <div className="text-xl font-bold">{selectedCharacter.attack}</div>
              </div>
              <div className="stat-box bg-gray-700 p-3 rounded text-center">
                <div className="text-gray-400 text-sm">防御</div>
                <div className="text-xl font-bold">{selectedCharacter.defense}</div>
              </div>
              <div className="stat-box bg-gray-700 p-3 rounded text-center">
                <div className="text-gray-400 text-sm">速度</div>
                <div className="text-xl font-bold">{selectedCharacter.speed}</div>
              </div>
            </div>
            
            <div className="character-element-details flex items-center mb-6">
              <div className="element-badge px-3 py-1 rounded text-sm mr-3" 
                style={{
                  backgroundColor: getElementColor(selectedCharacter.element)
                }}
              >
                {getElementName(selectedCharacter.element)}
              </div>
              <div className="element-description text-sm">
                {getElementDescription(selectedCharacter.element)}
              </div>
            </div>
            
            <button 
              className="w-full bg-purple-700 hover:bg-purple-600 py-3 rounded-lg font-bold"
              onClick={handleStartGame}
            >
              选择此角色开始游戏
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // 获取元素描述
  const getElementDescription = (element: ElementType | string | undefined): string => {
    if (!element) return '这个元素没有特殊描述。';
    
    const descriptions: Record<string, string> = {
      [ElementType.FIRE]: '火元素角色擅长造成持续伤害，对冰元素和风元素敌人有优势。',
      [ElementType.ICE]: '冰元素角色擅长控制和减速敌人，对风元素和土元素敌人有优势。',
      [ElementType.LIGHTNING]: '雷元素角色擅长造成高爆发伤害，对水元素和冰元素敌人有优势。',
      [ElementType.EARTH]: '土元素角色擅长防御和生存，对火元素和雷元素敌人有优势。',
      [ElementType.WIND]: '风元素角色擅长机动和连击，对雷元素和土元素敌人有优势。',
      [ElementType.WATER]: '水元素角色擅长治疗和辅助，对火元素和土元素敌人有优势。',
      [ElementType.LIGHT]: '光元素角色擅长治疗和增益效果，对暗元素敌人有优势。',
      [ElementType.DARK]: '暗元素角色擅长诅咒和削弱敌人，对光元素敌人有优势。',
      [ElementType.NEUTRAL]: '中性元素角色比较均衡，没有明显的优势和劣势。'
    }
    
    return descriptions[element as string] || '这个元素没有特殊描述。'
  }
  
  return (
    <div className="character-selection min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">选择你的角色</h1>
          <button 
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg"
            onClick={() => navigate('/')}
          >
            返回主菜单
          </button>
        </div>
        
        {/* 角色详情 */}
        {renderCharacterDetails()}
        
        {/* 已解锁角色 */}
        <div className="unlocked-characters mt-8">
          <h2 className="text-xl font-bold mb-4">可用角色</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {unlockedCharacters.map(character => renderCharacterCard(character))}
          </div>
        </div>
        
        {/* 未解锁角色 */}
        {lockedCharacters.length > 0 && (
          <div className="locked-characters mt-8">
            <h2 className="text-xl font-bold mb-4">未解锁角色</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {lockedCharacters.map(character => renderCharacterCard(character, true))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterSelection
