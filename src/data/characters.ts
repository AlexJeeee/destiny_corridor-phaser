import { Character, GridCoord, AbilityEffectType } from '../types'
import { initialDeck } from './cards'

// 初始角色数据
export const initialPlayerCharacter: Character = {
  id: 'warrior',
  name: '战士',
  health: 80,
  maxHealth: 80,
  energy: 3,
  maxEnergy: 3,
  deck: initialDeck,
  hand: [],
  discard: [],
  position: { x: 0, y: 0 } as GridCoord,
  effects: [],
  description: '擅长近战，拥有强大的防御能力',
  abilities: [
    {
      id: 'ability_1',
      name: '叠甲，过',
      description: '获得2点护甲',
      cooldown: 1,
      currentCooldown: 0,
      cost: 1,
      isPassive: true,
      effects: [
        {
          type: AbilityEffectType.GAIN_ARMOR,
          value: 2
        }
      ]
    },
    {
      id: 'ability_2',
      name: '血怒',
      description: '生命值低于30%时，伤害+50%',
      cooldown: 0,
      currentCooldown: 0,
      cost: 0,
      isPassive: false,
      effects: [
        {
          type: AbilityEffectType.BOOST_DAMAGE,
          value: 0.5,
          condition: {
            selfHealth: 0.3
          }
        }
      ]
    },
  ],
  moveRange: 2,
  attackRange: 2
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
        isPassive: true,
        effects: [
          {
            type: AbilityEffectType.BOOST_ELEMENT,
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
        isPassive: true,
        effects: [
          {
            type: AbilityEffectType.CHANGE_TERRAIN,
            value: 2,
            target: 'fire'
          }
        ]
      }
    ],
    moveRange: 2,
    attackRange: 3
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
        isPassive: true,
        effects: [
          {
            type: AbilityEffectType.STEALTH,
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
        cost: 0,
        isPassive: false,
        effects: [
          {
            type: AbilityEffectType.EXECUTE,
            value: 2,
            condition: {
              targetHealth: 0.3
            }
          }
        ]
      }
    ],
    moveRange: 3,
    attackRange: 2
  }
]

export const playerCharacters: Character[] = [
  initialPlayerCharacter,
  ...unlockableCharacters
]
