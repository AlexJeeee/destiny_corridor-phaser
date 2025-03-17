import Phaser from 'phaser';
import { Character, GridCoord, Card, CardEffect, CardEffectType } from '@/types';
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
    
    // 检查玩家是否有防御效果
    const blockEffect = this.player.effects.find(e => e.type === CardEffectType.DEFENSE || e.type === CardEffectType.SHIELD);
    let actualDamage = damage;
    
    if (blockEffect) {
      if (blockEffect.value >= actualDamage) {
        // 防御完全抵消伤害
        blockEffect.value -= actualDamage;
        console.log(`玩家的护盾抵消了 ${actualDamage} 点伤害，剩余护盾: ${blockEffect.value}`);
        actualDamage = 0;
      } else {
        // 防御部分抵消伤害
        actualDamage -= blockEffect.value;
        console.log(`玩家的护盾抵消了 ${blockEffect.value} 点伤害，剩余伤害: ${actualDamage}`);
        blockEffect.value = 0;
      }
    }
    
    // 对玩家造成伤害
    if (actualDamage > 0) {
      this.player.health = Math.max(0, this.player.health - actualDamage);
      console.log(`玩家受到 ${actualDamage} 点伤害，剩余生命值: ${this.player.health}`);
    }
    
    // 显示伤害数字
    if (this.playerSprite) {
      const damageText = this.scene.add.text(this.playerSprite.x, this.playerSprite.y - 20, `-${actualDamage}`, {
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

  healPlayer(amount: number): void {
    if (!this.player) return;
    
    // 恢复生命值，但不超过最大生命值
    const oldHealth = this.player.health;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
    const actualHeal = this.player.health - oldHealth;
    
    console.log(`玩家恢复了 ${actualHeal} 点生命值，当前生命值: ${this.player.health}`);
    
    // 显示治疗数字
    if (this.playerSprite && actualHeal > 0) {
      const healText = this.scene.add.text(this.playerSprite.x, this.playerSprite.y - 20, `+${actualHeal}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#00ff00'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: healText,
        y: healText.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => healText.destroy()
      });
    }
  }

  addDefenseToPlayer(amount: number, duration: number = 1): void {
    if (!this.player) return;
    
    // 查找现有的防御效果
    const existingDefense = this.player.effects.find(e => e.type === 'defense');
    
    if (existingDefense) {
      // 增加现有防御效果的值
      existingDefense.value += amount;
      // 更新持续时间为较大的值
      existingDefense.duration = Math.max(existingDefense.duration || 0, duration);
      console.log(`增加玩家防御效果，当前防御值: ${existingDefense.value}，持续回合: ${existingDefense.duration}`);
    } else {
      // 添加新的防御效果
      this.player.effects.push({
        id: `defense-${Date.now()}`,
        name: '防御',
        description: '减少受到的伤害',
        type: CardEffectType.DEFENSE,
        value: amount,
        duration: duration,
        imageUrl: ''
      });
      console.log(`添加玩家防御效果，防御值: ${amount}，持续回合: ${duration}`);
    }
    
    // 显示防御效果
    if (this.playerSprite) {
      const defenseText = this.scene.add.text(this.playerSprite.x, this.playerSprite.y - 20, `+${amount} 防御`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#4a9ae1'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: defenseText,
        y: defenseText.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => defenseText.destroy()
      });
    }
  }

  addEffectToPlayer(effect: CardEffect): void {
    if (!this.player) return;
    
    // 查找现有的同类效果
    const existingEffectIndex = this.player.effects.findIndex(e => e.type === effect.type);
    
    if (existingEffectIndex !== -1) {
      // 更新现有效果
      const existingEffect = this.player.effects[existingEffectIndex];
      existingEffect.value = (existingEffect.value || 0) + (effect.value || 0);
      
      // 更新持续时间为较大的值
      if (effect.duration !== undefined && existingEffect.duration !== undefined) {
        existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
      } else if (effect.duration !== undefined) {
        existingEffect.duration = effect.duration;
      }
      
      console.log(`更新玩家效果 ${effect.type}，当前值: ${existingEffect.value}，持续回合: ${existingEffect.duration}`);
    } else {
      // 添加新效果
      this.player.effects.push({
        id: `${effect.type}-${Date.now()}`,
        name: this.getEffectName(effect.type),
        description: this.getEffectDescription(effect.type),
        type: effect.type,
        value: effect.value || 0,
        duration: effect.duration || 1,
        imageUrl: '',
        target: effect.target
      });
      
      console.log(`添加玩家效果 ${effect.type}，值: ${effect.value}，持续回合: ${effect.duration}`);
    }
    
    // 显示效果文本
    if (this.playerSprite) {
      const effectText = this.scene.add.text(this.playerSprite.x, this.playerSprite.y - 20, `+${this.getEffectName(effect.type)}`, {
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

  useCardOnSelf(card: Card): boolean {
    if (!this.player) return false;
    
    console.log(`玩家对自己使用卡牌: ${card.name}`);
    
    // 检查能量是否足够
    if (this.player.energy < card.cost) {
      console.log('能量不足，无法使用卡牌');
      return false;
    }
    
    // 应用卡牌效果
    for (const effect of card.effects) {
      if (effect.type === CardEffectType.HEAL && effect.value) {
        // 治疗效果
        this.healPlayer(effect.value);
      } else if (effect.type === CardEffectType.DEFENSE && effect.value) {
        // 防御效果
        this.addDefenseToPlayer(effect.value, effect.duration);
      } else {
        // 其他效果
        this.addEffectToPlayer(effect);
      }
    }
    
    return true;
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
