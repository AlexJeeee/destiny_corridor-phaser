import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Achievement, AchievementSystem } from '../systems/AchievementSystem';

export class AchievementsScene extends BaseScene {
  private achievementSystem: AchievementSystem | null = null;
  private achievementContainers: Phaser.GameObjects.Container[] = [];
  private currentPage: number = 0;
  private itemsPerPage: number = 5;
  private totalPages: number = 0;
  private pageText: Phaser.GameObjects.Text | null = null;
  
  constructor() {
    super('AchievementsScene');
  }
  
  preload(): void {
    // 加载资源
    this.load.image('achievement-bg', 'assets/images/achievement-bg.png');
    this.load.image('achievement-frame', 'assets/images/achievement-frame.png');
    this.load.image('achievement-locked', 'assets/images/achievement-locked.png');
    
    // 加载成就图标
    this.load.image('achievement_battle', 'assets/images/achievements/battle.png');
    this.load.image('achievement_cards', 'assets/images/achievements/cards.png');
    this.load.image('achievement_master', 'assets/images/achievements/master.png');
    this.load.image('achievement_perfect', 'assets/images/achievements/perfect.png');
    this.load.image('achievement_characters', 'assets/images/achievements/characters.png');
    this.load.image('achievement_energy', 'assets/images/achievements/energy.png');
    this.load.image('achievement_combo', 'assets/images/achievements/combo.png');
    this.load.image('achievement_explorer', 'assets/images/achievements/explorer.png');
    this.load.image('achievement_wheel', 'assets/images/achievements/wheel.png');
    this.load.image('achievement_secret', 'assets/images/achievements/secret.png');
  }
  
