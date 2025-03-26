import { Character, Enemy, Card, CardType, CardEffect, CardEffectType, AbilityEffectType } from '@/types';
import { PlayerManager, EnemyManager, CardManager, TurnManager } from '@/game/scenes/game-board-scene/components';
import { getEffectName, getEffectDescription } from '@/utils';

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
      if (effect.type === CardEffectType.DAMAGE && effect.value) {
        // 伤害效果
        this.damageEnemy(enemy, effect.value);
      } else if (effect.type === CardEffectType.POISON && effect.value) {
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
    const blockEffect = enemy.effects.find(e => e.type === CardEffectType.DEFENSE || e.type === CardEffectType.SHIELD);
    let actualDamage = damage;

    if (this.player.effects.find(e => e.type === AbilityEffectType.BOOST_DAMAGE)) {
      actualDamage *= (1 + (this.player.effects.find(e => e.type === AbilityEffectType.BOOST_DAMAGE)?.value || 0));
    }

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
    this.playerManager.takeDamage(damage);
  }

  // 应用毒素效果到敌人
  applyPoisonToEnemy(enemy: Enemy, value: number, duration: number): void {
    // 查找现有的毒素效果
    const existingPoison = enemy.effects.find(e => e.type === CardEffectType.POISON);

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
        type: CardEffectType.POISON,
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
        name: getEffectName(effect.type),
        description: getEffectDescription(effect.type),
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
      const effectText = this.scene.add.text(enemySprite.x, enemySprite.y - 20, `+${getEffectName(effect.type)}`, {
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
}
