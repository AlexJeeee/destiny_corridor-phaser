import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { AssetLoader } from '../utils/AssetLoader';

export class LoadingScene extends BaseScene {
  private assetLoader: AssetLoader | null = null;
  private loadingText: Phaser.GameObjects.Text | null = null;
  private progressBar: Phaser.GameObjects.Graphics | null = null;
  private progressBox: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super('LoadingScene');
  }

  preload(): void {
    // 创建加载进度条
    this.createLoadingUI();

    // 创建资源加载器
    this.assetLoader = new AssetLoader(this);

    // 监听加载进度
    this.load.on('progress', (value: number) => {
      if (this.progressBar) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0xffffff, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 2 - 160,
          this.cameras.main.height / 2 - 10,
          320 * value,
          20
        );
      }

      if (this.loadingText) {
        this.loadingText.setText(`加载中... ${Math.floor(value * 100)}%`);
      }
    });

    // 监听加载完成
    this.load.on('complete', () => {
      if (this.progressBar) this.progressBar.destroy();
      if (this.progressBox) this.progressBox.destroy();
      if (this.loadingText) this.loadingText.destroy();

      // 延迟一小段时间后跳转到主菜单场景
      this.time.delayedCall(500, () => {
        this.transitionTo('MainMenuScene');
      });
    });

    // 加载所有资源
    this.assetLoader.loadAll();
  }

  private createLoadingUI(): void {
    // 创建进度条背景
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(
      this.cameras.main.width / 2 - 170,
      this.cameras.main.height / 2 - 20,
      340,
      40
    );

    // 创建进度条
    this.progressBar = this.add.graphics();

    // 创建加载文本
    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      '加载中... 0%',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // 创建标题
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      '命运走廊',
      {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // 创建提示文本
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      '首次加载可能需要一些时间，请耐心等待...',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cccccc'
      }
    ).setOrigin(0.5);
  }
}
