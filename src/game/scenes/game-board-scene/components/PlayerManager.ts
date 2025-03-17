import Phaser from 'phaser';
import { Character, GridCoord } from '@/types';
import { BattlefieldManager } from './BattlefieldManager';

export class PlayerManager {
  private scene: Phaser.Scene;
  private battlefieldManager: BattlefieldManager;
  private player: Character | null = null;
  private playerSprite: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene, battlefieldManager: BattlefieldManager) {
    this.scene = scene;
    this.battlefieldManager = battlefieldManager;
  }

  setPlayer(player: Character | null): void {
    this.player = player;
  }

  createPlayer(): void {
    if (!this.player) return;
    
    // 设置玩家初始位置
    const startPosition = { x: 0, y: 0 };
    this.player.position = startPosition;
    
    // 找到对应的格子
    const gridCell = this.battlefieldManager.findGridCellByCoord(startPosition);
    if (gridCell) {
      // 创建玩家精灵
      if (this.scene.textures.exists('player')) {
        const playerSprite = this.scene.add.sprite(0, 0, 'player');
        const playerContainer = this.scene.add.container(gridCell.pixelX, gridCell.pixelY);
        playerContainer.add(playerSprite);
        this.playerSprite = playerContainer;
      } else {
        // 如果没有加载到玩家图像，则使用容器包含圆形和文本
        const playerContainer = this.scene.add.container(gridCell.pixelX, gridCell.pixelY);
        
        // 创建圆形
        const circle = this.scene.add.circle(0, 0, this.battlefieldManager.getTileSize() / 2, 0x4a9ae1);
        
        // 添加玩家名称首字母
        const nameText = this.scene.add.text(0, 0, this.player.name.charAt(0), {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ffffff',
        }).setOrigin(0.5);
        
        // 将圆形和文本添加到容器
        playerContainer.add([circle, nameText]);
        
        // 保存玩家容器引用
        this.playerSprite = playerContainer;
      }
    }
  }

  movePlayer(coord: GridCoord): void {
    if (!this.player || !this.playerSprite) return;
    
    console.log(`移动玩家到: ${coord.x},${coord.y}`);
    
    // 更新玩家位置
    this.player.position = coord;
    
    // 找到目标格子
    const gridCell = this.battlefieldManager.findGridCellByCoord(coord);
    if (gridCell) {
      // 创建移动动画
      this.scene.tweens.add({
        targets: this.playerSprite,
        x: gridCell.pixelX,
        y: gridCell.pixelY,
        duration: 500,
        ease: 'Power2'
      });
    }
  }

  damagePlayer(damage: number): void {
    if (!this.player) return;
    
    // 显示伤害数字
    if (this.playerSprite) {
      const damageText = this.scene.add.text(this.playerSprite.x, this.playerSprite.y - 20, `-${damage}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ff0000'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: damageText,
        y: damageText.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      });
    }
  }

  isPlayerDead(): boolean {
    return this.player ? this.player.health <= 0 : false;
  }

  clearPlayer(): void {
    // 清除玩家精灵
    if (this.playerSprite) {
      this.playerSprite.destroy();
      this.playerSprite = null;
    }
  }

  getPlayer(): Character | null {
    return this.player;
  }

  getPlayerSprite(): Phaser.GameObjects.Container | null {
    return this.playerSprite;
  }

  getPlayerPosition(): GridCoord | null {
    return this.player ? this.player.position : null;
  }
}
