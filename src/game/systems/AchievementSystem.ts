import Phaser from 'phaser';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  secret?: boolean;
  reward?: {
    type: 'gold' | 'card' | 'character' | 'destiny_coin';
    value: number | string;
  };
}

export class AchievementSystem {
  private scene: Phaser.Scene;
  private achievements: Achievement[] = [];
  private listeners: Map<string, Function[]> = new Map();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeAchievements();
  }
  
  private initializeAchievements(): void {
    // 从本地存储加载成就
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      this.achievements = JSON.parse(savedAchievements);
    } else {
      // 初始化默认成就
      this.achievements = [
        {
          id: 'first_battle',
          name: '初次战斗',
          description: '完成你的第一场战斗',
          icon: 'achievement_battle',
          unlocked: false,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'card_collector',
          name: '卡牌收藏家',
          description: '收集10张不同的卡牌',
          icon: 'achievement_cards',
          unlocked: false,
          progress: 0,
          maxProgress: 10,
          reward: {
            type: 'destiny_coin',
            value: 1
          }
        },
        {
          id: 'battle_master',
          name: '战斗大师',
          description: '赢得10场战斗',
          icon: 'achievement_master',
          unlocked: false,
          progress: 0,
          maxProgress: 10,
          reward: {
            type: 'gold',
            value: 500
          }
        },
        {
          id: 'perfect_battle',
          name: '完美战斗',
          description: '在不损失生命值的情况下赢得一场战斗',
          icon: 'achievement_perfect',
          unlocked: false,
          progress: 0,
          maxProgress: 1,
          reward: {
            type: 'card',
            value: 'rare_card_001'
          }
        },
        {
          id: 'character_collector',
          name: '角色收藏家',
          description: '解锁所有角色',
          icon: 'achievement_characters',
          unlocked: false,
          progress: 0,
          maxProgress: 5,
          reward: {
            type: 'character',
            value: 'secret_character'
          }
        },
        {
          id: 'energy_master',
          name: '能量大师',
          description: '在一个回合中使用5点能量',
          icon: 'achievement_energy',
          unlocked: false,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'combo_king',
          name: '连击之王',
          description: '在一个回合中使用3张卡牌',
          icon: 'achievement_combo',
          unlocked: false,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'explorer',
          name: '探索者',
          description: '探索所有地图区域',
          icon: 'achievement_explorer',
          unlocked: false,
          progress: 0,
          maxProgress: 5
        },
        {
          id: 'destiny_wheel',
          name: '命运之轮',
          description: '使用命运之轮10次',
          icon: 'achievement_wheel',
          unlocked: false,
          progress: 0,
          maxProgress: 10,
          reward: {
            type: 'destiny_coin',
            value: 3
          }
        },
        {
          id: 'secret_achievement',
          name: '???',
          description: '这是一个秘密成就',
          icon: 'achievement_secret',
          unlocked: false,
          progress: 0,
          maxProgress: 1,
          secret: true
        }
      ];
    }
  }
  
  public getAchievements(): Achievement[] {
    return this.achievements;
  }
  
  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.unlocked);
  }
  
  public getAchievement(id: string): Achievement | undefined {
    return this.achievements.find(achievement => achievement.id === id);
  }
  
  public updateProgress(id: string, progress: number): void {
    const achievement = this.getAchievement(id);
    if (!achievement) return;
    
    // 如果已经解锁，则不再更新进度
    if (achievement.unlocked) return;
    
    // 更新进度
    achievement.progress = Math.min(achievement.progress + progress, achievement.maxProgress);
    
    // 检查是否达成成就
    if (achievement.progress >= achievement.maxProgress) {
      this.unlockAchievement(id);
    } else {
      // 保存进度
      this.saveAchievements();
      
      // 触发进度更新事件
      this.triggerEvent('progressUpdated', achievement);
    }
  }
  
  public unlockAchievement(id: string): void {
    const achievement = this.getAchievement(id);
    if (!achievement || achievement.unlocked) return;
    
    // 解锁成就
    achievement.unlocked = true;
    achievement.progress = achievement.maxProgress;
    
    // 保存成就
    this.saveAchievements();
    
    // 显示成就解锁通知
    this.showAchievementNotification(achievement);
    
    // 触发成就解锁事件
    this.triggerEvent('achievementUnlocked', achievement);
    
    // 如果有奖励，则发放奖励
    if (achievement.reward) {
      this.grantReward(achievement.reward);
    }
  }
  
  private saveAchievements(): void {
    localStorage.setItem('achievements', JSON.stringify(this.achievements));
  }
  
  private showAchievementNotification(achievement: Achievement): void {
    // 创建成就通知容器
    const notificationContainer = this.scene.add.container(this.scene.cameras.main.width - 20, 20);
    notificationContainer.setDepth(1000); // 确保显示在最上层
    
    // 添加背景
    const background = this.scene.add.rectangle(0, 0, 300, 80, 0x000000, 0.8)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0xffd700);
    notificationContainer.add(background);
    
    // 添加成就图标
    let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    if (this.scene.textures.exists(achievement.icon)) {
      icon = this.scene.add.image(-270, 40, achievement.icon)
        .setDisplaySize(60, 60)
        .setOrigin(0.5);
    } else {
      // 如果图标不存在，使用一个占位符
      icon = this.scene.add.rectangle(-270, 40, 60, 60, 0x4a3b96)
        .setOrigin(0.5);
    }
    notificationContainer.add(icon);
    
    // 添加成就标题
    const title = this.scene.add.text(-230, 20, '成就解锁！', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    notificationContainer.add(title);
    
    // 添加成就名称
    const name = this.scene.add.text(-230, 45, achievement.name, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    notificationContainer.add(name);
    
    // 添加成就描述
    const description = this.scene.add.text(-230, 65, achievement.description, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    notificationContainer.add(description);
    
    // 设置初始位置（在屏幕外）
    notificationContainer.x += 320;
    
    // 创建进入动画
    this.scene.tweens.add({
      targets: notificationContainer,
      x: this.scene.cameras.main.width - 20,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 显示一段时间后消失
        this.scene.time.delayedCall(3000, () => {
          // 创建退出动画
          this.scene.tweens.add({
            targets: notificationContainer,
            x: this.scene.cameras.main.width + 320,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
              notificationContainer.destroy();
            }
          });
        });
      }
    });
  }
  
  private grantReward(reward: Achievement['reward']): void {
    if (!reward) return;
    
    // 根据奖励类型发放不同的奖励
    switch (reward.type) {
      case 'gold':
        // 增加金币
        const currentGold = parseInt(localStorage.getItem('playerGold') || '0');
        localStorage.setItem('playerGold', (currentGold + Number(reward.value)).toString());
        break;
        
      case 'card':
        // 添加卡牌到玩家卡牌集合
        const playerCards = JSON.parse(localStorage.getItem('playerCards') || '[]');
        if (!playerCards.includes(reward.value)) {
          playerCards.push(reward.value);
          localStorage.setItem('playerCards', JSON.stringify(playerCards));
        }
        break;
        
      case 'character':
        // 解锁角色
        const unlockedCharacters = JSON.parse(localStorage.getItem('unlockedCharacters') || '[]');
        if (!unlockedCharacters.includes(reward.value)) {
          unlockedCharacters.push(reward.value);
          localStorage.setItem('unlockedCharacters', JSON.stringify(unlockedCharacters));
        }
        break;
        
      case 'destiny_coin':
        // 增加命运硬币
        const currentCoins = parseInt(localStorage.getItem('destinyCoins') || '0');
        localStorage.setItem('destinyCoins', (currentCoins + Number(reward.value)).toString());
        break;
    }
    
    // 触发奖励发放事件
    this.triggerEvent('rewardGranted', reward);
  }
  
  // 事件系统
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)?.push(callback);
  }
  
  public off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  private triggerEvent(event: string, data: any): void {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  // 检查特定条件，用于自动触发成就
  public checkBattleComplete(won: boolean, perfectVictory: boolean = false): void {
    if (won) {
      this.updateProgress('battle_master', 1);
      
      // 检查是否是第一场战斗
      const firstBattle = this.getAchievement('first_battle');
      if (firstBattle && !firstBattle.unlocked) {
        this.unlockAchievement('first_battle');
      }
      
      // 检查是否是完美战斗
      if (perfectVictory) {
        this.unlockAchievement('perfect_battle');
      }
    }
  }
  
  public checkCardCollection(cardCount: number): void {
    const achievement = this.getAchievement('card_collector');
    if (achievement && !achievement.unlocked) {
      achievement.progress = cardCount;
      
      if (cardCount >= achievement.maxProgress) {
        this.unlockAchievement('card_collector');
      } else {
        // 保存进度
        this.saveAchievements();
        
        // 触发进度更新事件
        this.triggerEvent('progressUpdated', achievement);
      }
    }
  }
  
  public checkCharacterCollection(characterCount: number): void {
    const achievement = this.getAchievement('character_collector');
    if (achievement && !achievement.unlocked) {
      achievement.progress = characterCount;
      
      if (characterCount >= achievement.maxProgress) {
        this.unlockAchievement('character_collector');
      } else {
        // 保存进度
        this.saveAchievements();
        
        // 触发进度更新事件
        this.triggerEvent('progressUpdated', achievement);
      }
    }
  }
  
  public checkEnergyUsage(energyUsed: number): void {
    if (energyUsed >= 5) {
      this.unlockAchievement('energy_master');
    }
  }
  
  public checkCardCombo(cardsUsed: number): void {
    if (cardsUsed >= 3) {
      this.unlockAchievement('combo_king');
    }
  }
  
  public checkExploredAreas(areas: string[]): void {
    const achievement = this.getAchievement('explorer');
    if (achievement && !achievement.unlocked) {
      achievement.progress = areas.length;
      
      if (areas.length >= achievement.maxProgress) {
        this.unlockAchievement('explorer');
      } else {
        // 保存进度
        this.saveAchievements();
        
        // 触发进度更新事件
        this.triggerEvent('progressUpdated', achievement);
      }
    }
  }
  
  public checkDestinyWheelUsage(): void {
    this.updateProgress('destiny_wheel', 1);
  }
  
  // 解锁秘密成就
  public unlockSecretAchievement(): void {
    this.unlockAchievement('secret_achievement');
  }
}
