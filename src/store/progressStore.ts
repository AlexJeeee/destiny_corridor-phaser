import { create } from 'zustand'
import { UserProgress, Relic, Achievement } from '../types'
import { initialAchievements } from '../data/achievements'
import { initialRelics } from '../data/relics'

interface ProgressState {
  progress: UserProgress
  playerProgress: UserProgress
  loadProgress: () => void
  saveProgress: () => void
  unlockCharacter: (characterId: string) => void
  unlockRelic: (relicId: string) => void
  updateAchievementProgress: (achievementId: string, progress: number) => void
  recordRunResult: (victory: boolean, floor: number) => void
  updateProgress: (progressUpdate: Partial<UserProgress>) => void
}

const initialProgress: UserProgress = {
  unlockedCharacters: ['default_character'],
  unlockedRelics: [],
  achievements: initialAchievements,
  achievementIds: [],
  highestFloor: 0,
  totalRuns: 0,
  totalVictories: 0,
  totalDeaths: 0,
  level: 1,
  unlockedCardIds: [],
  destinyPoints: 0,
  destinyCoins: 0,
  maxHealthBonus: 0,
  maxEnergyBonus: 0,
  customCards: []
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: initialProgress,
  playerProgress: initialProgress,
  
  loadProgress: () => {
    const savedProgress = localStorage.getItem('destiny-corridor-progress')
    if (savedProgress) {
      set({ progress: JSON.parse(savedProgress) })
    }
  },
  
  saveProgress: () => {
    const { progress } = get()
    localStorage.setItem('destiny-corridor-progress', JSON.stringify(progress))
  },
  
  unlockCharacter: (characterId: string) => {
    set((state) => {
      const { progress } = state
      
      if (progress.unlockedCharacters.includes(characterId)) {
        return { progress }
      }
      
      const newProgress = {
        ...progress,
        unlockedCharacters: [...progress.unlockedCharacters, characterId]
      }
      
      localStorage.setItem('destiny-corridor-progress', JSON.stringify(newProgress))
      return { progress: newProgress }
    })
  },
  
  unlockRelic: (relicId: string) => {
    set((state) => {
      const { progress } = state
      
      // 查找遗物
      const relic = initialRelics.find(r => r.id === relicId)
      if (!relic) return { progress }
      
      // 检查是否已解锁
      if (progress.unlockedRelics.some(r => r.id === relicId)) {
        return { progress }
      }
      
      const unlockedRelic: Relic = {
        ...relic,
        isUnlocked: true
      }
      
      const newProgress = {
        ...progress,
        unlockedRelics: [...progress.unlockedRelics, unlockedRelic]
      }
      
      localStorage.setItem('destiny-corridor-progress', JSON.stringify(newProgress))
      return { progress: newProgress }
    })
  },
  
  updateAchievementProgress: (achievementId: string, progress: number) => {
    set((state) => {
      const { progress: userProgress } = state
      
      const achievementIndex = userProgress.achievements.findIndex(a => a.id === achievementId)
      if (achievementIndex === -1) return { progress: userProgress }
      
      const achievement = userProgress.achievements[achievementIndex]
      
      // 确保achievement.total存在，如果不存在则默认为achievement.requiredProgress
      const totalProgress = achievement.total || achievement.requiredProgress
      
      // 更新成就进度
      const updatedAchievement: Achievement = {
        ...achievement,
        progress: Math.min(totalProgress, progress),
        isUnlocked: progress >= totalProgress
      }
      
      const newAchievements = [...userProgress.achievements]
      newAchievements[achievementIndex] = updatedAchievement
      
      // 如果成就完成并有奖励遗物，解锁它
      if (updatedAchievement.isUnlocked && !achievement.isUnlocked && updatedAchievement.reward) {
        const newRelics = [...userProgress.unlockedRelics]
        if (!newRelics.some(r => r.id === updatedAchievement.reward?.id)) {
          // 创建一个完整的Relic对象
          const newRelic: Relic = {
            id: updatedAchievement.reward.id || `reward_${achievementId}`,
            name: `成就奖励: ${achievement.name}`,
            description: updatedAchievement.reward.type === 'relic' ? 
              `从成就"${achievement.name}"获得的奖励` : 
              `${updatedAchievement.reward.type}奖励，价值${updatedAchievement.reward.value}`,
            rarity: 'common',
            effects: [{
              type: updatedAchievement.reward.type,
              value: updatedAchievement.reward.value
            }],
            isUnlocked: true
          }
          newRelics.push(newRelic)
        }
        
        const newProgress = {
          ...userProgress,
          achievements: newAchievements,
          unlockedRelics: newRelics
        }
        
        localStorage.setItem('destiny-corridor-progress', JSON.stringify(newProgress))
        return { progress: newProgress }
      }
      
      const newProgress = {
        ...userProgress,
        achievements: newAchievements
      }
      
      localStorage.setItem('destiny-corridor-progress', JSON.stringify(newProgress))
      return { progress: newProgress }
    })
  },
  
  recordRunResult: (victory: boolean, floor: number) => {
    set((state) => {
      const { progress } = state
      
      const newProgress = {
        ...progress,
        totalRuns: progress.totalRuns + 1,
        highestFloor: Math.max(progress.highestFloor, floor),
        totalVictories: victory ? progress.totalVictories + 1 : progress.totalVictories,
        totalDeaths: !victory ? progress.totalDeaths + 1 : progress.totalDeaths
      }
      
      localStorage.setItem('destiny-corridor-progress', JSON.stringify(newProgress))
      return { progress: newProgress }
    })
  },
  
  updateProgress: (progressUpdate: Partial<UserProgress>) => {
    set((state) => {
      const { progress } = state
      
      const newProgress = {
        ...progress,
        ...progressUpdate
      }
      
      localStorage.setItem('destiny-corridor-progress', JSON.stringify(newProgress))
      return { progress: newProgress }
    })
  }
}))
