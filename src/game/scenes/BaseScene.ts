import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  constructor(key: string) {
    super(key);
  }

  create(): void {
    // 添加场景过渡效果
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // 场景过渡方法
  transitionTo(key: string, data?: any): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(key, data);
    });
  }
}
