import { Card, CardPosition, CardType, ElementType } from '../types'

// 初始卡组
export const initialDeck: Card[] = [
  {
    id: 'card_001',
    name: '火球术',
    description: '向目标发射一个火球',
    position: CardPosition.UPRIGHT,
    type: CardType.ATTACK,
    element: ElementType.FIRE,
    cost: 1,
    rarity: 1,
    baseDamage: 6,
    effects: [
      {
        type: 'damage',
        value: 6,
        target: 'single'
      }
    ],
    uprightEffect: [
      {
        type: 'damage',
        value: 6,
        target: 'single'
      }
    ],
    reversedEffect: [
      {
        type: 'damage',
        value: 4,
        target: 'single'
      },
      {
        type: 'aoe_damage',
        value: 2,
        target: 'adjacent'
      }
    ],
    imageUrl: '/assets/cards/fireball.png',
    uprightEffectDesc: '对单个目标造成6点火焰伤害',
    reversedEffectDesc: '对单个目标造成4点火焰伤害，并对周围1格范围内的敌人造成2点火焰伤害'
  },
  {
    id: 'card_002',
    name: '冰锥术',
    description: '向目标发射一根冰锥',
    position: CardPosition.UPRIGHT,
    type: CardType.ATTACK,
    element: ElementType.ICE,
    cost: 1,
    rarity: 1,
    baseDamage: 5,
    effects: [
      {
        type: 'damage',
        value: 5,
        target: 'single'
      },
      {
        type: 'freeze',
        value: 1,
        duration: 1,
        target: 'single'
      }
    ],
    imageUrl: '/assets/cards/ice_spike.png',
    uprightEffect: [
      {
        type: 'damage',
        value: 5,
        target: 'single'
      },
      {
        type: 'freeze',
        value: 1,
        duration: 1,
        target: 'single'
      }
    ],
    reversedEffect: [
      {
        type: 'damage',
        value: 3,
        target: 'single'
      },
      {
        type: 'freeze',
        value: 1,
        duration: 1,
        target: 'single'
      }
    ],
    uprightEffectDesc: '对单个目标造成5点冰冻伤害并施加1回合冰冻效果',
    reversedEffectDesc: '对单个目标造成3点冰冻伤害，并对周围1格范围内的敌人施加1回合减速效果'
  },
  {
    id: 'card_003',
    name: '治愈之光',
    description: '治疗自身或盟友',
    position: CardPosition.UPRIGHT,
    type: CardType.SKILL,
    element: ElementType.LIGHT,
    cost: 1,
    rarity: 1,
    effects: [
      {
        type: 'heal',
        value: 5,
        target: 'single_ally'
      }
    ],
    imageUrl: '/assets/cards/healing_light.png',
    uprightEffect: [
      {
        type: 'heal',
        value: 5,
        target: 'single_ally'
      }
    ],
    reversedEffect: [
      {
        type: 'heal',
        value: 3,
        target: 'single_ally'
      },
      {
        type: 'remove_negative_effect',
        value: 1,
        target: 'single_ally'
      }
    ],
    uprightEffectDesc: '治疗单个目标5点生命值',
    reversedEffectDesc: '治疗单个目标3点生命值，并移除一个负面效果'
  },
  {
    id: 'card_004',
    name: '防御姿态',
    description: '进入防御姿态，减少受到的伤害',
    position: CardPosition.UPRIGHT,
    type: CardType.DEFENSE,
    element: ElementType.NEUTRAL,
    cost: 1,
    rarity: 1,
    baseDefense: 5,
    effects: [
      {
        type: 'block',
        value: 5,
        target: 'self'
      }
    ],
    imageUrl: '/assets/cards/defense_stance.png',
    uprightEffect: [
      {
        type: 'block',
        value: 5,
        target: 'self'
      }
    ],
    reversedEffect: [
      {
        type: 'block',
        value: 3,
        target: 'self'
      },
      {
        type: 'energy_gain',
        value: 1,
        target: 'self'
      }
    ],
    uprightEffectDesc: '获得5点护盾',
    reversedEffectDesc: '获得3点护盾，并在下回合获得1点能量'
  },
  {
    id: 'card_005',
    name: '迅捷移动',
    description: '快速移动到指定位置',
    position: CardPosition.UPRIGHT,
    type: CardType.MOVEMENT,
    element: ElementType.WIND,
    cost: 0,
    rarity: 1,
    effects: [
      {
        type: 'move',
        value: 2,
        target: 'self'
      }
    ],
    imageUrl: '/assets/cards/swift_move.png',
    uprightEffect: [
      {
        type: 'move',
        value: 2,
        target: 'self'
      }
    ],
    reversedEffect: [
      {
        type: 'move',
        value: 1,
        target: 'self'
      },
      {
        type: 'damage',
        value: 1,
        target: 'adjacent'
      }
    ],
    uprightEffectDesc: '移动最多2格距离',
    reversedEffectDesc: '移动最多1格距离，并对经过的敌人造成1点伤害'
  },
  {
    id: 'card_006',
    name: '闪电链',
    description: '释放一道闪电，可以在敌人之间跳跃',
    position: CardPosition.UPRIGHT,
    type: CardType.ATTACK,
    element: ElementType.LIGHTNING,
    cost: 2,
    rarity: 2,
    baseDamage: 4,
    effects: [
      {
        type: 'chain_damage',
        value: 4,
        target: 'multi'
      }
    ],
    imageUrl: '/assets/cards/lightning_chain.png',
    uprightEffect: [
      {
        type: 'chain_damage',
        value: 4,
        target: 'multi'
      }
    ],
    reversedEffect: [
      {
        type: 'damage',
        value: 8,
        target: 'single'
      }
    ],
    uprightEffectDesc: '对最多3个相邻敌人造成4点雷电伤害',
    reversedEffectDesc: '对单个敌人造成8点雷电伤害'
  },
  {
    id: 'card_007',
    name: '大地护盾',
    description: '召唤大地的力量保护自己',
    position: CardPosition.UPRIGHT,
    type: CardType.DEFENSE,
    element: ElementType.EARTH,
    cost: 2,
    rarity: 2,
    baseDefense: 8,
    effects: [
      {
        type: 'block',
        value: 8,
        target: 'self'
      },
      {
        type: 'thorns',
        value: 2,
        duration: 2,
        target: 'self'
      }
    ],
    imageUrl: '/assets/cards/earth_shield.png',
    uprightEffect: [
      {
        type: 'block',
        value: 8,
        target: 'self'
      },
      {
        type: 'thorns',
        value: 2,
        duration: 2,
        target: 'self'
      }
    ],
    reversedEffect: [
      {
        type: 'block',
        value: 5,
        target: 'self'
      },
      {
        type: 'obstacle',
        value: 1,
        duration: 1,
        target: 'self'
      }
    ],
    uprightEffectDesc: '获得8点护盾和2点反伤，持续2回合',
    reversedEffectDesc: '获得5点护盾，并使周围1格范围内的地形变为障碍物，持续1回合'
  },
  {
    id: 'card_008',
    name: '暗影打击',
    description: '从暗影中发起突袭',
    position: CardPosition.UPRIGHT,
    type: CardType.ATTACK,
    element: ElementType.DARK,
    cost: 1,
    rarity: 2,
    baseDamage: 7,
    effects: [
      {
        type: 'damage',
        value: 7,
        target: 'single'
      },
      {
        type: 'weaken',
        value: 1,
        duration: 1,
        target: 'single'
      }
    ],
    imageUrl: '/assets/cards/shadow_strike.png',
    uprightEffect: [
      {
        type: 'damage',
        value: 7,
        target: 'single'
      },
      {
        type: 'weaken',
        value: 1,
        duration: 1,
        target: 'single'
      }
    ],
    reversedEffect: [
      {
        type: 'damage',
        value: 5,
        target: 'single'
      },
      {
        type: 'weaken',
        value: 1,
        duration: 1,
        target: 'single'
      }
    ],
    uprightEffectDesc: '对单个目标造成7点暗影伤害并施加1回合虚弱效果',
    reversedEffectDesc: '对单个目标造成5点暗影伤害，如果目标有负面效果，则额外造成3点伤害'
  },
  {
    id: 'card_009',
    name: '能量汲取',
    description: '从敌人身上汲取能量',
    position: CardPosition.UPRIGHT,
    type: CardType.SKILL,
    element: ElementType.DARK,
    cost: 1,
    rarity: 2,
    effects: [
      {
        type: 'energy_drain',
        value: 1,
        target: 'single_enemy'
      },
      {
        type: 'gain_energy',
        value: 1,
        target: 'self'
      }
    ],
    imageUrl: '/assets/cards/energy_drain.png',
    uprightEffect: [
      {
        type: 'energy_drain',
        value: 1,
        target: 'single_enemy'
      },
      {
        type: 'gain_energy',
        value: 1,
        target: 'self'
      }
    ],
    reversedEffect: [
      {
        type: 'damage',
        value: 2,
        target: 'single'
      },
      {
        type: 'gain_energy',
        value: 1,
        target: 'self'
      }
    ],
    uprightEffectDesc: '从敌人身上汲取1点能量',
    reversedEffectDesc: '对敌人造成2点伤害，如果击杀敌人，获得1点能量'
  },
  {
    id: 'card_010',
    name: '命运硬币',
    description: '使用命运硬币改变战局',
    position: CardPosition.UPRIGHT,
    type: CardType.SPECIAL,
    element: ElementType.NEUTRAL,
    cost: 0,
    rarity: 3,
    effects: [
      {
        type: 'draw_card',
        value: 2,
        target: 'self'
      }
    ],
    imageUrl: '/assets/cards/destiny_coin.png',
    uprightEffect: [
      {
        type: 'draw_card',
        value: 2,
        target: 'self'
      }
    ],
    reversedEffect: [
      {
        type: 'return_card',
        value: 1,
        target: 'self'
      },
      {
        type: 'energy_gain',
        value: 1,
        target: 'self'
      }
    ],
    uprightEffectDesc: '抽2张牌',
    reversedEffectDesc: '将1张手牌返回牌组顶部，获得1点能量'
  }
]

