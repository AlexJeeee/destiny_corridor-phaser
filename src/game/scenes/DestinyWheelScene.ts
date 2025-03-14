import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Card } from '../../types';
import { rareCards } from '../../data/cards';

interface Reward {
  type: 'card' | 'gold' | 'energy' | 'health';
  value: any;
  name: string;
  color: number;
}

export class DestinyWheelScene extends BaseScene {
  private wheel: Phaser.GameObjects.Container | null = null;
  private marker: Phaser.GameObjects.Image | null = null;
  private rewards: Reward[] = [];
  private isSpinning: boolean = false;
  private spinButton: Phaser.GameObjects.Container | null = null;
  private resultPanel: Phaser.GameObjects.Container | null = null;
  private destinyCoins: number = 3; // 初始命运硬币数量
  
  constructor() {
    super('DestinyWheelScene');
  }
  
  preload(): void {
    // 加载资源
    this.load.image('wheel-bg', 'assets/images/wheel-bg.png');
    this.load.image('wheel', 'assets/images/destiny-wheel.png');
    this.load.image('wheel-marker', 'assets/images/wheel-marker.png');
    this.load.image('wheel-center', 'assets/images/wheel-center.png');
    this.load.image('destiny-coin', 'assets/images/destiny-coin.png');
    this.load.image('reward-panel', 'assets/images/reward-panel.png');
    this.load.audio('wheel-spin', 'assets/audio/wheel-spin.mp3');
    this.load.audio('wheel-stop', 'assets/audio/wheel-stop.mp3');
  }
  
