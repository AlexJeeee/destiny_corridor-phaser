import Phaser from 'phaser';
import { Character, GridCoord, Card, CardEffect, CardEffectType, AbilityEffectType, AbilityEffect } from '@/types';
import { BattlefieldManager } from './BattlefieldManager';
import { getEffectName, getEffectDescription } from '@/utils';

export class PlayerManager {
  private scene: Phaser.Scene;
  private battlefieldManager: BattlefieldManager;
  private player: Character | null = null;
  private playerSprite: Phaser.GameObjects.Container | null = null;
  private onHealthChange: ((health: number, maxHealth: number) => void) | null = null;
  private activePassiveAbilities: Set<string> = new Set();

  constructor(scene: Phaser.Scene, battlefieldManager: BattlefieldManager) {
    this.scene = scene;
    this.battlefieldManager = battlefieldManager;
  }

  setPlayer(player: Character | null): void {
    this.player = player;
    this.activePassiveAbilities.clear();
    
    // 初始检查被动技能
    if (player) {
      this.checkPassiveAbilities();
    }
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
        // 设置玩家图片的缩放比例，使其适应格子大小
        const tileSize = this.battlefieldManager.getTileSize();
        const scale = tileSize / Math.max(playerSprite.width, playerSprite.height) * 0.8; // 缩放到格子大小的80%
        playerSprite.setScale(scale);
        
        const playerContainer = this.scene.add.container(gridCell.pixelX, gridCell.pixelY);
        playerContainer.add(playerSprite);
        this.playerSprite = playerContainer;
        
        // 添加血条
        this.addHealthBar(playerContainer);
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
        
        // 添加血条
        this.addHealthBar(playerContainer);
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

  takeDamage(damage: number): void {
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
      
      // 检查被动技能
      this.checkPassiveAbilities();
      
      // 触发血量变化回调
      if (this.onHealthChange) {
        this.onHealthChange(this.player.health, this.player.maxHealth);
      }
      console.log(`玩家受到 ${actualDamage} 点伤害，剩余生命值: ${this.player.health}`);
      
      // 更新血条
      this.updateHealthBar();
    }
    
    // 显示伤害文本
    if (this.playerSprite) {
      const damageText = this.scene.add.text(0, -30, `-${damage}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ff0000',
      }).setOrigin(0.5);
      
      this.playerSprite.add(damageText);
      
      this.scene.tweens.add({
        targets: damageText,
        y: -60,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          damageText.destroy();
        }
      });
    }
  }

  heal(amount: number): void {
    if (!this.player) return;
    
    // 恢复生命值，但不超过最大生命值
    const oldHealth = this.player.health;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
    const actualHeal = this.player.health - oldHealth;
    
    // 检查被动技能
    this.checkPassiveAbilities();
    
    // 触发血量变化回调
    if (this.onHealthChange) {
      this.onHealthChange(this.player.health, this.player.maxHealth);
    }
    
    // 更新血条
    this.updateHealthBar();
    
    // 显示治疗文本
    if (this.playerSprite && actualHeal > 0) {
      const healText = this.scene.add.text(0, -30, `+${actualHeal}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#00ff00',
      }).setOrigin(0.5);
      
      this.playerSprite.add(healText);
      
      this.scene.tweens.add({
        targets: healText,
        y: -60,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          healText.destroy();
        }
      });
    }
  }

  addEffectToPlayer(effect: CardEffect | AbilityEffect): void {
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
      // 将新效果添加到玩家效果列表
      this.player.effects.push(effect);
      
      console.log(`添加玩家效果 ${effect.type}，值: ${effect.value || 0}，持续回合: ${effect.duration}`);
    }
    
    // 显示效果文本
    if (this.playerSprite) {
      let textColor = '#ffffff'; // 默认颜色
      let effectName = getEffectName(effect.type);
      
      // 根据效果类型设置不同颜色
      if (effect.type === CardEffectType.DEFENSE) {
        textColor = '#4a9ae1'; // 防御效果为蓝色
        effectName = '防御';
      } else if (effect.type === CardEffectType.SHIELD) {
        textColor = '#ffcc00'; // 护甲效果为黄色
        effectName = '护甲';
      }
      
      const effectText = this.scene.add.text(
        this.playerSprite.x, 
        this.playerSprite.y - 20, 
        `+${effect.value || 0} ${effectName}`, 
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: textColor
        }
      ).setOrigin(0.5);
      
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
    
    // 检查能量
    if (this.player.energy < card.cost) {
      console.log(`能量不足，无法使用卡牌 ${card.name}`);
      return false;
    }
    
    // 应用卡牌效果
    for (const effect of card.effects) {
      if (effect.type === CardEffectType.HEAL && effect.value) {
        // 治疗效果
        this.heal(effect.value);
      } else {
        // 所有其他效果，包括防御效果
        this.addEffectToPlayer(effect);
      }
    }
    
    return true;
  }

  useAbility(abilityId: string): boolean {
    if (!this.player) return false;
    
    // 查找技能
    const ability = this.player.abilities.find(a => a.id === abilityId);
    if (!ability) {
      console.log(`未找到技能 ID: ${abilityId}`);
      return false;
    }
    
    // 检查冷却
    if (ability.currentCooldown > 0) {
      console.log(`技能 ${ability.name} 正在冷却中，剩余回合: ${ability.currentCooldown}`);
      return false;
    }
    
    // 检查能量
    if (this.player.energy < ability.cost) {
      console.log(`能量不足，无法使用技能 ${ability.name}`);
      return false;
    }
    
    // 消耗能量
    this.player.energy -= ability.cost;
    
    // 应用技能效果
    for (const effect of ability.effects) {
      this.addEffectToPlayer(effect);
    }
    
    // 设置冷却
    ability.currentCooldown = ability.cooldown;
    
    console.log(`使用技能 ${ability.name}`);
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

  // 检查所有被动技能
  checkPassiveAbilities(): void {
    if (!this.player) return;
    
    // 获取当前血量百分比
    const healthPercentage = this.player.health / this.player.maxHealth;
    
    // 检查每个被动技能
    this.player.abilities.forEach(ability => {
      if (ability.isPassive) {
        let shouldActivate = true;
        
        // 检查每个效果的条件
        for (const effect of ability.effects) {
          // 检查血量条件
          if (effect.condition?.selfHealth !== undefined) {
            shouldActivate = healthPercentage <= effect.condition.selfHealth;
          }
          
          // 可以在这里添加其他条件检查
        }
        
        // 激活或停用被动技能
        if (shouldActivate && !this.activePassiveAbilities.has(ability.id)) {
          // 激活被动
          this.activePassiveAbilities.add(ability.id);
          console.log(`被动技能 ${ability.name} 已激活`);
          
          // 应用被动效果
          for (const effect of ability.effects) {
            this.addEffectToPlayer(effect);
          }
        } else if (!shouldActivate && this.activePassiveAbilities.has(ability.id)) {
          // 停用被动
          this.activePassiveAbilities.delete(ability.id);
          console.log(`被动技能 ${ability.name} 已停用`);
          
          // 移除被动效果
          this.removeEffectsByAbilityId(ability.id);
        }
      }
    });
  }
  
  // 根据技能ID移除效果
  removeEffectsByAbilityId(abilityId: string): void {
    if (!this.player) return;
    
    // 过滤掉指定技能ID的效果
    this.player.effects = this.player.effects.filter(effect => effect.id !== abilityId);
  }
  
  // 添加血条到玩家头上
  private addHealthBar(playerContainer: Phaser.GameObjects.Container): void {
    if (!this.player) return;
    
    const tileSize = this.battlefieldManager.getTileSize();
    
    // 创建血条容器，放在玩家头上
    const healthBarContainer = this.scene.add.container(0, -tileSize * 0.7);
    
    // 计算血条宽度
    const healthBarWidth = tileSize * 0.8;
    const healthPercent = this.player.health / this.player.maxHealth;
    
    // 添加血条背景
    const healthBarBg = this.scene.add.rectangle(0, 0, healthBarWidth, 10, 0x333333)
      .setOrigin(0.5, 0.5)
      .setName('healthBarBg');
    
    // 添加血条
    const healthBarColor = this.getHealthBarColor(healthPercent);
    const healthBar = this.scene.add.rectangle(
      -healthBarWidth / 2, 
      0, 
      healthBarWidth * healthPercent, 
      10, 
      healthBarColor
    )
      .setOrigin(0, 0.5)
      .setName('healthBar');
    
    // 添加血量文本
    const healthText = this.scene.add.text(0, 0, `${this.player.health}/${this.player.maxHealth}`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5).setName('healthText');
    
    // 将所有元素添加到血条容器
    healthBarContainer.add([healthBarBg, healthBar, healthText]);
    
    // 将血条容器添加到玩家精灵
    playerContainer.add(healthBarContainer);
  }
  
  // 根据血量百分比获取血条颜色
  private getHealthBarColor(healthPercent: number): number {
    if (healthPercent <= 0.3) {
      return 0xff0000; // 红色（低血量）
    } else if (healthPercent <= 0.6) {
      return 0xffaa00; // 橙色（中等血量）
    } else {
      return 0x00ff00; // 绿色（高血量）
    }
  }
  
  // 更新血条显示
  private updateHealthBar(): void {
    if (!this.player || !this.playerSprite) return;
    
    // 查找血条容器（最后一个元素）
    const healthBarContainer = this.playerSprite.list[this.playerSprite.list.length - 1] as Phaser.GameObjects.Container;
    if (!healthBarContainer) return;
    
    // 更新血量文本
    const healthText = healthBarContainer.getByName('healthText') as Phaser.GameObjects.Text;
    if (healthText) {
      healthText.setText(`${this.player.health}/${this.player.maxHealth}`);
    }
    
    // 更新血条
    const healthBar = healthBarContainer.getByName('healthBar') as Phaser.GameObjects.Rectangle;
    if (healthBar) {
      // 计算血量百分比
      const healthPercent = this.player.health / this.player.maxHealth;
      const healthBarWidth = this.battlefieldManager.getTileSize() * 0.8;
      
      // 更新血条宽度
      healthBar.width = healthBarWidth * healthPercent;
      
      // 更新血条颜色
      healthBar.setFillStyle(this.getHealthBarColor(healthPercent));
    }
  }
  
  // 设置血量变化监听器
  setHealthChangeListener(callback: (health: number, maxHealth: number) => void): void {
    this.onHealthChange = callback;
    
    // 添加血条更新逻辑
    const originalCallback = callback;
    this.onHealthChange = (health: number, maxHealth: number) => {
      // 调用原始回调
      if (originalCallback) {
        originalCallback(health, maxHealth);
      }
      
      // 更新血条
      this.updateHealthBar();
    };
  }
  
  // 获取当前激活的被动技能
  getActivePassiveAbilities(): Set<string> {
    return this.activePassiveAbilities;
  }
}
