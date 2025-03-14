import { 
  Card, 
  Character, 
  Enemy, 
  GameEffect, 
  ElementType,
  CardType
} from '../types'

// 计算元素相克关系的伤害倍率
export const calculateElementalMultiplier = (attackElement: ElementType, defenseElement: ElementType): number => {
  // 元素相克关系表
  const elementalRelations: Record<ElementType, { strengths: ElementType[], weaknesses: ElementType[] }> = {
    fire: {
      strengths: ['ice', 'wind'],
      weaknesses: ['water', 'earth']
    },
    ice: {
      strengths: ['wind', 'earth'],
      weaknesses: ['fire', 'lightning']
    },
    lightning: {
      strengths: ['water', 'ice'],
      weaknesses: ['earth', 'wind']
    },
    earth: {
      strengths: ['fire', 'lightning'],
      weaknesses: ['ice', 'wind']
    },
    wind: {
      strengths: ['lightning', 'earth'],
      weaknesses: ['fire', 'ice']
    },
    water: {
      strengths: ['fire', 'earth'],
      weaknesses: ['lightning', 'ice']
    },
    light: {
      strengths: ['dark'],
      weaknesses: []
    },
    dark: {
      strengths: ['light'],
      weaknesses: []
    },
    neutral: {
      strengths: [],
      weaknesses: []
    }
  }

  // 检查元素相克关系
  if (elementalRelations[attackElement].strengths.includes(defenseElement)) {
    return 1.5 // 克制，伤害提高50%
  } else if (elementalRelations[attackElement].weaknesses.includes(defenseElement)) {
    return 0.75 // 被克制，伤害降低25%
  } else if (attackElement === defenseElement) {
    return 0.9 // 同元素，伤害略微降低
  } else {
    return 1.0 // 无特殊关系
  }
}

// 计算卡牌造成的伤害
export const calculateCardDamage = (
  card: Card, 
  attacker: Character | Enemy, 
  defender: Character | Enemy,
  isUprightPosition: boolean
): number => {
  if (card.type !== CardType.ATTACK) {
    return 0
  }

  // 基础伤害
  let damage = card.baseDamage || 0

  // 应用攻击者的攻击力加成
  damage += attacker.attack || 0

  // 应用元素相克关系
  const elementMultiplier = calculateElementalMultiplier(card.element, defender.element)
  damage *= elementMultiplier

  // 应用卡牌位置效果
  if (isUprightPosition) {
    // 正位效果可能增加伤害
    damage *= 1.2
  } else {
    // 逆位效果可能降低伤害
    damage *= 0.8
  }

  // 应用防御者的防御力减免
  damage -= defender.defense || 0
  
  // 确保伤害至少为1
  return Math.max(1, Math.floor(damage))
}

// 计算卡牌提供的防御值
export const calculateCardDefense = (
  card: Card, 
  character: Character | Enemy,
  isUprightPosition: boolean
): number => {
  if (card.type !== CardType.DEFENSE) {
    return 0
  }

  // 基础防御
  let defense = card.baseDefense || 0

  // 应用角色的防御力加成
  defense += character.defense || 0

  // 应用卡牌位置效果
  if (isUprightPosition) {
    // 正位效果可能增加防御
    defense *= 1.2
  } else {
    // 逆位效果可能降低防御
    defense *= 0.8
  }

  return Math.floor(defense)
}

// 应用卡牌效果
export const applyCardEffects = (
  card: Card,
  caster: Character | Enemy,
  target: Character | Enemy,
  isUprightPosition: boolean
): GameEffect[] => {
  const effects: GameEffect[] = []
  
  // 获取正确的效果列表
  const effectsToApply = isUprightPosition 
    ? card.uprightEffect 
    : card.reversedEffect

  // 如果没有效果描述，返回空数组
  if (!effectsToApply) {
    return effects
  }

  // 这里简化处理，实际游戏中需要根据效果描述解析具体效果
  // 例如：解析"造成3点燃烧伤害，持续2回合"
  
  // 示例：添加一个持续效果
  if (effectsToApply.includes('燃烧') || effectsToApply.includes('火')) {
    effects.push({
      type: 'DOT',
      element: 'fire',
      value: 2,
      duration: 2,
      source: card.id
    })
  }
  
  if (effectsToApply.includes('冰冻') || effectsToApply.includes('冰')) {
    effects.push({
      type: 'STUN',
      element: 'ice',
      value: 0,
      duration: 1,
      source: card.id
    })
  }
  
  if (effectsToApply.includes('麻痹') || effectsToApply.includes('雷')) {
    effects.push({
      type: 'DEBUFF',
      element: 'lightning',
      value: -2,
      duration: 2,
      source: card.id,
      stat: 'speed'
    })
  }
  
  if (effectsToApply.includes('治疗') || effectsToApply.includes('恢复')) {
    effects.push({
      type: 'HEAL',
      element: 'light',
      value: 3,
      duration: 1,
      source: card.id
    })
  }
  
  if (effectsToApply.includes('增益') || effectsToApply.includes('强化')) {
    effects.push({
      type: 'BUFF',
      element: 'neutral',
      value: 2,
      duration: 2,
      source: card.id,
      stat: 'attack'
    })
  }

  return effects
}

