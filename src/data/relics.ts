import { Relic } from '../types'

// 遗物数据
export const relics: Relic[] = [
  {
    id: 'relic_001',
    name: '命运硬币袋',
    description: '每场战斗开始时获得1枚额外的命运硬币',
    rarity: 'common',
    isUnlocked: true,
    effects: [
      {
        type: 'gain_destiny_coin',
        value: 1,
        timing: 'battle_start'
      }
    ],
    imageUrl: '/assets/relics/destiny_coin_pouch.png'
  },
  {
    id: 'relic_002',
    name: '能量水晶',
    description: '最大能量值+1',
    rarity: 'uncommon',
    isUnlocked: false,
    effects: [
      {
        type: 'increase_max_energy',
        value: 1,
        timing: 'permanent'
      }
    ],
    imageUrl: '/assets/relics/energy_crystal.png'
  },
  {
    id: 'relic_003',
    name: '生命之源',
    description: '最大生命值+10',
    rarity: 'common',
    isUnlocked: false,
    effects: [
      {
        type: 'increase_max_health',
        value: 10,
        timing: 'permanent'
      }
    ],
    imageUrl: '/assets/relics/life_source.png'
  },
  {
    id: 'relic_004',
    name: '抽牌护符',
    description: '每回合开始时额外抽1张牌',
    rarity: 'uncommon',
    isUnlocked: false,
    effects: [
      {
        type: 'draw_card',
        value: 1,
        timing: 'turn_start'
      }
    ],
    imageUrl: '/assets/relics/draw_amulet.png'
  },
  {
    id: 'relic_005',
    name: '元素共鸣',
    description: '所有元素卡牌伤害+10%',
    rarity: 'rare',
    isUnlocked: false,
    effects: [
      {
        type: 'increase_elemental_damage',
        value: 0.1,
        timing: 'permanent'
      }
    ],
    imageUrl: '/assets/relics/elemental_resonance.png'
  },
  {
    id: 'relic_006',
    name: '命运罗盘',
    description: '每场战斗开始时，可以预见并选择下3张将要抽到的牌',
    rarity: 'legendary',
    isUnlocked: false,
    effects: [
      {
        type: 'scry',
        value: 3,
        timing: 'battle_start'
      }
    ],
    imageUrl: '/assets/relics/destiny_compass.png'
  },
  {
    id: 'relic_007',
    name: '完美护盾',
    description: '每场战斗开始时获得5点护盾',
    rarity: 'uncommon',
    isUnlocked: false,
    effects: [
      {
        type: 'gain_block',
        value: 5,
        timing: 'battle_start'
      }
    ],
    imageUrl: '/assets/relics/perfect_shield.png'
  },
  {
    id: 'relic_008',
    name: '逆位增幅器',
    description: '逆位卡牌效果增强20%',
    rarity: 'rare',
    isUnlocked: false,
    effects: [
      {
        type: 'boost_reversed_cards',
        value: 0.2,
        timing: 'permanent'
      }
    ],
    imageUrl: '/assets/relics/reverse_amplifier.png'
  },
  {
    id: 'relic_009',
    name: '命运之眼',
    description: '可以看到敌人的意图',
    rarity: 'uncommon',
    isUnlocked: false,
    effects: [
      {
        type: 'see_enemy_intent',
        value: 1,
        timing: 'permanent'
      }
    ],
    imageUrl: '/assets/relics/destiny_eye.png'
  },
  {
    id: 'relic_010',
    name: '命运之心',
    description: '每当你使用一张逆位卡牌，恢复1点生命值',
    rarity: 'rare',
    isUnlocked: false,
    effects: [
      {
        type: 'heal_on_reversed_card',
        value: 1,
        timing: 'on_reversed_card_played'
      }
    ],
    imageUrl: '/assets/relics/destiny_heart.png'
  }
]

// 导出初始遗物数据
export const initialRelics = relics;

// 根据ID获取遗物
export const getRelicById = (id: string): Relic | undefined => {
  return relics.find(relic => relic.id === id)
}

// 获取已解锁的遗物
export const getUnlockedRelics = (): Relic[] => {
  return relics.filter(relic => relic.isUnlocked)
}

// 根据稀有度获取遗物
export const getRelicsByRarity = (rarity: string): Relic[] => {
  return relics.filter(relic => relic.rarity === rarity)
}

// 解锁遗物
export const unlockRelic = (id: string): boolean => {
  const relic = getRelicById(id)
  if (relic && !relic.isUnlocked) {
    relic.isUnlocked = true
    return true
  }
  return false
}
