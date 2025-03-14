import { create } from 'zustand'
import { 
  GameState, 
  GamePhase, 
  Character, 
  Enemy, 
  Battlefield, 
  OracleEvent,
  Card,
  HexCoord,
  TerrainType,
  HexTile
} from '../types'
import { generateInitialBattlefield } from '../utils/battlefieldUtils'
import { initialPlayerCharacter } from '../data/characters'
import { initialEnemies } from '../data/enemies'

interface GameStateStore {
  gameState: GameState
  playerCharacter: Character
  currentFloor: number
  enemies: Enemy[]
  battlefield: Battlefield
  currentTurn: string
  selectedCard: Card | null
  destinyCoins: number
  initializeGame: (battlefield: Battlefield, enemies: Enemy[]) => void
  drawCards: (count: number) => void
  playCard: (card: Card) => void
  endTurn: () => void
  selectCard: (card: Card | null) => void
  flipCard: (cardId: string) => void
  useDestinyCoin: () => void
  movePlayer: (targetCoord: HexCoord) => void
}

// 创建初始游戏状态
const createInitialGameState = (): GameState => {
  const initialBattlefield = generateInitialBattlefield(10, 10)
  
  return {
    player: initialPlayerCharacter,
    enemies: initialEnemies,
    battlefield: initialBattlefield,
    currentFloor: 1,
    totalFloors: 10,
    oracleEvents: [],
    destinyCoins: 3,
    turn: 1,
    phase: GamePhase.DRAW
  }
}

export const useGameStore = create<GameStateStore>((set, get) => ({
  gameState: createInitialGameState(),
  playerCharacter: createInitialGameState().player,
  currentFloor: createInitialGameState().currentFloor,
  enemies: createInitialGameState().enemies,
  battlefield: createInitialGameState().battlefield,
  currentTurn: 'player',
  selectedCard: null,
  destinyCoins: createInitialGameState().destinyCoins,
  
  initializeGame: (battlefield: Battlefield, enemies: Enemy[]) => {
    const initialState = createInitialGameState();
    
    // 确保玩家角色被正确初始化，并设置位置在战场中心
    const centerCoord = { q: 0, r: 0, s: 0 }; // 使用固定的中心坐标
    
    // 创建玩家角色
    const player = { 
      ...initialState.player,
      position: centerCoord,
      hand: [] // 初始化空手牌
    };
    
    // 在战场上放置玩家和敌人
    const updatedBattlefield = { 
      ...battlefield,
      entities: [player, ...enemies]
    };
    
    // 更新游戏状态
    set({ 
      gameState: {
        ...initialState,
        player: player,
        battlefield: updatedBattlefield,
        enemies: enemies
      },
      playerCharacter: player,
      battlefield: updatedBattlefield,
      enemies: enemies
    });
    
    console.log("游戏初始化完成:", {
      player,
      battlefield: updatedBattlefield,
      enemies
    });
  },
  
  drawCards: (count: number) => {
    set((state) => {
      const { gameState, playerCharacter } = state
      const { player } = gameState
      
      // 简单实现抽牌逻辑
      const drawnCards: Card[] = []
      for (let i = 0; i < count; i++) {
        if (player.deck.length > 0) {
          const randomIndex = Math.floor(Math.random() * player.deck.length)
          const card = player.deck[randomIndex]
          drawnCards.push(card)
          player.deck.splice(randomIndex, 1)
        }
      }
      
      // 更新玩家手牌
      const updatedPlayer = {
        ...player,
        hand: [...player.hand, ...drawnCards]
      }
      
      // 更新玩家角色状态
      const updatedPlayerCharacter = {
        ...playerCharacter,
        hand: [...playerCharacter.hand, ...drawnCards]
      }
      
      console.log("抽牌完成:", {
        drawnCards,
        updatedPlayerHand: updatedPlayer.hand,
        updatedPlayerCharacterHand: updatedPlayerCharacter.hand
      });
      
      return {
        gameState: {
          ...gameState,
          player: updatedPlayer,
          phase: GamePhase.PLAYER_TURN
        },
        playerCharacter: updatedPlayerCharacter
      }
    })
  },
  
  playCard: (card: Card) => {
    set((state) => {
      const { gameState } = state
      const { player, battlefield } = gameState
      
      // 查找要打出的卡牌
      const cardIndex = player.hand.findIndex(c => c.id === card.id)
      if (cardIndex === -1) return { gameState }
      
      // 检查能量是否足够
      if (player.energy < card.cost) return { gameState }
      
      // 移除手牌并添加到弃牌堆
      const newHand = [...player.hand]
      newHand.splice(cardIndex, 1)
      
      // 简单实现卡牌效果（这里只是示例）
      // 实际游戏中需要更复杂的效果处理系统
      
      return {
        gameState: {
          ...gameState,
          player: {
            ...player,
            hand: newHand,
            discard: [...player.discard, card],
            energy: player.energy - card.cost
          }
        }
      }
    })
  },
  
  endTurn: () => {
    set((state) => {
      const { gameState } = state
      
      return {
        gameState: {
          ...gameState,
          phase: GamePhase.ENEMY_TURN
        }
      }
    })
  },
  
  selectCard: (card: Card | null) => {
    set({ selectedCard: card })
  },
  
  flipCard: (cardId: string) => {
    set((state) => {
      const { gameState } = state
      const { player } = gameState
      
      // 查找要翻转的卡牌
      const cardIndex = player.hand.findIndex(card => card.id === cardId)
      if (cardIndex === -1) return { gameState }
      
      const newHand = [...player.hand]
      newHand[cardIndex] = {
        ...newHand[cardIndex],
        flipped: !newHand[cardIndex].flipped
      }
      
      return {
        gameState: {
          ...gameState,
          player: {
            ...player,
            hand: newHand
          }
        }
      }
    })
  },
  
  useDestinyCoin: () => {
    set((state) => {
      const { gameState } = state
      
      if (gameState.destinyCoins > 0) {
        return {
          gameState: {
            ...gameState,
            destinyCoins: gameState.destinyCoins - 1
          }
        }
      }
      
      return { gameState }
    })
  },
  
  movePlayer: (targetCoord: HexCoord) => {
    set((state) => {
      const { gameState } = state
      const { player, battlefield } = gameState
      
      // 简单实现移动逻辑
      const newPosition = targetCoord
      
      return {
        gameState: {
          ...gameState,
          player: {
            ...player,
            position: newPosition
          }
        }
      }
    })
  }
}))
