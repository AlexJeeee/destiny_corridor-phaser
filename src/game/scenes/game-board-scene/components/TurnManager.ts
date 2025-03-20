import Phaser from 'phaser';
import { Character, Enemy, GridCoord, CardEffectType } from '@/types';
import { PlayerManager } from './PlayerManager';
import { EnemyManager } from './EnemyManager';
import { CardManager } from './CardManager';
import { UIManager } from './UIManager';
import { BattleSystem } from '@/game/systems/BattleSystem';
import { getEffectName } from '@/utils';

export class TurnManager {
  private scene: Phaser.Scene;
  private currentTurn: string = 'player'; // 'player' 或 'enemy'
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private cardManager: CardManager;
  private uiManager: UIManager;
  private battleSystem: BattleSystem | null = null;
  private onEnemyTurnEnd: (() => void) | null = null;
  private onPlayerTurnEnd: (() => void) | null = null;
  private onNextFloor: (() => void) | null = null;
  private turnCount: number = 1;

  constructor(
    scene: Phaser.Scene, 
    playerManager: PlayerManager, 
    enemyManager: EnemyManager,
    cardManager: CardManager,
    uiManager: UIManager
  ) {
    this.scene = scene;
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.cardManager = cardManager;
    this.uiManager = uiManager;
  }

  setOnEnemyTurnEnd(callback: () => void): void {
    this.onEnemyTurnEnd = callback;
  }

  setOnPlayerTurnEnd(callback: () => void): void {
    this.onPlayerTurnEnd = callback;
  }

  setOnNextFloor(callback: () => void): void {
    this.onNextFloor = callback;
  }

  setBattleSystem(battleSystem: BattleSystem): void {
    this.battleSystem = battleSystem;
  }

  startPlayerTurn(): void {
    // 设置当前回合为玩家回合
    this.currentTurn = 'player';
    
    // 更新回合文本
    this.uiManager.updateTurnText(true);
    
    // 获取玩家
    const player = this.playerManager.getPlayer();
    if (!player) return;
    
    // 恢复玩家能量
    player.energy = player.maxEnergy;
    
    // 处理玩家状态效果
    this.processStatusEffects(player);
    
    // 更新UI
    this.uiManager.updateInfoPanel(player);
    
    // 抽取卡牌
    if (this.turnCount > 1) {
      this.cardManager.drawCards(player, 1);
    }
    
    // 减少技能冷却时间
    player.abilities.forEach(ability => {
      if (ability.currentCooldown > 0) {
        ability.currentCooldown--;
      }
    });
    
    console.log(`玩家回合 ${this.turnCount} 开始`);
  }

  endPlayerTurn(): void {
    // 清除卡牌选中状态
    this.cardManager.clearCardSelection();
    
    // 设置当前回合为敌人回合
    this.currentTurn = 'enemy';
    
    // 更新回合文本
    this.uiManager.updateTurnText(false);
    
    // 延迟执行敌人行动
    this.scene.time.delayedCall(1000, this.enemyActions.bind(this), [], this);
    
    // 触发玩家回合结束回调
    if (this.onPlayerTurnEnd) {
      this.onPlayerTurnEnd();
    }
    
    console.log('玩家回合结束');
  }

  enemyActions(): void {
    // 实现敌人AI行动
    console.log('敌人回合开始');
    
    const enemies = this.enemyManager.getEnemies();
    
    // 依次执行每个敌人的行动
    enemies.forEach((enemy, index) => {
      if (enemy.health <= 0) return;
      
      // 处理敌人状态效果
      this.processStatusEffects(enemy);
      
      // 减少技能冷却时间
      enemy.abilities.forEach(ability => {
        if (ability.currentCooldown > 0) {
          ability.currentCooldown--;
        }
      });
      
      // 延迟执行，让敌人依次行动
      this.scene.time.delayedCall(index * 800, () => {
        this.performEnemyAction(enemy);
      }, [], this);
    });
    
    // 延迟结束敌人回合
    this.scene.time.delayedCall(enemies.length * 800 + 500, this.endEnemyTurn.bind(this), [], this);
  }

