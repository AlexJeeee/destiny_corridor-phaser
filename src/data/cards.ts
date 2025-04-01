import { Card, CardPosition, CardType, ElementType, CardEffectType, Target } from '../types'

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
    baseDamage: 66,
    effects: [
      {
        id: 'card_fireball',
        name: '火球术',
        description: '向目标发射一个火球',
        type: CardEffectType.DAMAGE,
        value: 6,
        target: Target.SINGLE_ENEMY
      }
    ],
    uprightEffect: [
      {
        id: 'card_fireball',
        name: '火球术',
        description: '向目标发射一个火球',
        type: CardEffectType.DAMAGE,
        value: 6,
        target: Target.SINGLE_ENEMY
      }
    ],
    reversedEffect: [
      {
        id: 'card_fireball',
        name: '火球术',
        description: '向目标发射一个火球',
        type: CardEffectType.DAMAGE,
        value: 4,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_fireball_area',
        name: '火球术',
        description: '向目标周围1格范围内的敌人造成2点火焰伤害',
        type: CardEffectType.AOE_DAMAGE,
        value: 2,
        target: Target.AREA
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
        id: 'card_ice_spike',
        name: '冰锥术',
        description: '向目标发射一根冰锥',
        type: CardEffectType.DAMAGE,
        value: 5,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_ice_freeze',
        name: '冰锥术',
        description: '一回合冰冻',
        type: CardEffectType.FREEZE,
        value: 1,
        duration: 1,
        target: Target.SINGLE_ENEMY
      }
    ],
    imageUrl: '/assets/cards/ice_spike.png',
    uprightEffect: [
      {
        id: 'card_ice_spike',
        name: '冰锥术',
        description: '向目标发射一根冰锥',
        type: CardEffectType.DAMAGE,
        value: 5,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_ice_freeze',
        name: '冰锥术',
        description: '一回合冰冻',
        type: CardEffectType.FREEZE,
        value: 1,
        duration: 1,
        target: Target.SINGLE_ENEMY
      }
    ],
    reversedEffect: [
      {
        id: 'card_ice_spike',
        name: '冰锥术',
        description: '向目标发射一根冰锥',
        type: CardEffectType.DAMAGE,
        value: 3,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_ice_freeze_area',
        name: '冰锥术',
        description: '周围一格范围内的敌人施加1回合减速效果',
        type: CardEffectType.FREEZE,
        value: 1,
        duration: 1,
        target: Target.AREA
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
        id: 'card_healing_light',
        name: '治愈之光',
        description: '治疗单个目标5点生命值',
        type: CardEffectType.HEAL,
        value: 5,
        target: Target.SINGLE_ALLY
      }
    ],
    imageUrl: '/assets/cards/healing_light.png',
    uprightEffect: [
      {
        id: 'card_healing_light',
        name: '治愈之光',
        description: '治疗单个目标5点生命值',
        type: CardEffectType.HEAL,
        value: 5,
        target: Target.SINGLE_ALLY
      }
    ],
    reversedEffect: [
      {
        id: 'card_healing_light',
        name: '治愈之光',
        description: '治疗单个目标3点生命值',
        type: CardEffectType.HEAL,
        value: 3,
        target: Target.SINGLE_ALLY
      },
      {
        id: 'card_healing_light',
        name: '治愈之光',
        description: '移除单个目标一个负面效果',
        type: CardEffectType.REMOVE_NEGATIVE_EFFECT,
        value: 1,
        target: Target.SINGLE_ALLY
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
        id: 'card_defense_stance',
        name: '防御姿态',
        description: '获得5点防御，持续1回合',
        type: CardEffectType.DEFENSE,
        duration: 1,
        value: 5,
        target: Target.SELF
      }
    ],
    imageUrl: '/assets/cards/defense_stance.png',
    uprightEffect: [
      {
        id: 'card_defense_stance',
        name: '防御姿态',
        description: '获得5点防御，持续1回合',
        type: CardEffectType.DEFENSE,
        duration: 1,
        value: 5,
        target: Target.SELF
      }
    ],
    reversedEffect: [
      {
        id: 'card_defense_stance',
        name: '防御姿态',
        description: '获得3点防御，持续1回合',
        type: CardEffectType.DEFENSE,
        duration: 1,
        value: 3,
        target: Target.SELF
      },
      {
        id: 'card_energy_gain',
        name: '防御姿态',
        description: '获得1点能量',
        type: CardEffectType.ENERGY_GAIN,
        value: 1,
        target: Target.SELF
      }
    ],
    uprightEffectDesc: '获得5点防御，持续1回合',
    reversedEffectDesc: '获得3点防御，持续1回合，并在下回合获得1点能量'
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
        id: 'card_swift_move',
        name: '迅捷移动',
        description: '移动最多2格距离',
        type: CardEffectType.MOVE,
        value: 2,
        target: Target.SELF
      }
    ],
    imageUrl: '/assets/cards/swift_move.png',
    uprightEffect: [
      {
        id: 'card_swift_move',
        name: '迅捷移动',
        description: '移动最多2格距离',
        type: CardEffectType.MOVE,
        value: 2,
        target: Target.SELF
      }
    ],
    reversedEffect: [
      {
        id: 'card_swift_move',
        name: '迅捷移动',
        description: '移动最多1格距离',
        type: CardEffectType.MOVE,
        value: 1,
        target: Target.SELF
      },
      {
        id: 'card_swift_move_damage',
        name: '迅捷移动',
        description: '对经过的敌人造成1点伤害',
        type: CardEffectType.DAMAGE,
        value: 1,
        target: Target.ADJACENT
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
        id: 'card_lightning_chain',
        name: '闪电链',
        description: '对最多3个相邻敌人造成4点雷电伤害',
        type: CardEffectType.CHAIN_DAMAGE,
        value: 4,
        target: Target.MULTI
      }
    ],
    imageUrl: '/assets/cards/lightning_chain.png',
    uprightEffect: [
      {
        id: 'card_lightning_chain',
        name: '闪电链',
        description: '对最多3个相邻敌人造成4点雷电伤害',
        type: CardEffectType.CHAIN_DAMAGE,
        value: 4,
        target: Target.MULTI
      }
    ],
    reversedEffect: [
      {
        id: 'card_lightning',
        name: '闪电链',
        description: '对单个敌人造成8点雷电伤害',
        type: CardEffectType.DAMAGE,
        value: 8,
        target: Target.SINGLE_ENEMY
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
        id: 'card_earth_shield',
        name: '大地护盾',
        description: '获得8点护盾',
        type: CardEffectType.DEFENSE,
        value: 8,
        target: Target.SELF
      },
      {
        id: 'card_thorns',
        name: '反伤',
        description: '获得2点反伤',
        type: CardEffectType.THORNS,
        value: 2,
        duration: 2,
        target: Target.SELF
      }
    ],
    imageUrl: '/assets/cards/earth_shield.png',
    uprightEffect: [
      {
        id: 'card_earth_shield',
        name: '大地护盾',
        description: '获得8点护盾',
        type: CardEffectType.DEFENSE,
        value: 8,
        target: Target.SELF
      },
      {
        id: 'card_thorns',
        name: '反伤',
        description: '获得2点反伤',
        type: CardEffectType.THORNS,
        value: 2,
        duration: 2,
        target: Target.SELF
      }
    ],
    reversedEffect: [
      {
        id: 'card_earth_shield',
        name: '大地护盾',
        description: '获得5点护盾',
        type: CardEffectType.DEFENSE,
        value: 5,
        target: Target.SELF
      },
      {
        id: 'card_obstacle',
        name: '障碍物',
        description: '使周围1格范围内的地形变为障碍物',
        type: CardEffectType.OBSTACLE,
        value: 1,
        duration: 1,
        target: Target.SELF
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
        id: 'card_damage',
        name: '暗影打击',
        description: '对单个敌人造成7点暗影伤害',
        type: CardEffectType.DAMAGE,
        value: 7,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_weaken',
        name: '虚弱',
        description: '对单个敌人施加1回合虚弱效果',
        type: CardEffectType.WEAKEN,
        value: 1,
        duration: 1,
        target: Target.SINGLE_ENEMY
      }
    ],
    imageUrl: '/assets/cards/shadow_strike.png',
    uprightEffect: [
      {
        id: 'card_damage',
        name: '暗影打击',
        description: '对单个敌人造成7点暗影伤害',
        type: CardEffectType.DAMAGE,
        value: 7,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_weaken',
        name: '虚弱',
        description: '对单个敌人施加1回合虚弱效果',
        type: CardEffectType.WEAKEN,
        value: 1,
        duration: 1,
        target: Target.SINGLE_ENEMY
      }
    ],
    reversedEffect: [
      {
        id: 'card_damage',
        name: '暗影打击',
        description: '对单个敌人造成5点暗影伤害',
        type: CardEffectType.DAMAGE,
        value: 5,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_weaken',
        name: '虚弱',
        description: '对单个敌人施加1回合虚弱效果，如果目标有负面效果，则额外造成3点伤害',
        type: CardEffectType.WEAKEN,
        value: 1,
        duration: 1,
        target: Target.SINGLE_ENEMY
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
        id: 'card_energy_drain',
        name: '能量汲取',
        description: '从单个敌人身上汲取1点能量',
        type: CardEffectType.ENERGY_DRAIN,
        value: 1,
        target: Target.SINGLE_ENEMY
      },
    ],
    imageUrl: '/assets/cards/energy_drain.png',
    uprightEffect: [
      {
        id: 'card_energy_drain',
        name: '能量汲取',
        description: '从单个敌人身上汲取1点能量',
        type: CardEffectType.ENERGY_DRAIN,
        value: 1,
        target: Target.SINGLE_ENEMY
      },
    ],
    reversedEffect: [
      {
        id: 'card_damage',
        name: '暗影打击',
        description: '对单个敌人造成2点暗影伤害',
        type: CardEffectType.DAMAGE,
        value: 2,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_energy_gain',
        name: '能量汲取',
        description: '如果击杀敌人，获得1点能量',
        type: CardEffectType.ENERGY_GAIN,
        value: 1,
        target: Target.SELF
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
        id: 'card_draw_card',
        name: '命运硬币',
        description: '抽2张牌',
        type: CardEffectType.DRAW_CARD,
        value: 2,
        target: Target.SELF
      }
    ],
    imageUrl: '/assets/cards/destiny_coin.png',
    uprightEffect: [
      {
        id: 'card_draw_card',
        name: '命运硬币',
        description: '抽2张牌',
        type: CardEffectType.DRAW_CARD,
        value: 2,
        target: Target.SELF
      }
    ],
    reversedEffect: [
      {
        id: 'card_return_card',
        name: '命运硬币',
        description: '将1张手牌返回牌组顶部',
        type: CardEffectType.RETURN_CARD,
        value: 1,
        target: Target.SELF
      },
      {
        id: 'card_energy_gain',
        name: '命运硬币',
        description: '获得1点能量',
        type: CardEffectType.ENERGY_GAIN,
        value: 1,
        target: Target.SELF
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
        id: 'card_damage',
        name: '火焰风暴',
        description: '对所有敌人造成12点火焰伤害，并施加2回合灼烧效果',
        type: CardEffectType.AOE_DAMAGE,
        value: 12,
        target: Target.ALL_ENEMIES
      },
      {
        id: 'card_burn',
        name: '火焰风暴',
        description: '对所有敌人造成12点火焰伤害，并施加2回合灼烧效果',
        type: CardEffectType.BURN,
        value: 2,
        duration: 2,
        target: Target.ALL_ENEMIES
      }
    ],
    imageUrl: '/assets/cards/fire_storm.png',
    uprightEffect: [
      {
        id: 'card_damage',
        name: '火焰风暴',
        description: '对所有敌人造成12点火焰伤害，并施加2回合灼烧效果',
        type: CardEffectType.AOE_DAMAGE,
        value: 12,
        target: Target.ALL_ENEMIES
      },
      {
        id: 'card_burn',
        name: '火焰风暴',
        description: '对所有敌人造成12点火焰伤害，并施加2回合灼烧效果',
        type: CardEffectType.BURN,
        value: 2,
        duration: 2,
        target: Target.ALL_ENEMIES
      }
    ],
    reversedEffect: [
      {
        id: 'card_damage',
        name: '火焰风暴',
        description: '对所有敌人造成8点火焰伤害，并使战场上所有地形变为火焰地形，持续2回合',
        type: CardEffectType.AOE_DAMAGE,
        value: 8,
        target: Target.ALL_ENEMIES
      },
      {
        id: 'card_obstacle',
        name: '火焰风暴',
        description: '使战场上所有地形变为火焰地形，持续2回合',
        type: CardEffectType.OBSTACLE,
        value: 1,
        duration: 2,
        target: Target.ALL_ENEMIES
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
        id: 'card_extra_turn',
        name: '时间扭曲',
        description: '获得1个额外回合',
        type: CardEffectType.EXTRA_TURN,
        value: 1,
        target: Target.SELF
      }
    ],
    imageUrl: '/assets/cards/time_warp.png',
    uprightEffect: [
      {
        id: 'card_extra_turn',
        name: '时间扭曲',
        description: '获得1个额外回合',
        type: CardEffectType.EXTRA_TURN,
        value: 1,
        target: Target.SELF
      }
    ],
    reversedEffect: [
      {
        id: 'card_skip_turn',
        name: '时间扭曲',
        description: '跳过下一回合',
        type: CardEffectType.SKIP_TURN,
        value: 1,
        target: Target.SELF
      },
      {
        id: 'card_energy_gain',
        name: '时间扭曲',
        description: '获得3点能量',
        type: CardEffectType.ENERGY_GAIN,
        value: 3,
        target: Target.SELF
      },
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
        id: 'card_damage',
        name: '元素融合',
        description: '对单个敌人造成8点元素伤害',
        type: CardEffectType.ELEMENTAL_DAMAGE,
        value: 8,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_elemental_effect',
        name: '元素融合',
        description: '施加随机元素效果',
        type: CardEffectType.RANDOM_ELEMENT_EFFECT,
        value: 1,
        duration: 2,
        target: Target.SINGLE_ENEMY
      },
    ],
    imageUrl: '/assets/cards/elemental_fusion.png',
    uprightEffect: [
      {
        id: 'card_damage',
        name: '元素融合',
        description: '对单个敌人造成8点元素伤害',
        type: CardEffectType.ELEMENTAL_DAMAGE,
        value: 8,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_elemental_effect',
        name: '元素融合',
        description: '施加随机元素效果',
        type: CardEffectType.RANDOM_ELEMENT_EFFECT,
        value: 1,
        duration: 2,
        target: Target.SINGLE_ENEMY
      },
    ],
    reversedEffect: [
      {
        id: 'card_damage',
        name: '元素融合',
        description: '对单个敌人造成6点元素伤害',
        type: CardEffectType.ELEMENTAL_DAMAGE,
        value: 6,
        target: Target.SINGLE_ENEMY
      },
      {
        id: 'card_elemental_effect',
        name: '元素融合',
        description: '施加随机元素效果',
        type: CardEffectType.RANDOM_ELEMENT_EFFECT,
        value: 1,
        duration: 2,
        target: Target.SINGLE_ENEMY
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
