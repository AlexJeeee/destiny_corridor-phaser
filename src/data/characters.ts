import { Character, CardPosition, CardType, ElementType, GridCoord } from '../types'
import { initialDeck } from './cards'

// 初始角色数据
export const initialPlayerCharacter: Character = {
  id: 'player_character',
  name: '命运行者',
  health: 80,
  maxHealth: 80,
  energy: 3,
  maxEnergy: 3,
  deck: initialDeck,
  hand: [],
  discard: [],
  position: { x: 0, y: 0 } as GridCoord,
  effects: [],
  description: '一位掌握命运之力的英雄',
  abilities: [
    {
      id: 'ability_1',
      name: '命运转换',
      description: '将一张手牌从正位转为逆位，或从逆位转为正位',
      cooldown: 2,
      currentCooldown: 0,
      cost: 1,
      effects: [
        {
          type: 'flip_card',
          value: 1,
          target: 'hand'
        }
      ]
    },
    {
      id: 'ability_2',
      name: '命运硬币',
      description: '获得1枚命运硬币',
      cooldown: 5,
      currentCooldown: 0,
      cost: 2,
      effects: [
        {
          type: 'gain_destiny_coin',
          value: 1
        }
      ]
    }
  ]
}

// 可解锁的角色列表
export const unlockableCharacters: Character[] = [
  {
    id: 'fire_mage',
    name: '烈焰法师',
    health: 70,
    maxHealth: 70,
    energy: 4,
    maxEnergy: 4,
    deck: initialDeck, // 使用相同的初始牌组
    hand: [],
    discard: [],
    position: { x: 0, y: 0 } as GridCoord,
    effects: [],
    description: '一位掌握火焰之力的法师',
    abilities: [
      {
        id: 'fire_ability_1',
        name: '火焰之心',
        description: '所有火系卡牌伤害+20%，持续2回合',
        cooldown: 3,
        currentCooldown: 0,
        cost: 2,
        effects: [
          {
            type: 'boost_element',
            value: 0.2,
            duration: 2,
            target: 'fire'
          }
        ]
      },
      {
        id: 'fire_ability_2',
        name: '燃烧大地',
        description: '将周围2格范围内的地形变为火焰地形',
        cooldown: 4,
        currentCooldown: 0,
        cost: 3,
        effects: [
          {
            type: 'change_terrain',
            value: 2,
            target: 'fire'
          }
        ]
      }
    ]
  },
  {
    id: 'shadow_assassin',
    name: '暗影刺客',
    health: 60,
    maxHealth: 60,
    energy: 3,
    maxEnergy: 3,
    deck: initialDeck, // 使用相同的初始牌组
    hand: [],
    discard: [],
    position: { x: 0, y: 0 } as GridCoord,
    effects: [],
    description: '一位掌握暗影之力的刺客',
    abilities: [
      {
        id: 'shadow_ability_1',
        name: '暗影潜行',
        description: '获得2回合的隐身效果，敌人无法以你为目标',
        cooldown: 4,
        currentCooldown: 0,
        cost: 2,
        effects: [
          {
            type: 'stealth',
            value: 1,
            duration: 2
          }
        ]
      },
      {
        id: 'shadow_ability_2',
        name: '致命一击',
        description: '对生命值低于30%的敌人造成双倍伤害',
        cooldown: 3,
        currentCooldown: 0,
        cost: 1,
        effects: [
          {
            type: 'execute',
            value: 2,
            condition: 'health_below_30'
          }
        ]
      }
    ]
  }
]

export const playerCharacters: Character[] = [
  initialPlayerCharacter,
  ...unlockableCharacters
]