  performEnemyAction(enemy: Enemy): void {
    const player = this.playerManager.getPlayer();
    if (!player || !enemy.position) return;
    
    const playerPosition = this.playerManager.getPlayerPosition();
    if (!playerPosition) return;
    
    // 计算与玩家的距离
    const distance = this.getGridDistance(enemy.position, playerPosition);
    
    // 获取敌人精灵
    const enemySprite = this.enemyManager.getEnemySprites().get(enemy.id);
    if (!enemySprite) return;
    
    if (distance <= enemy.attackRange) {
      // 如果在攻击范围内，执行攻击
      console.log(`敌人 ${enemy.name} 攻击玩家`);
      
      // 创建攻击动画
      const originalX = enemySprite.x;
      const originalY = enemySprite.y;
      
      // 向玩家方向移动一点再返回，模拟攻击动作
      const playerSprite = this.playerManager.getPlayerSprite();
      if (playerSprite) {
        const directionX = playerSprite.x - originalX;
        const directionY = playerSprite.y - originalY;
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedX = directionX / length;
        const normalizedY = directionY / length;
        
        this.scene.tweens.add({
          targets: enemySprite,
          x: originalX + normalizedX * 20,
          y: originalY + normalizedY * 20,
          duration: 150,
          yoyo: true,
          onComplete: () => {
            // 使用BattleSystem对玩家造成伤害
            if (this.battleSystem) {
              this.battleSystem.damagePlayer(enemy.damage);
            }
            
            // 更新UI
            this.uiManager.updateInfoPanel(player);
            
            // 检查玩家是否死亡
            if (this.playerManager.isPlayerDead()) {
              // 游戏结束
              this.gameOver();
            }
          }
        });
      }
    } else {
      // 如果不在攻击范围内，向玩家移动
      console.log(`敌人 ${enemy.name} 向玩家移动`);
      
      // 获取所有敌人的位置，用于判断格子是否被占用
      const enemyPositions = this.enemyManager.getEnemyPositions();
      
      // 获取向玩家方向移动的有效位置
      const movePositions = this.enemyManager.getEnemyMovePositions(
        enemy, 
        playerPosition,
        [...enemyPositions, playerPosition]
      );
      
      if (movePositions.length > 0) {
        // 选择第一个位置（最接近玩家的位置）
        const targetPos = movePositions[0];
        
        // 使用 EnemyManager 的 moveEnemy 方法移动敌人
        this.enemyManager.moveEnemy(enemy, targetPos);
      }
    }
  }

  endEnemyTurn(): void {
    // 增加回合计数
    this.turnCount++;
    
    // 开始新的玩家回合
    this.startPlayerTurn();
    
    // 触发敌人回合结束回调
    if (this.onEnemyTurnEnd) {
      this.onEnemyTurnEnd();
    }
  }

  gameOver(): void {
    // 创建游戏结束界面
    this.uiManager.createGameOverScreen(() => {
      this.scene.scene.start('MainMenuScene');
    });
  }

  checkEnemiesDefeated(): boolean {
    return this.enemyManager.areAllEnemiesDead();
  }

  goToNextFloor(): void {
    if (this.onNextFloor) {
      this.onNextFloor();
    }
  }

  getCurrentTurn(): string {
    return this.currentTurn;
  }

  getTurnCount(): number {
    return this.turnCount;
  }

  private getGridDistance(a: GridCoord, b: GridCoord): number {
    // 计算两个坐标之间的距离
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  // 处理状态效果
  private processStatusEffects(entity: Character | Enemy): void {
    if (!entity.effects) return;
    
    const effects = [...entity.effects];
    
    for (const effect of effects) {
      // 减少效果持续时间
      if (effect.duration !== undefined && effect.duration > 0) {
        effect.duration--;
      }
      
      // 应用效果
      if (effect.type === 'poison' && effect.value) {
        // 毒素效果：造成伤害
        if (entity.health) {
          entity.health = Math.max(0, entity.health - effect.value);
          console.log(`${entity.name} 受到毒素效果，失去 ${effect.value} 点生命值，剩余 ${entity.health}`);
        }
      }
      
      // 移除已过期的效果
      if (effect.duration !== undefined && effect.duration <= 0) {
        const index = entity.effects.indexOf(effect);
        if (index !== -1) {
          entity.effects.splice(index, 1);
          console.log(`${entity.name} 的 ${getEffectName(effect.type)} 效果已过期`);
        }
      }
    }
  }
}
