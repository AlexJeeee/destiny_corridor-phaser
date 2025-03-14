import { Enemy, GridCoord } from '../types'

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
        cost: 0,
        effects: [
          {
            type: 'damage',
            value: 5,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/fire_imp.png'
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
        cost: 0,
        effects: [
          {
            type: 'aoe_damage',
            value: 4,
            target: 'aoe_1'
          },
          {
            type: 'slow',
            value: 1,
            duration: 1,
            target: 'aoe_1'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/frost_troll.png'
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
        cost: 0,
        effects: [
          {
            type: 'damage',
            value: 8,
            target: 'player'
          },
          {
            type: 'weaken',
            value: 1,
            duration: 1,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/shadow_assassin.png'
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
        cost: 0,
        effects: [
          {
            type: 'aoe_damage',
            value: 8,
            target: 'all'
          },
          {
            type: 'burn',
            value: 2,
            duration: 2,
            target: 'all'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/fire_elemental.png'
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
        cost: 0,
        effects: [
          {
            type: 'damage',
            value: 15,
            target: 'player'
          },
          {
            type: 'stun',
            value: 1,
            duration: 1,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/thunder_beast.png'
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
        cost: 0,
        effects: [
          {
            type: 'flip_all_cards',
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
        cost: 0,
        effects: [
          {
            type: 'damage',
            value: 25,
            target: 'player'
          }
        ]
      }
    ],
    imageUrl: '/assets/enemies/destiny_guardian.png'
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
