import Phaser from 'phaser';
import { Enemy, GridCoord } from '@/types';
import { getEnemiesByFloor } from '@/data/enemies';
import { BattlefieldManager } from './BattlefieldManager';

export class EnemyManager {
  private scene: Phaser.Scene;
  private enemies: Enemy[] = [];
  private enemySprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private battlefieldManager: BattlefieldManager;

  constructor(scene: Phaser.Scene, battlefieldManager: BattlefieldManager) {
    this.scene = scene;
    this.battlefieldManager = battlefieldManager;
  }

  createEnemies(currentFloor: number): void {
    // 获取当前楼层的敌人
    this.enemies = getEnemiesByFloor(currentFloor);
    
    // 为敌人分配固定位置
    this.enemies.forEach((enemy, index) => {
      let position: GridCoord;
      
      if (index === 0) {
        position = { x: 3, y: 1 };
      } else if (index === 1) {
        position = { x: 2, y: 3 };
      } else {
        position = { x: 4, y: 2 };
      }
      
      enemy.position = position;
      
      // 找到对应的正方形格子
      const gridCell = this.battlefieldManager.findGridCellByCoord(position);
      if (gridCell) {
        // 创建敌人精灵
        let enemySprite: Phaser.GameObjects.Container;
        if (this.scene.textures.exists('enemy')) {
          const enemyImage = this.scene.add.sprite(0, 0, 'enemy');
          enemySprite = this.scene.add.container(gridCell.pixelX, gridCell.pixelY);
          enemySprite.add(enemyImage);
        } else {
          // 如果没有加载到敌人图像，则使用容器包含圆形和文本
          enemySprite = this.scene.add.container(gridCell.pixelX, gridCell.pixelY);
          
          // 创建圆形
          const circle = this.scene.add.circle(0, 0, this.battlefieldManager.getTileSize() / 2, 0xe53e3e);
          
          // 添加敌人名称
          const nameText = this.scene.add.text(0, -this.battlefieldManager.getTileSize() / 3, enemy.name, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
          }).setOrigin(0.5);
          
          // 添加敌人生命值
          const healthText = this.scene.add.text(0, -this.battlefieldManager.getTileSize() / 6, `HP: ${enemy.health}/${enemy.maxHealth}`, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff',
          }).setOrigin(0.5);
          
          // 添加敌人意图
          const intentText = this.scene.add.text(0, this.battlefieldManager.getTileSize() / 8, `意图: ${this.getIntentText(enemy.intent)}`, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffff00',
          }).setOrigin(0.5);
          
          // 添加敌人伤害
          const damageText = this.scene.add.text(0, this.battlefieldManager.getTileSize() / 3, `伤害: ${enemy.damage}`, {
            fontFamily: 'Arial',
            fontSize: '9px',
            color: '#fff666',
          }).setOrigin(0.5);
          
          // 将圆形和文本添加到容器
          enemySprite.add([circle, nameText, healthText, intentText, damageText]);
        }
        
        // 保存敌人精灵引用
        this.enemySprites.set(enemy.id, enemySprite);
      }
    });
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  getEnemySprites(): Map<string, Phaser.GameObjects.Container> {
    return this.enemySprites;
  }

  updateEnemyInfo(enemy: Enemy): void {
    const enemySprite = this.enemySprites.get(enemy.id);
    if (!enemySprite || enemySprite.type !== 'Container') return;
    
    // 更新生命值文本
    const healthText = enemySprite.getAt(2) as Phaser.GameObjects.Text;
    if (healthText) {
      healthText.setText(`HP: ${enemy.health}/${enemy.maxHealth}`);
    }
    
    // 更新意图文本
    const intentText = enemySprite.getAt(3) as Phaser.GameObjects.Text;
    if (intentText) {
      intentText.setText(`意图: ${this.getIntentText(enemy.intent)}`);
    }
    
    // 更新伤害文本
    const damageText = enemySprite.getAt(4) as Phaser.GameObjects.Text;
    if (damageText) {
      damageText.setText(`伤害: ${enemy.damage}`);
    }
  }

  getEnemyMovePositions(enemy: Enemy, playerPos: GridCoord, occupiedPositions: GridCoord[]): GridCoord[] {
    // 获取敌人可移动的位置，优先选择接近玩家的位置
    const possibleMoves = this.battlefieldManager.getValidMoves(enemy.position, enemy.moveRange, occupiedPositions);
    
    // 按照到玩家的距离排序
    return possibleMoves.sort((a, b) => {
      const distA = this.battlefieldManager.getGridDistance(a, playerPos);
      const distB = this.battlefieldManager.getGridDistance(b, playerPos);
      return distA - distB;
    });
  }

  attackEnemy(enemy: Enemy, damage: number): void {
    // 获取敌人精灵
    const enemySprite = this.enemySprites.get(enemy.id);
    if (!enemySprite) return;
    
    // 创建攻击效果
    const attackEffect = this.scene.add.circle(enemySprite.x, enemySprite.y, 30, 0xff0000, 0.7);
    this.scene.tweens.add({
      targets: attackEffect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => attackEffect.destroy()
    });
    
    // 更新敌人信息显示
    this.updateEnemyInfo(enemy);
    
    // 显示伤害数字
    const damageText = this.scene.add.text(enemySprite.x, enemySprite.y - 20, `-${damage}`, {
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

  removeEnemy(enemy: Enemy, callback?: () => void): void {
    // 获取敌人精灵
    const enemySprite = this.enemySprites.get(enemy.id);
    if (!enemySprite) return;
    
    // 创建死亡动画
    this.scene.tweens.add({
      targets: enemySprite,
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => {
        // 从列表中移除敌人
        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
        this.enemySprites.delete(enemy.id);
        
        // 销毁精灵
        enemySprite.destroy();
        
        // 执行回调
        if (callback) callback();
      }
    });
  }

  clearEnemies(): void {
    // 清除敌人精灵
    this.enemySprites.forEach(sprite => sprite.destroy());
    this.enemySprites.clear();
    this.enemies = [];
  }

  getIntentText(intent: string): string {
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

  moveEnemy(enemy: Enemy, targetCoord: GridCoord): void {
    if (!enemy) return;
    
    console.log(`移动敌人 ${enemy.name} 到: ${targetCoord.x},${targetCoord.y}`);
    
    // 更新敌人位置
    enemy.position = targetCoord;
    
    // 找到目标格子
    const gridCell = this.battlefieldManager.findGridCellByCoord(targetCoord);
    if (gridCell && this.enemySprites.has(enemy.id)) {
      const enemySprite = this.enemySprites.get(enemy.id);
      if (enemySprite) {
        // 创建移动动画
        this.scene.tweens.add({
          targets: enemySprite,
          x: gridCell.pixelX,
          y: gridCell.pixelY,
          duration: 500,
          ease: 'Power2'
        });
      }
    }
  }

  getEnemyPositions(): GridCoord[] {
    return this.enemies
      .filter(enemy => enemy.position)
      .map(enemy => enemy.position as GridCoord);
  }

  findEnemyByPosition(coord: GridCoord): Enemy | undefined {
    return this.enemies.find(enemy => 
      enemy.position && 
      enemy.position.x === coord.x && 
      enemy.position.y === coord.y
    );
  }

  areAllEnemiesDead(): boolean {
    return this.enemies.length === 0;
  }
}
