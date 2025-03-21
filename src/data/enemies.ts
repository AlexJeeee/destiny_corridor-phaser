import { Enemy, GridCoord, CardEffectType, AbilityEffectType } from '../types'

// 初始敌人数据
export const initialEnemies: Enemy[] = [
  {
    id: 'enemy_001',
    name: '火焰小鬼',
    health: 20,
    maxHealth: 20,
    intent: 'attack',
    damage: 5,
    position: { x: 3, y: 3 } as GridCoord,
    effects: [],
    abilities: [
      {
        id: 'enemy_ability_001',
        name: '火球术',
        description: '发射一个小火球',
        cooldown: 2,
        currentCooldown: 0,
        cost: 1,
        isPassive: false,
        effects: [
          {
            id: 'enemy_ability_fireball',
            name: '火球术',
            description: '发射一个小火球',
            type: AbilityEffectType.DAMAGE,
            value: 8,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/fire_imp.png',
    moveRange: 1,
    attackRange: 1
  },
  {
    id: 'enemy_002',
    name: '冰霜巨魔',
    health: 35,
    maxHealth: 35,
    intent: 'defend',
    damage: 7,
    position: { x: 4, y: 2 } as GridCoord,
    effects: [],
    abilities: [
      {
        id: 'enemy_ability_002',
        name: '冰霜新星',
        description: '释放冰霜新星，对周围敌人造成伤害并减速',
        cooldown: 3,
        currentCooldown: 0,
        cost: 2,
        isPassive: false,
        effects: [
          {
            id: 'enemy_ability_frostnova',
            name: '冰霜新星',
            description: '释放冰霜新星，对周围敌人造成伤害并减速',
            type: AbilityEffectType.AOE_DAMAGE,
            value: 4,
            range: 1
          },
          {
            id: 'enemy_ability_frostnova',
            name: '冰霜新星',
            description: '释放冰霜新星，对周围敌人造成伤害并减速',
            type: AbilityEffectType.SLOW,
            value: 1,
            duration: 1,
            range: 1
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/frost_troll.png',
    moveRange: 1,
    attackRange: 1
  },
  {
    id: 'enemy_003',
    name: '暗影刺客',
    health: 25,
    maxHealth: 25,
    intent: 'attack',
    damage: 8,
    position: { x: 5, y: 1 } as GridCoord,
    effects: [],
    abilities: [
      {
        id: 'enemy_ability_003',
        name: '暗影突袭',
        description: '突袭玩家，造成伤害并使其虚弱',
        cooldown: 2,
        currentCooldown: 0,
        cost: 2,
        isPassive: false,
        effects: [
          {
            id: 'enemy_ability_shadowstrike',
            name: '暗影突袭',
            description: '突袭玩家，造成伤害并使其虚弱',
            type: AbilityEffectType.DAMAGE,
            value: 8,
            target: 'player'
          },
          {
            id: 'enemy_ability_weaken',
            name: '暗影突袭',
            description: '突袭玩家，造成伤害并使其虚弱',
            type: AbilityEffectType.WEAKEN,
            value: 1,
            duration: 1,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/shadow_assassin.png',
    moveRange: 3,
    attackRange: 1
  }
]

// 精英敌人数据
export const eliteEnemies: Enemy[] = [
  {
    id: 'elite_001',
    name: '火焰元素',
    health: 60,
    maxHealth: 60,
    intent: 'attack',
    damage: 12,
    position: { x: 0, y: 0 } as GridCoord,
    effects: [],
    abilities: [
      {
        id: 'elite_ability_001',
        name: '烈焰风暴',
        description: '释放烈焰风暴，对所有敌人造成伤害',
        cooldown: 3,
        currentCooldown: 0,
        cost: 2,
        isPassive: false,
        effects: [
          {
            id: 'elite_ability_damage',
            name: '烈焰风暴',
            description: '释放烈焰风暴，对所有敌人造成伤害',
            type: AbilityEffectType.AOE_DAMAGE,
            value: 8,
            range: 'all'
          },
          {
            id: 'elite_ability_burn',
            name: '烈焰风暴',
            description: '释放烈焰风暴，对所有敌人造成伤害',
            type: AbilityEffectType.BURN,
            value: 2,
            duration: 2,
            range: 'all'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/fire_elemental.png',
    moveRange: 2,
    attackRange: 2
  },
  {
    id: 'elite_002',
    name: '雷霆巨兽',
    health: 70,
    maxHealth: 70,
    intent: 'attack',
    damage: 10,
    position: { x: 0, y: 0 } as GridCoord,
    effects: [],
    abilities: [
      {
        id: 'elite_ability_002',
        name: '雷霆一击',
        description: '对玩家造成大量伤害并使其眩晕',
        cooldown: 4,
        currentCooldown: 0,
        cost: 2,
        isPassive: false,
        effects: [
          {
            id: 'elite_ability_damage',
            name: '雷霆一击',
            description: '对玩家造成大量伤害并使其眩晕',
            type: AbilityEffectType.DAMAGE,
            value: 15,
            target: 'player'
          },
          {
            id: 'elite_ability_stun',
            name: '雷霆一击',
            description: '眩晕',
            type: AbilityEffectType.STUN,
            value: 1,
            duration: 1,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/thunder_beast.png',
    moveRange: 2,
    attackRange: 2
  }
]

// Boss敌人数据
export const bossEnemies: Enemy[] = [
  {
    id: 'boss_001',
    name: '命运守护者',
    health: 150,
    maxHealth: 150,
    intent: 'special',
    damage: 15,
    position: { x: 0, y: 0 } as GridCoord,
    effects: [],
    abilities: [
      {
        id: 'boss_ability_001',
        name: '命运扭曲',
        description: '扭曲命运，随机改变所有卡牌的位置',
        cooldown: 3,
        currentCooldown: 0,
        cost: 2,
        isPassive: false,
        effects: [
          {
            id: 'boss_ability_flip_all_cards',
            name: '命运扭曲',
            description: '扭曲命运，随机改变所有卡牌的位置',
            type: AbilityEffectType.FLIP_ALL_CARDS,
            value: 1,
            target: 'all_cards'
          }
        ]
      },
      {
        id: 'boss_ability_002',
        name: '毁灭打击',
        description: '对玩家造成巨大伤害',
        cooldown: 5,
        currentCooldown: 0,
        cost: 2,
        isPassive: false,
        effects: [
          {
            id: 'boss_ability_damage',
            name: '毁灭打击',
            description: '对玩家造成巨大伤害',
            type: AbilityEffectType.DAMAGE,
            value: 25,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/destiny_guardian.png',
    moveRange: 3,
    attackRange: 3
  }
]

// 根据当前楼层获取敌人
export const getEnemiesByFloor = (floor: number): Enemy[] => {
  const enemies: Enemy[] = []
  
  // 基础敌人数量随楼层增加
  const basicEnemyCount = Math.min(3, 1 + Math.floor(floor / 3))
  
  // 精英敌人出现概率随楼层增加
  const eliteEnemyChance = Math.min(0.5, 0.1 + floor * 0.05)
  
  // 添加基础敌人
  for (let i = 0; i < basicEnemyCount; i++) {
    const randomIndex = Math.floor(Math.random() * initialEnemies.length)
    const enemy = JSON.parse(JSON.stringify(initialEnemies[randomIndex]))
    enemy.id = `${enemy.id}_${i}`
    
    // 随楼层增加敌人强度
    const floorMultiplier = 1 + (floor - 1) * 0.1
    enemy.health = Math.floor(enemy.health * floorMultiplier)
    enemy.maxHealth = enemy.health
    enemy.damage = Math.floor(enemy.damage * floorMultiplier)
    
    enemies.push(enemy)
  }
  
  // 添加精英敌人
  if (Math.random() < eliteEnemyChance) {
    const randomIndex = Math.floor(Math.random() * eliteEnemies.length)
    const eliteEnemy = JSON.parse(JSON.stringify(eliteEnemies[randomIndex]))
    
    // 随楼层增加敌人强度
    const floorMultiplier = 1 + (floor - 1) * 0.1
    eliteEnemy.health = Math.floor(eliteEnemy.health * floorMultiplier)
    eliteEnemy.maxHealth = eliteEnemy.health
    eliteEnemy.damage = Math.floor(eliteEnemy.damage * floorMultiplier)
    
    enemies.push(eliteEnemy)
  }
  
  // 在第10楼和第20楼添加Boss
  if (floor % 10 === 0) {
    const bossIndex = Math.floor((floor / 10) - 1) % bossEnemies.length
    const boss = JSON.parse(JSON.stringify(bossEnemies[bossIndex]))
    
    // 随楼层增加Boss强度
    const floorMultiplier = 1 + (floor - 1) * 0.1
    boss.health = Math.floor(boss.health * floorMultiplier)
    boss.maxHealth = boss.health
    boss.damage = Math.floor(boss.damage * floorMultiplier)
    
    enemies.push(boss)
  }
  
  return enemies
}