  create(): void {
    super.create();
    
    // 初始化成就系统
    this.achievementSystem = new AchievementSystem(this);
    
    // 添加背景
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'achievement-bg');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    
    // 如果没有加载到背景图片，则使用纯色背景
    if (!this.textures.exists('achievement-bg')) {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e)
        .setOrigin(0)
        .setScrollFactor(0);
    }
    
    // 添加标题
    this.add.text(this.cameras.main.width / 2, 50, '成就', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // 添加返回按钮
    this.createButton(100, 50, '返回', () => {
      this.transitionTo('MainMenuScene');
    });
    
    // 添加成就统计
    this.createAchievementStats();
    
    // 创建成就列表
    this.createAchievementList();
    
    // 添加分页控制
    this.createPagination();
  }
  
  private createButton(x: number, y: number, text: string, callback: () => void): void {
    // 创建按钮背景
    const buttonBg = this.add.rectangle(x, y, 120, 40, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', callback)
      .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
      .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));
    
    // 添加按钮文本
    this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
  
  private createAchievementStats(): void {
    if (!this.achievementSystem) return;
    
    const achievements = this.achievementSystem.getAchievements();
    const unlockedAchievements = this.achievementSystem.getUnlockedAchievements();
    
    // 创建统计容器
    const statsContainer = this.add.container(this.cameras.main.width - 200, 50);
    
    // 添加统计背景
    const statsBg = this.add.rectangle(0, 0, 300, 60, 0x000000, 0.5)
      .setStrokeStyle(1, 0xffffff, 0.3);
    statsContainer.add(statsBg);
    
    // 添加统计文本
    const statsText = this.add.text(0, 0, `已解锁: ${unlockedAchievements.length} / ${achievements.length}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    statsContainer.add(statsText);
    
    // 添加进度条
    const progressWidth = 250;
    const progressHeight = 10;
    const progressBg = this.add.rectangle(0, 25, progressWidth, progressHeight, 0x333333);
    statsContainer.add(progressBg);
    
    const progress = unlockedAchievements.length / achievements.length;
    const progressFill = this.add.rectangle(
      -progressWidth / 2 + (progressWidth * progress) / 2,
      25,
      progressWidth * progress,
      progressHeight,
      0x4a3b96
    );
    statsContainer.add(progressFill);
  }
  
  private createAchievementList(): void {
    if (!this.achievementSystem) return;
    
    const achievements = this.achievementSystem.getAchievements();
    
    // 计算总页数
    this.totalPages = Math.ceil(achievements.length / this.itemsPerPage);
    
    // 创建成就列表容器
    const listContainer = this.add.container(this.cameras.main.width / 2, 200);
    
    // 显示当前页的成就
    this.displayAchievementsPage();
  }
  
  private displayAchievementsPage(): void {
    if (!this.achievementSystem) return;
    
    // 清除之前的成就容器
    this.achievementContainers.forEach(container => container.destroy());
    this.achievementContainers = [];
    
    const achievements = this.achievementSystem.getAchievements();
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, achievements.length);
    
    // 更新页码文本
    if (this.pageText) {
      this.pageText.setText(`${this.currentPage + 1} / ${this.totalPages}`);
    }
    
    // 显示当前页的成就
    for (let i = startIndex; i < endIndex; i++) {
      const achievement = achievements[i];
      const yPos = 200 + (i - startIndex) * 100;
      
      this.createAchievementItem(achievement, this.cameras.main.width / 2, yPos);
    }
  }
  
  private createAchievementItem(achievement: Achievement, x: number, y: number): void {
    // 创建成就容器
    const container = this.add.container(x, y);
    this.achievementContainers.push(container);
    
    // 添加成就背景
    const background = this.add.rectangle(0, 0, 700, 80, 0x000000, 0.5)
      .setStrokeStyle(1, achievement.unlocked ? 0xffd700 : 0x666666);
    container.add(background);
    
    // 添加成就图标
    let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    if (this.textures.exists(achievement.icon)) {
      icon = this.add.image(-320, 0, achievement.icon)
        .setDisplaySize(60, 60);
    } else {
      // 如果图标不存在，使用一个占位符
      icon = this.add.rectangle(-320, 0, 60, 60, 0x4a3b96);
    }
    container.add(icon);
    
    // 如果是秘密成就且未解锁，则显示问号
    if (achievement.secret && !achievement.unlocked) {
      const secretOverlay = this.add.rectangle(-320, 0, 60, 60, 0x000000, 0.7);
      container.add(secretOverlay);
      
      const questionMark = this.add.text(-320, 0, '?', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff'
      }).setOrigin(0.5);
      container.add(questionMark);
    }
    
    // 添加成就名称
    const name = this.add.text(-270, -20, achievement.secret && !achievement.unlocked ? '???' : achievement.name, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: achievement.unlocked ? '#ffd700' : '#ffffff'
    }).setOrigin(0, 0.5);
    container.add(name);
    
    // 添加成就描述
    const description = this.add.text(-270, 10, achievement.secret && !achievement.unlocked ? '这是一个秘密成就' : achievement.description, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    container.add(description);
    
    // 添加进度条（如果未解锁）
    if (!achievement.unlocked && achievement.maxProgress > 1) {
      // 进度条背景
      const progressBg = this.add.rectangle(-100, 30, 300, 10, 0x333333);
      container.add(progressBg);
      
      // 进度条填充
      const progress = achievement.progress / achievement.maxProgress;
      const progressFill = this.add.rectangle(
        -250 + (300 * progress) / 2,
        30,
        300 * progress,
        10,
        0x4a3b96
      );
      container.add(progressFill);
      
      // 进度文本
      const progressText = this.add.text(200, 30, `${achievement.progress} / ${achievement.maxProgress}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
      container.add(progressText);
    }
    
    // 添加奖励信息（如果有）
    if (achievement.reward) {
      let rewardText = '奖励: ';
      
      switch (achievement.reward.type) {
        case 'gold':
          rewardText += `${achievement.reward.value} 金币`;
          break;
        case 'card':
          rewardText += '稀有卡牌';
          break;
        case 'character':
          rewardText += '新角色';
          break;
        case 'destiny_coin':
          rewardText += `${achievement.reward.value} 命运硬币`;
          break;
      }
      
      const reward = this.add.text(200, 0, rewardText, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: achievement.unlocked ? '#ffd700' : '#aaaaaa'
      }).setOrigin(0.5);
      container.add(reward);
    }
    
    // 如果已解锁，添加完成标记
    if (achievement.unlocked) {
      const completedText = this.add.text(300, -20, '已完成', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#00ff00'
      }).setOrigin(0.5);
      container.add(completedText);
      
      // 添加完成时间（这里只是示例，实际应该从存储中获取）
      const completedDate = this.add.text(300, 10, '2023-05-15', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      container.add(completedDate);
    }
    
    // 添加交互
    background.setInteractive()
      .on('pointerover', () => {
        background.setFillStyle(0x333333, 0.7);
      })
      .on('pointerout', () => {
        background.setFillStyle(0x000000, 0.5);
      })
      .on('pointerdown', () => {
        this.showAchievementDetails(achievement);
      });
  }
  
  private showAchievementDetails(achievement: Achievement): void {
    // 创建详情面板容器
    const detailsContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 添加背景遮罩
    const bgMask = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    detailsContainer.add(bgMask);
    
    // 添加面板背景
    const panelBg = this.add.rectangle(0, 0, 500, 400, 0x2a2a4a, 1)
      .setStrokeStyle(2, achievement.unlocked ? 0xffd700 : 0x666666);
    detailsContainer.add(panelBg);
    
    // 添加标题
    const titleText = this.add.text(0, -170, achievement.secret && !achievement.unlocked ? '???' : achievement.name, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: achievement.unlocked ? '#ffd700' : '#ffffff'
    }).setOrigin(0.5);
    detailsContainer.add(titleText);
    
    // 添加图标
    let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    if (this.textures.exists(achievement.icon)) {
      icon = this.add.image(0, -100, achievement.icon)
        .setDisplaySize(100, 100);
    } else {
      // 如果图标不存在，使用一个占位符
      icon = this.add.rectangle(0, -100, 100, 100, 0x4a3b96);
    }
    detailsContainer.add(icon);
    
    // 如果是秘密成就且未解锁，则显示问号
    if (achievement.secret && !achievement.unlocked) {
      const secretOverlay = this.add.rectangle(0, -100, 100, 100, 0x000000, 0.7);
      detailsContainer.add(secretOverlay);
      
      const questionMark = this.add.text(0, -100, '?', {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff'
      }).setOrigin(0.5);
      detailsContainer.add(questionMark);
    }
    
    // 添加描述
    const descText = this.add.text(0, -20, achievement.secret && !achievement.unlocked ? '这是一个秘密成就' : achievement.description, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 400 }
    }).setOrigin(0.5);
    detailsContainer.add(descText);
    
    // 添加进度信息
    if (achievement.maxProgress > 1) {
      // 进度条背景
      const progressBg = this.add.rectangle(0, 50, 400, 20, 0x333333);
      detailsContainer.add(progressBg);
      
      // 进度条填充
      const progress = achievement.progress / achievement.maxProgress;
      const progressFill = this.add.rectangle(
        -200 + (400 * progress) / 2,
        50,
        400 * progress,
        20,
        0x4a3b96
      );
      detailsContainer.add(progressFill);
      
      // 进度文本
      const progressText = this.add.text(0, 50, `${achievement.progress} / ${achievement.maxProgress}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
      detailsContainer.add(progressText);
    }
    
    // 添加奖励信息（如果有）
    if (achievement.reward) {
      let rewardText = '奖励: ';
      
      switch (achievement.reward.type) {
        case 'gold':
          rewardText += `${achievement.reward.value} 金币`;
          break;
        case 'card':
          rewardText += '稀有卡牌';
          break;
        case 'character':
          rewardText += '新角色';
          break;
        case 'destiny_coin':
          rewardText += `${achievement.reward.value} 命运硬币`;
          break;
      }
      
      const rewardTitle = this.add.text(0, 100, rewardText, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: achievement.unlocked ? '#ffd700' : '#ffffff'
      }).setOrigin(0.5);
      detailsContainer.add(rewardTitle);
      
      // 如果是卡牌或角色，可以显示更详细的信息
      if (achievement.reward.type === 'card' || achievement.reward.type === 'character') {
        const rewardDetail = this.add.text(0, 130, achievement.reward.value.toString(), {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#aaaaaa'
        }).setOrigin(0.5);
        detailsContainer.add(rewardDetail);
      }
    }
    
    // 添加状态信息
    const statusText = this.add.text(0, 170, achievement.unlocked ? '已完成' : '未完成', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: achievement.unlocked ? '#00ff00' : '#ff6666'
    }).setOrigin(0.5);
    detailsContainer.add(statusText);
    
    // 添加关闭按钮
    const closeButton = this.add.rectangle(0, 170, 120, 40, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', () => {
        detailsContainer.destroy();
      })
      .on('pointerover', () => closeButton.setFillStyle(0x5a4ba6))
      .on('pointerout', () => closeButton.setFillStyle(0x4a3b96));
    detailsContainer.add(closeButton);
    
    // 添加按钮文本
    const buttonText = this.add.text(0, 170, '关闭', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    detailsContainer.add(buttonText);
    
    // 设置面板交互区域
    bgMask.setInteractive()
      .on('pointerdown', () => {
        detailsContainer.destroy();
      });
  }
  
  private createPagination(): void {
    // 创建上一页按钮
    const prevButton = this.add.triangle(this.cameras.main.width / 2 - 100, this.cameras.main.height - 50, 0, 0, 20, 10, 0, 20, 0x4a3b96)
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.displayAchievementsPage();
        }
      })
      .on('pointerover', () => prevButton.setFillStyle(0x5a4ba6))
      .on('pointerout', () => prevButton.setFillStyle(0x4a3b96));
    
    // 创建下一页按钮
    const nextButton = this.add.triangle(this.cameras.main.width / 2 + 100, this.cameras.main.height - 50, 0, 10, 20, 0, 20, 20, 0x4a3b96)
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage < this.totalPages - 1) {
          this.currentPage++;
          this.displayAchievementsPage();
        }
      })
      .on('pointerover', () => nextButton.setFillStyle(0x5a4ba6))
      .on('pointerout', () => nextButton.setFillStyle(0x4a3b96));
    
    // 创建页码文本
    this.pageText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, `${this.currentPage + 1} / ${this.totalPages}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
