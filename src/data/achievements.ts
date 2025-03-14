import { Achievement } from '../types'

// 成就数据
export const achievements: Achievement[] = [
  {
    id: 'achievement_001',
    name: '初次探索',
    description: '完成第一次命运回廊探索',
    requiredProgress: 1,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '完成一次游戏',
    reward: {
      type: 'character',
      value: 1,
      id: 'character_002'
    }
  },
  {
    id: 'achievement_002',
    name: '卡牌收藏家',
    description: '收集30张不同的卡牌',
    requiredProgress: 30,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '收集30张不同卡牌',
    reward: {
      type: 'character',
      value: 1,
      id: 'character_003'
    }
  },
  {
    id: 'achievement_003',
    name: '命运挑战者',
    description: '到达第10层',
    requiredProgress: 10,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '在一次探索中到达第10层',
    reward: {
      type: 'coin',
      value: 1,
      id: 'coin_001'
    }
  },
  {
    id: 'achievement_004',
    name: '元素掌控者',
    description: '在一次战斗中使用5种不同元素的卡牌',
    requiredProgress: 5,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '在一次战斗中使用5种不同元素卡牌',
    reward: {
      type: 'card',
      value: 1,
      id: 'card_001'
    }
  },
  {
    id: 'achievement_005',
    name: '命运征服者',
    description: '击败命运守护者',
    requiredProgress: 1,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '击败命运守护者Boss',
    reward: {
      type: 'function',
      value: 1,
      id: 'function_001'
    }
  },
  {
    id: 'achievement_006',
    name: '完美战术',
    description: '在不受到伤害的情况下完成一场战斗',
    requiredProgress: 1,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '完成一场无伤战斗',
    reward: {
      type: 'relic',
      value: 1,
      id: 'relic_001'
    }
  },
  {
    id: 'achievement_007',
    name: '逆位大师',
    description: '在一次战斗中使用5张逆位卡牌',
    requiredProgress: 5,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '在一次战斗中使用5张逆位卡牌',
    reward: {
      type: 'card',
      value: 1,
      id: 'card_002'
    }
  },
  {
    id: 'achievement_008',
    name: '能量专家',
    description: '在一回合内使用6点能量',
    requiredProgress: 1,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '在一回合内使用6点能量',
    reward: {
      type: 'energy',
      value: 1,
      id: 'energy_001'
    }
  },
  {
    id: 'achievement_009',
    name: '命运探索者',
    description: '完成10次命运回廊探索',
    requiredProgress: 10,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '完成10次游戏',
    reward: {
      type: 'relic',
      value: 1,
      id: 'relic_002'
    }
  },
  {
    id: 'achievement_010',
    name: '命运大师',
    description: '解锁所有成就',
    requiredProgress: 9,
    progress: 0,
    isUnlocked: false,
    completed: false,
    requirement: '解锁其他所有成就',
    reward: {
      type: 'character',
      value: 1,
      id: 'character_001'
    }
  }
]

// 导出初始成就数据
export const initialAchievements = achievements;

// 根据ID获取成就
export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(achievement => achievement.id === id)
}

// 获取已解锁的成就
export const getUnlockedAchievements = (): Achievement[] => {
  return achievements.filter(achievement => achievement.isUnlocked)
}

// 获取进行中的成就
export const getInProgressAchievements = (): Achievement[] => {
  return achievements.filter(achievement => !achievement.isUnlocked && achievement.progress > 0)
}

// 更新成就进度
export const updateAchievementProgress = (id: string, progress: number): Achievement | undefined => {
  const achievement = getAchievementById(id)
  if (achievement) {
    achievement.progress = Math.min(achievement.requiredProgress, achievement.progress + progress)
    if (achievement.progress >= achievement.requiredProgress) {
      achievement.isUnlocked = true
      achievement.completed = true
    }
    return achievement
  }
  return undefined
}