  create(): void {
    super.create();
    
    // 添加背景
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'wheel-bg');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    
    // 如果没有加载到背景图片，则使用纯色背景
    if (!this.textures.exists('wheel-bg')) {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e)
        .setOrigin(0)
        .setScrollFactor(0);
    }
    
    // 添加标题
    this.add.text(this.cameras.main.width / 2, 50, '命运之轮', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // 添加返回按钮
    this.createButton(100, 50, '返回', () => {
      this.transitionTo('MainMenuScene');
    });
    
    // 添加命运硬币显示
    this.createCoinDisplay();
    
    // 创建命运之轮
    this.createDestinyWheel();
    
    // 创建旋转按钮
    this.createSpinButton();
    
    // 添加说明文本
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 
      '旋转命运之轮需要消耗1枚命运硬币。命运之轮将决定你的奖励！', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);
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
  
  private createCoinDisplay(): void {
    const container = this.add.container(this.cameras.main.width - 150, 50);
    
    // 添加硬币图标
    const coinIcon = this.add.image(0, 0, 'destiny-coin')
      .setDisplaySize(30, 30);
    container.add(coinIcon);
    
    // 如果没有加载到硬币图片，则使用圆形替代
    if (!this.textures.exists('destiny-coin')) {
      const coinCircle = this.add.circle(0, 0, 15, 0xffd700);
      container.add(coinCircle);
    }
    
    // 添加硬币数量文本
    const coinText = this.add.text(40, 0, `x ${this.destinyCoins}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5)
      .setName('coinText');
    container.add(coinText);
  }
  
  private updateCoinDisplay(): void {
    const coinText = this.children.getByName('coinText') as Phaser.GameObjects.Text;
    if (coinText) {
      coinText.setText(`x ${this.destinyCoins}`);
    }
  }
  
  private createDestinyWheel(): void {
    // 设置奖励
    this.setupRewards();
    
    // 创建轮盘容器
    this.wheel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 轮盘半径
    const radius = 150;
    
    // 创建轮盘背景
    const wheelBg = this.add.circle(0, 0, radius, 0x333333);
    this.wheel.add(wheelBg);
    
    // 如果有轮盘图片，则使用图片
    if (this.textures.exists('wheel')) {
      const wheelImage = this.add.image(0, 0, 'wheel')
        .setDisplaySize(radius * 2, radius * 2);
      this.wheel.add(wheelImage);
    } else {
      // 否则创建分段轮盘
      const segmentAngle = (Math.PI * 2) / this.rewards.length;
      
      for (let i = 0; i < this.rewards.length; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = (i + 1) * segmentAngle;
        
        // 创建扇形
        const segment = this.add.graphics();
        segment.fillStyle(this.rewards[i].color, 1);
        segment.beginPath();
        segment.moveTo(0, 0);
        segment.arc(0, 0, radius, startAngle, endAngle, false);
        segment.closePath();
        segment.fillPath();
        
        this.wheel.add(segment);
        
        // 添加奖励名称
        const midAngle = (startAngle + endAngle) / 2;
        const textRadius = radius * 0.7;
        const x = textRadius * Math.cos(midAngle);
        const y = textRadius * Math.sin(midAngle);
        
        const rewardText = this.add.text(x, y, this.rewards[i].name, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffffff',
        }).setOrigin(0.5)
          .setRotation(midAngle + Math.PI / 2);
        
        this.wheel.add(rewardText);
      }
    }
    
    // 添加轮盘中心
    const wheelCenter = this.add.image(0, 0, 'wheel-center')
      .setDisplaySize(50, 50);
    this.wheel.add(wheelCenter);
    
    // 如果没有加载到中心图片，则使用圆形替代
    if (!this.textures.exists('wheel-center')) {
      const centerCircle = this.add.circle(0, 0, 25, 0xffffff);
      this.wheel.add(centerCircle);
    }
    
    // 添加指针
    this.marker = this.add.image(0, -radius - 20, 'wheel-marker')
      .setDisplaySize(30, 50)
      .setOrigin(0.5, 1);
    
    // 如果没有加载到指针图片，则使用三角形替代
    if (!this.textures.exists('wheel-marker')) {
      const markerTriangle = this.add.triangle(0, -radius - 10, 0, -20, -10, 0, 10, 0, 0xff0000);
      markerTriangle.setOrigin(0.5, 1);
      this.marker = markerTriangle as unknown as Phaser.GameObjects.Image;
    }
  }
  
  private setupRewards(): void {
    // 创建奖励列表
    this.rewards = [
      { type: 'card', value: this.getRandomRareCard(), name: '稀有卡牌', color: 0xff9900 },
      { type: 'gold', value: 100, name: '100金币', color: 0xffcc00 },
      { type: 'energy', value: 1, name: '+1能量上限', color: 0x00ccff },
      { type: 'gold', value: 50, name: '50金币', color: 0xffcc00 },
      { type: 'health', value: 10, name: '+10生命上限', color: 0xff3366 },
      { type: 'gold', value: 200, name: '200金币', color: 0xffcc00 },
      { type: 'card', value: this.getRandomRareCard(), name: '稀有卡牌', color: 0xff9900 },
      { type: 'gold', value: 25, name: '25金币', color: 0xffcc00 }
    ];
  }
  
  private getRandomRareCard(): Card {
    const randomIndex = Math.floor(Math.random() * rareCards.length);
    return rareCards[randomIndex];
  }
  
  private createSpinButton(): void {
    // 创建按钮容器
    this.spinButton = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 150);
    
    // 创建按钮背景
    const buttonBg = this.add.rectangle(0, 0, 160, 50, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', () => this.spinWheel())
      .on('pointerover', () => {
        if (!this.isSpinning && this.destinyCoins > 0) {
          buttonBg.setFillStyle(0x5a4ba6);
        }
      })
      .on('pointerout', () => {
        if (!this.isSpinning) {
          buttonBg.setFillStyle(0x4a3b96);
        }
      });
    
    // 禁用状态
    if (this.destinyCoins <= 0) {
      buttonBg.setFillStyle(0x666666);
      buttonBg.disableInteractive();
    }
    
    this.spinButton.add(buttonBg);
    
    // 添加按钮文本
    const buttonText = this.add.text(0, 0, '旋转命运之轮', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.spinButton.add(buttonText);
    
    // 添加硬币图标
    const coinIcon = this.add.image(-70, 0, 'destiny-coin')
      .setDisplaySize(20, 20);
    this.spinButton.add(coinIcon);
    
    // 如果没有加载到硬币图片，则使用圆形替代
    if (!this.textures.exists('destiny-coin')) {
      const coinCircle = this.add.circle(-70, 0, 10, 0xffd700);
      this.spinButton.add(coinCircle);
    }
    
    // 添加硬币数量文本
    const costText = this.add.text(-55, 0, 'x1', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.spinButton.add(costText);
  }
  
  private spinWheel(): void {
    // 检查是否有足够的命运硬币
    if (this.destinyCoins <= 0) {
      this.showMessage('命运硬币不足！');
      return;
    }
    
    // 检查是否正在旋转
    if (this.isSpinning) {
      return;
    }
    
    // 消耗命运硬币
    this.destinyCoins--;
    this.updateCoinDisplay();
    
    // 更新按钮状态
    if (this.spinButton) {
      const buttonBg = this.spinButton.getAt(0) as Phaser.GameObjects.Rectangle;
      if (this.destinyCoins <= 0) {
        buttonBg.setFillStyle(0x666666);
        buttonBg.disableInteractive();
      }
    }
    
    // 设置旋转状态
    this.isSpinning = true;
    
    // 播放旋转音效
    if (this.sound.get('wheel-spin')) {
      this.sound.play('wheel-spin');
    }
    
    // 随机选择一个奖励
    const randomIndex = Math.floor(Math.random() * this.rewards.length);
    const segmentAngle = (Math.PI * 2) / this.rewards.length;
    const targetAngle = randomIndex * segmentAngle;
    
    // 计算旋转角度（多转几圈再停在目标位置）
    const rotations = 2 + Math.random() * 2; // 2-4圈
    const finalAngle = rotations * Math.PI * 2 - targetAngle;
    
    // 创建旋转动画
    if (this.wheel) {
      this.tweens.add({
        targets: this.wheel,
        rotation: finalAngle,
        duration: 3000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          // 播放停止音效
          if (this.sound.get('wheel-stop')) {
            this.sound.play('wheel-stop');
          }
          
          // 显示奖励
          this.showReward(this.rewards[randomIndex]);
          
          // 重置旋转状态
          this.isSpinning = false;
        }
      });
    }
  }
  
  private showReward(reward: Reward): void {
    // 创建奖励面板
    this.resultPanel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 添加背景遮罩
    const bgMask = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    this.resultPanel.add(bgMask);
    
    // 添加面板背景
    const panelBg = this.add.image(0, 0, 'reward-panel')
      .setDisplaySize(400, 300);
    this.resultPanel.add(panelBg);
    
    // 如果没有加载到面板图片，则使用矩形替代
    if (!this.textures.exists('reward-panel')) {
      const panel = this.add.rectangle(0, 0, 400, 300, 0x2a2a4a, 1);
      this.resultPanel.add(panel);
    }
    
    // 添加标题
    const titleText = this.add.text(0, -120, '恭喜获得奖励！', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.resultPanel.add(titleText);
    
    // 添加奖励描述
    let rewardDesc = '';
    let rewardImage: Phaser.GameObjects.Image | null = null;
    
    switch (reward.type) {
      case 'card':
        const card = reward.value as Card;
        rewardDesc = `获得稀有卡牌：${card.name}`;
        if (card.imageUrl) {
          const imageKey = `card-${card.id}`;
          if (this.textures.exists(imageKey)) {
            rewardImage = this.add.image(0, 0, imageKey)
              .setDisplaySize(150, 150);
          }
        }
        break;
      case 'gold':
        rewardDesc = `获得${reward.value}金币`;
        break;
      case 'energy':
        rewardDesc = `能量上限增加${reward.value}点`;
        break;
      case 'health':
        rewardDesc = `生命上限增加${reward.value}点`;
        break;
    }
    
    // 添加奖励图片
    if (rewardImage) {
      rewardImage.setPosition(0, -20);
      this.resultPanel.add(rewardImage);
    } else {
      // 如果没有图片，则显示一个图标
      const rewardIcon = this.add.circle(0, -20, 50, reward.color, 1);
      this.resultPanel.add(rewardIcon);
      
      // 添加图标文本
      const iconText = this.add.text(0, -20, this.getRewardIconText(reward.type), {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.resultPanel.add(iconText);
    }
    
    // 添加奖励描述
    const descText = this.add.text(0, 60, rewardDesc, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.resultPanel.add(descText);
    
    // 添加确认按钮
    const confirmButton = this.add.rectangle(0, 120, 120, 40, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', () => {
        if (this.resultPanel) {
          this.resultPanel.destroy();
          this.resultPanel = null;
        }
      })
      .on('pointerover', () => confirmButton.setFillStyle(0x5a4ba6))
      .on('pointerout', () => confirmButton.setFillStyle(0x4a3b96));
    this.resultPanel.add(confirmButton);
    
    // 添加按钮文本
    const buttonText = this.add.text(0, 120, '确认', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.resultPanel.add(buttonText);
    
    // 设置面板交互区域
    bgMask.setInteractive()
      .on('pointerdown', () => {
        if (this.resultPanel) {
          this.resultPanel.destroy();
          this.resultPanel = null;
        }
      });
  }
  
  private getRewardIconText(type: string): string {
    switch (type) {
      case 'card':
        return '卡';
      case 'gold':
        return '金';
      case 'energy':
        return '能';
      case 'health':
        return '命';
      default:
        return '?';
    }
  }
  
  private showMessage(message: string): void {
    // 创建消息容器
    const messageContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 添加背景
    const messageBg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.8);
    messageContainer.add(messageBg);
    
    // 添加消息文本
    const messageText = this.add.text(0, 0, message, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    messageContainer.add(messageText);
    
    // 自动消失
    this.time.delayedCall(2000, () => {
      messageContainer.destroy();
    });
  }
}
