import Phaser from 'phaser';
import { BaseScene } from './BaseScene';

export class MainMenuScene extends BaseScene {
  private bgMusic: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super('MainMenuScene');
  }

  preload(): void {
    // 加载主菜单资源
    this.load.image('menu-bg', 'assets/images/menu-background.png');
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('button', 'assets/images/button.png');
    
    // 加载背景音乐
    this.load.audio('main-menu-music', 'src/assets/audios/main-menu.mp3');
  }

  create(): void {
    super.create();

    // 播放背景音乐（循环播放）
    this.bgMusic = this.sound.add('main-menu-music', {
      volume: 0.5,
      loop: true
    });
    this.bgMusic.play();

    // 添加背景
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'menu-bg');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // 添加标题
    const logo = this.add.image(this.cameras.main.width / 2, 100, 'logo');
    logo.setScale(0.5);

    // 如果没有加载到logo图片，则使用文本替代
    if (!this.textures.exists('logo')) {
      const title = this.add.text(this.cameras.main.width / 2, 100, '命运回廊', {
        fontFamily: 'Arial',
        fontSize: '64px',
        color: '#ffde00',
      }).setOrigin(0.5);

      // 添加发光效果
      title.setShadow(0, 0, '#ffde00', 8, true, true);
    }

    // 添加副标题
    this.add.text(this.cameras.main.width / 2, 170, '踏上命运之旅，探索无尽回廊', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 创建菜单按钮
    this.createMenuButton(this.cameras.main.width / 2, 250, '开始游戏', () => {
      this.transitionTo('CharacterSelectionScene');
    });

    this.createMenuButton(this.cameras.main.width / 2, 310, '卡牌收藏', () => {
      this.transitionTo('CardCollectionScene');
    });

    this.createMenuButton(this.cameras.main.width / 2, 370, '命运之轮', () => {
      this.transitionTo('DestinyWheelScene');
    });

    this.createMenuButton(this.cameras.main.width / 2, 430, '创意工坊', () => {
      this.transitionTo('CreativeWorkshopScene');
    });

    this.createMenuButton(this.cameras.main.width / 2, 490, '设置', () => {
      this.transitionTo('SettingsScene');
    });

    // 添加版本信息
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 20, '版本 1.0.0 | 命运回廊 © 2025', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);
  }

  transitionTo(scene: string, data?: any): void {
    // 停止背景音乐
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
    
    // 切换场景
    super.transitionTo(scene, data);
  }

  private createMenuButton(x: number, y: number, text: string, callback: () => void): void {
    // 创建按钮背景
    const button = this.add.image(x, y, 'button')
      .setInteractive()
      .setScale(2, 1)
      .on('pointerdown', callback)
      .on('pointerover', () => button.setTint(0xaaaaaa))
      .on('pointerout', () => button.clearTint());

    // 如果没有加载到按钮图片，则使用矩形替代
    if (!this.textures.exists('button')) {
      const buttonBg = this.add.rectangle(x, y, 200, 40, 0x4a3b96, 1)
        .setInteractive()
        .on('pointerdown', callback)
        .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
        .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));
    }

    // 添加按钮文本
    this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
}
