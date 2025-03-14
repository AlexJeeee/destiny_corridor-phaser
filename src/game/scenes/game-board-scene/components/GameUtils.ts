import { GridCoord } from '@/types';

export class GameUtils {
  /**
   * 获取意图文本
   */
  static getIntentText(intent: string): string {
    switch (intent) {
      case 'attack':
        return '攻击';
      case 'defend':
        return '防御';
      case 'buff':
        return '增益';
      case 'debuff':
        return '减益';
      case 'heal':
        return '治疗';
      default:
        return '未知';
    }
  }

  /**
   * 计算两个坐标之间的距离
   */
  static getGridDistance(a: GridCoord, b: GridCoord): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * 创建背景
   */
  static createBackground(scene: Phaser.Scene): void {
    scene.add.rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height, 0x1a1a2e)
      .setOrigin(0)
      .setScrollFactor(0);
  }
}
