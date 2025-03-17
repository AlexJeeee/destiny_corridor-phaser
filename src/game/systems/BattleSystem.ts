import { Character, Enemy, Card, CardType, CardEffect } from '@/types';
import { PlayerManager } from '@/game/scenes/game-board-scene/components/PlayerManager';
import { EnemyManager } from '@/game/scenes/game-board-scene/components/EnemyManager';
import { CardManager } from '@/game/scenes/game-board-scene/components/CardManager';
import { TurnManager } from '@/game/scenes/game-board-scene/components/TurnManager';

export class BattleSystem {
  private scene: Phaser.Scene;
  private player: Character;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private cardManager: CardManager;
  private turnManager: TurnManager;
  private onBattleEnd: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene, 
    player: Character, 
    playerManager: PlayerManager,
    enemyManager: EnemyManager,
    cardManager: CardManager,
    turnManager: TurnManager
  ) {
    this.scene = scene;
    this.player = player;
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.cardManager = cardManager;
    this.turnManager = turnManager;
    
    // 设置TurnManager的BattleSystem引用
    this.turnManager.setBattleSystem(this);
  }

  setOnBattleEnd(callback: () => void): void {
    this.onBattleEnd = callback;
  }

  // 使用卡牌攻击敌人
  useCardOnEnemy(card: Card, enemy: Enemy): boolean {
    console.log(`使用卡牌 ${card.name} 攻击敌人 ${enemy.name}`);
    
    // 检查能量是否足够
    if (this.player.energy < card.cost) {
      console.log('能量不足，无法使用卡牌');
      return false;
    }
    
    // 消耗能量
    this.player.energy -= card.cost;
    
    // 应用卡牌效果
    for (const effect of card.effects) {
      if (effect.type === 'damage' && effect.value) {
        // 伤害效果
        this.damageEnemy(enemy, effect.value);
      } else if (effect.type === 'poison' && effect.value) {
        // 毒素效果
        this.applyPoisonToEnemy(enemy, effect.value, effect.duration || 3);
      } else {
        // 其他效果
        this.applyEffectToEnemy(enemy, effect);
      }
    }
    
    // 检查敌人是否死亡
    if (enemy.health <= 0) {
      this.handleEnemyDeath(enemy);
    }
    
    return true;
  }

  // 对敌人造成伤害
  damageEnemy(enemy: Enemy, damage: number): void {
    // 检查敌人是否有防御效果
    const blockEffect = enemy.effects.find(e => e.type === 'defense' || e.type === 'shield');
    let actualDamage = damage;
    
    if (blockEffect) {
      if (blockEffect.value >= actualDamage) {
        // 防御完全抵消伤害
        blockEffect.value -= actualDamage;
        console.log(`敌人的护盾抵消了 ${actualDamage} 点伤害，剩余护盾: ${blockEffect.value}`);
        actualDamage = 0;
      } else {
        // 防御部分抵消伤害
        actualDamage -= blockEffect.value;
        console.log(`敌人的护盾抵消了 ${blockEffect.value} 点伤害，剩余伤害: ${actualDamage}`);
        blockEffect.value = 0;
      }
    }
    
    // 对敌人造成伤害
    if (actualDamage > 0) {
      enemy.health = Math.max(0, enemy.health - actualDamage);
      console.log(`敌人 ${enemy.name} 受到 ${actualDamage} 点伤害，剩余生命值: ${enemy.health}`);
      
      // 显示伤害数字
      const enemySprite = this.enemyManager.getEnemySprites().get(enemy.id);
      if (enemySprite) {
        const damageText = this.scene.add.text(enemySprite.x, enemySprite.y - 20, `-${actualDamage}`, {
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
  }

  // 对玩家造成伤害
  damagePlayer(damage: number): void {
    this.playerManager.damagePlayer(damage);
  }

  // 应用毒素效果到敌人
  applyPoisonToEnemy(enemy: Enemy, value: number, duration: number): void {
    // 查找现有的毒素效果
    const existingPoison = enemy.effects.find(e => e.type === 'poison');
    
    if (existingPoison) {
      // 增加现有毒素效果的值
      existingPoison.value += value;
      // 更新持续时间为较大的值
      existingPoison.duration = Math.max(existingPoison.duration || 0, duration);
      console.log(`增加敌人毒素效果，当前毒素值: ${existingPoison.value}，持续回合: ${existingPoison.duration}`);
    } else {
      // 添加新的毒素效果
      enemy.effects.push({
        id: `poison-${Date.now()}`,
        name: '毒素',
        description: '每回合受到伤害',
        type: 'poison',
        value: value,
        duration: duration,
        imageUrl: ''
      });
      console.log(`添加敌人毒素效果，毒素值: ${value}，持续回合: ${duration}`);
    }
    
    // 显示毒素效果
    const enemySprite = this.enemyManager.getEnemySprites().get(enemy.id);
    if (enemySprite) {
      const poisonText = this.scene.add.text(enemySprite.x, enemySprite.y - 20, `+${value} 毒素`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#00ff00'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: poisonText,
        y: poisonText.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => poisonText.destroy()
      });
    }
  }

  // 应用效果到敌人
  applyEffectToEnemy(enemy: Enemy, effect: CardEffect): void {
    // 查找现有的同类效果
    const existingEffectIndex = enemy.effects.findIndex(e => e.type === effect.type);
    
    if (existingEffectIndex !== -1) {
      // 更新现有效果
      const existingEffect = enemy.effects[existingEffectIndex];
      existingEffect.value = (existingEffect.value || 0) + (effect.value || 0);
      
      // 更新持续时间为较大的值
      if (effect.duration !== undefined && existingEffect.duration !== undefined) {
        existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
      } else if (effect.duration !== undefined) {
        existingEffect.duration = effect.duration;
      }
      
      console.log(`更新敌人效果 ${effect.type}，当前值: ${existingEffect.value}，持续回合: ${existingEffect.duration}`);
    } else {
      // 添加新效果
      enemy.effects.push({
        id: `${effect.type}-${Date.now()}`,
        name: this.getEffectName(effect.type),
        description: this.getEffectDescription(effect.type),
        type: effect.type,
        value: effect.value || 0,
        duration: effect.duration || 1,
        imageUrl: ''
      });
      
      console.log(`添加敌人效果 ${effect.type}，值: ${effect.value}，持续回合: ${effect.duration}`);
    }
    
    // 显示效果文本
    const enemySprite = this.enemyManager.getEnemySprites().get(enemy.id);
    if (enemySprite) {
      const effectText = this.scene.add.text(enemySprite.x, enemySprite.y - 20, `+${this.getEffectName(effect.type)}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffcc00'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: effectText,
        y: effectText.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => effectText.destroy()
      });
    }
  }

  // 处理敌人死亡
  handleEnemyDeath(enemy: Enemy): void {
    console.log(`敌人 ${enemy.name} 已死亡`);
    
    // 移除敌人精灵
    this.enemyManager.removeEnemy(enemy);
    
    // 检查是否所有敌人都已死亡
    if (this.turnManager.checkEnemiesDefeated()) {
      console.log('所有敌人已被击败');
      
      // 战斗结束
      if (this.onBattleEnd) {
        this.onBattleEnd();
      }
    }
  }

  // 获取效果名称
  private getEffectName(effectType: string): string {
    switch (effectType) {
      case 'damage':
        return '伤害';
      case 'heal':
        return '治疗';
      case 'defense':
        return '防御';
      case 'poison':
        return '毒素';
      case 'draw_card':
        return '抽牌';
      case 'energy_gain':
        return '能量';
      case 'shield':
        return '护盾';
      case 'strength':
        return '力量';
      case 'vulnerable':
        return '易伤';
      case 'weaken':
        return '虚弱';
      default:
        return '未知效果';
    }
  }

  // 获取效果描述
  private getEffectDescription(effectType: string): string {
    switch (effectType) {
      case 'damage':
        return '造成伤害';
      case 'heal':
        return '恢复生命值';
      case 'defense':
        return '减少受到的伤害';
      case 'poison':
        return '每回合受到伤害';
      case 'draw_card':
        return '抽取卡牌';
      case 'energy_gain':
        return '获得能量';
      case 'shield':
        return '获得护盾';
      case 'strength':
        return '增加攻击力';
      case 'vulnerable':
        return '受到的伤害增加';
      case 'weaken':
        return '造成的伤害减少';
      default:
        return '未知效果';
    }
  }
}
