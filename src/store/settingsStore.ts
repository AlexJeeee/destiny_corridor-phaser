import { create } from 'zustand'
import { UserSettings } from '../types'

interface SettingsState {
  settings: UserSettings
  volume: number
  toggleMusic: (enabled: boolean) => void
  toggleSoundEffects: (enabled: boolean) => void
  loadSettings: () => void
  updateSettings: (newSettings: Partial<UserSettings>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    language: 'zh-CN',
    showTutorials: true,
    enableParticles: true,
    enableScreenShake: true
  },
  
  volume: 0.7, // 默认音量
  
  toggleMusic: (enabled: boolean) => {
    set((state) => ({
      settings: {
        ...state.settings,
        musicVolume: enabled ? state.volume : 0
      }
    }))
  },
  
  toggleSoundEffects: (enabled: boolean) => {
    set((state) => ({
      settings: {
        ...state.settings,
        sfxVolume: enabled ? state.volume : 0
      }
    }))
  },
  
  loadSettings: () => {
    const savedSettings = localStorage.getItem('destiny-corridor-settings')
    if (savedSettings) {
      set({ settings: JSON.parse(savedSettings) })
    }
  },
  
  updateSettings: (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings }
      localStorage.setItem('destiny-corridor-settings', JSON.stringify(updatedSettings))
      return { settings: updatedSettings }
    })
  }
}))