// 检查实体是否已经死亡
export const isEntityDead = (entity: Character | Enemy): boolean => {
  return (entity.currentHp || 0) <= 0
}

// 应用伤害并返回新的实体状态
export const applyDamage = (
  entity: Character | Enemy,
  damage: number
): Character | Enemy => {
  const currentHp = entity.currentHp || entity.maxHp
  const newHp = Math.max(0, currentHp - damage)
  
  return {
    ...entity,
    currentHp: newHp
  }
}

// 应用治疗并返回新的实体状态
export const applyHealing = (
  entity: Character | Enemy,
  healing: number
): Character | Enemy => {
  const currentHp = entity.currentHp || entity.maxHp
  const newHp = Math.min(entity.maxHp, currentHp + healing)
  
  return {
    ...entity,
    currentHp: newHp
  }
}

// 应用状态效果
export const applyStatusEffect = (
  entity: Character | Enemy,
  effect: GameEffect
): Character | Enemy => {
  // 深拷贝实体
  const newEntity = JSON.parse(JSON.stringify(entity))
  
  // 添加新效果
  if (!newEntity.effects) {
    newEntity.effects = []
  }
  
  // 检查是否已存在相同类型的效果，如果存在则替换或叠加
  const existingEffectIndex = newEntity.effects.findIndex(
    (e: GameEffect) => e.type === effect.type && e.element === effect.element
  )
  
  if (existingEffectIndex >= 0) {
    // 根据效果类型决定是替换还是叠加
    if (effect.type === 'DOT' || effect.type === 'HEAL') {
      // 伤害或治疗效果通常叠加
      newEntity.effects[existingEffectIndex].value += effect.value
      // 重置持续时间为较长的一个
      newEntity.effects[existingEffectIndex].duration = Math.max(
        newEntity.effects[existingEffectIndex].duration,
        effect.duration
      )
    } else {
      // 其他效果通常替换为较强的一个
      if (Math.abs(effect.value) > Math.abs(newEntity.effects[existingEffectIndex].value)) {
        newEntity.effects[existingEffectIndex] = effect
      }
    }
  } else {
    // 添加新效果
    newEntity.effects.push(effect)
  }
  
  return newEntity
}

// 处理回合结束时的效果
export const processEndOfTurnEffects = (entity: Character | Enemy): Character | Enemy => {
  if (!entity.effects || entity.effects.length === 0) {
    return entity
  }
  
  // 深拷贝实体
  let newEntity = JSON.parse(JSON.stringify(entity))
  
  // 处理每个效果
  for (let i = 0; i < newEntity.effects.length; i++) {
    const effect = newEntity.effects[i]
    
    // 应用效果
    if (effect.type === 'DOT') {
      // 持续伤害
      newEntity = applyDamage(newEntity, effect.value)
    } else if (effect.type === 'HEAL') {
      // 持续治疗
      newEntity = applyHealing(newEntity, effect.value)
    }
    
    // 减少持续时间
    effect.duration -= 1
  }
  
  // 移除已过期的效果
  newEntity.effects = newEntity.effects.filter((effect: GameEffect) => effect.duration > 0)
  
  return newEntity
}

// 计算实体的当前属性值（考虑所有效果）
export const calculateCurrentStats = (entity: Character | Enemy): Character | Enemy => {
  if (!entity.effects || entity.effects.length === 0) {
    return entity
  }
  
  // 初始化基础属性
  const stats = {
    attack: entity.attack || 0,
    defense: entity.defense || 0,
    speed: entity.speed || 0,
    // 其他属性...
  }
  
  // 应用所有BUFF和DEBUFF效果
  for (const effect of entity.effects) {
    if ((effect.type === 'BUFF' || effect.type === 'DEBUFF') && effect.stat) {
      stats[effect.stat as keyof typeof stats] += effect.value
    }
  }
  
  // 确保属性值不会低于0
  Object.keys(stats).forEach(key => {
    stats[key as keyof typeof stats] = Math.max(0, stats[key as keyof typeof stats])
  })
  
  // 返回更新后的实体
  return {
    ...entity,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed
    // 其他属性...
  }
}