// 稀有卡牌
export const rareCards: Card[] = [
  {
    id: 'card_101',
    name: '火焰风暴',
    description: '召唤一场火焰风暴席卷战场',
    position: CardPosition.UPRIGHT,
    type: CardType.ATTACK,
    element: ElementType.FIRE,
    cost: 3,
    rarity: 4,
    baseDamage: 12,
    effects: [
      {
        type: 'aoe_damage',
        value: 12,
        target: 'all_enemies'
      },
      {
        type: 'burn',
        value: 2,
        duration: 2,
        target: 'all_enemies'
      }
    ],
    imageUrl: '/assets/cards/fire_storm.png',
    uprightEffect: [
      {
        type: 'aoe_damage',
        value: 12,
        target: 'all_enemies'
      },
      {
        type: 'burn',
        value: 2,
        duration: 2,
        target: 'all_enemies'
      }
    ],
    reversedEffect: [
      {
        type: 'aoe_damage',
        value: 8,
        target: 'all_enemies'
      },
      {
        type: 'obstacle',
        value: 1,
        duration: 2,
        target: 'all_enemies'
      }
    ],
    uprightEffectDesc: '对所有敌人造成12点火焰伤害，并施加2回合灼烧效果',
    reversedEffectDesc: '对所有敌人造成8点火焰伤害，并使战场上所有地形变为火焰地形，持续2回合'
  },
  {
    id: 'card_102',
    name: '时间扭曲',
    description: '扭曲时间，获得额外行动机会',
    position: CardPosition.UPRIGHT,
    type: CardType.SPECIAL,
    element: ElementType.NEUTRAL,
    cost: 3,
    rarity: 5,
    effects: [
      {
        type: 'extra_turn',
        value: 1,
        target: 'self'
      }
    ],
    imageUrl: '/assets/cards/time_warp.png',
    uprightEffect: [
      {
        type: 'extra_turn',
        value: 1,
        target: 'self'
      }
    ],
    reversedEffect: [
      {
        type: 'skip_turn',
        value: 1,
        target: 'self'
      },
      {
        type: 'energy_gain',
        value: 3,
        target: 'self'
      },
      {
        type: 'draw_card',
        value: 3,
        target: 'self'
      }
    ],
    uprightEffectDesc: '获得1个额外回合',
    reversedEffectDesc: '跳过下一回合，获得3点能量和3张牌'
  },
  {
    id: 'card_103',
    name: '元素融合',
    description: '融合多种元素力量',
    position: CardPosition.UPRIGHT,
    type: CardType.ATTACK,
    element: ElementType.NEUTRAL,
    cost: 2,
    rarity: 4,
    baseDamage: 8,
    effects: [
      {
        type: 'elemental_damage',
        value: 8,
        target: 'single'
      },
      {
        type: 'random_element_effect',
        value: 1,
        duration: 2,
        target: 'single'
      }
    ],
    imageUrl: '/assets/cards/elemental_fusion.png',
    uprightEffect: [
      {
        type: 'elemental_damage',
        value: 8,
        target: 'single'
      },
      {
        type: 'random_element_effect',
        value: 1,
        duration: 2,
        target: 'single'
      }
    ],
    reversedEffect: [
      {
        type: 'elemental_damage',
        value: 6,
        target: 'single'
      },
      {
        type: 'weakness_effect',
        value: 1,
        duration: 2,
        target: 'single'
      }
    ],
    uprightEffectDesc: '对单个目标造成8点元素伤害，并随机施加一种元素效果',
    reversedEffectDesc: '对单个目标造成6点元素伤害，并根据目标的弱点元素施加相应效果'
  }
]

// 根据稀有度获取卡牌
export const getCardsByRarity = (rarity: number): Card[] => {
  return [...initialDeck, ...rareCards].filter(card => card.rarity === rarity)
}

// 根据元素类型获取卡牌
export const getCardsByElement = (element: ElementType): Card[] => {
  return [...initialDeck, ...rareCards].filter(card => card.element === element)
}

// 根据卡牌类型获取卡牌
export const getCardsByType = (type: CardType): Card[] => {
  return [...initialDeck, ...rareCards].filter(card => card.type === type)
}
