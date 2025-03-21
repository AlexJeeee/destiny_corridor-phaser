import Phaser from 'phaser';
import { Character, Ability } from '@/types';
import { PlayerManager } from './PlayerManager'; // 修正导入方式，使用命名导入

export class UIManager {
  private scene: Phaser.Scene;
  private playerManager: PlayerManager;
  private infoPanel: Phaser.GameObjects.Container | null = null;
  private turnText: Phaser.GameObjects.Text | null = null;
  private endTurnButton: Phaser.GameObjects.Container | null = null;
  private onEndTurnClicked: (() => void) | null = null;
  private abilitiesPanel: Phaser.GameObjects.Container | null = null;
  private statusEffectsPanel: Phaser.GameObjects.Container | null = null;
  private abilityIcons: Map<string, { bg: Phaser.GameObjects.Rectangle, icon: Phaser.GameObjects.Text, activeIndicator?: Phaser.GameObjects.Rectangle }> = new Map();
  private onAbilityClicked: ((abilityId: string) => void) | null = null;

  constructor(scene: Phaser.Scene, playerManager: PlayerManager) {
    this.scene = scene;
    this.playerManager = playerManager;
    
    // 设置血量变化监听器
    this.playerManager.setHealthChangeListener((health: number, maxHealth: number) => {
      this.updatePlayerHealth(health, maxHealth);
      this.updatePassiveAbilities();
    });
  }

  setOnEndTurnClicked(callback: () => void): void {
    this.onEndTurnClicked = callback;
  }

  setOnAbilityClicked(callback: (abilityId: string) => void): void {
    this.onAbilityClicked = callback;
  }

  createUI(): void {
    // 创建回合信息
    this.turnText = this.scene.add.text(20, 20, '玩家回合', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });
    
    // 创建结束回合按钮
    this.createEndTurnButton();
  }

  createEndTurnButton(): void {
    this.endTurnButton = this.scene.add.container(this.scene.cameras.main.width - 100, 50);
    
    // 创建按钮背景
    const buttonBg = this.scene.add.rectangle(0, 0, 120, 40, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', () => {
        if (this.onEndTurnClicked) this.onEndTurnClicked();
      })
      .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
      .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));
    
    // 创建按钮文本
    const buttonText = this.scene.add.text(0, 0, '结束回合', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // 将背景和文本添加到容器
    this.endTurnButton.add([buttonBg, buttonText]);
  }

  createInfoPanel(player: Character | null, currentFloor: number): void {
    // 创建信息面板容器
    this.infoPanel = this.scene.add.container(this.scene.cameras.main.width - 150, 190);
    
    // 创建面板背景
    const panelBg = this.scene.add.rectangle(0, 0, 250, 200, 0x222222, 0.7)
      .setStrokeStyle(1, 0xffffff);
    
    // 创建玩家信息
    const playerInfo = this.scene.add.text(-100, -80, `玩家: ${player?.name || ''}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    });
    
    // 创建生命值信息
    const healthInfo = this.scene.add.text(-100, -50, `生命: ${player?.health || 0}/${player?.maxHealth || 0}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#4ae15a',
    });
    
    // 创建能量信息
    const energyInfo = this.scene.add.text(-100, -20, `能量: ${player?.energy || 0}/${player?.maxEnergy || 0}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#4a9ae1',
    });
    
    // 创建当前楼层信息
    const floorInfo = this.scene.add.text(-100, 10, `当前楼层: ${currentFloor}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#e1c74a',
    });
    
    // 将元素添加到容器
    this.infoPanel.add([panelBg, playerInfo, healthInfo, energyInfo, floorInfo]);
    
    // 创建技能面板
    if (player) {
      this.createAbilitiesPanel(player);
      this.createStatusEffectsPanel(player);
    }
  }

  createAbilitiesPanel(player: Character): void {
    if (!player || !player.abilities || player.abilities.length === 0) return;
    
    // 清除现有的技能面板
    if (this.abilitiesPanel) {
      this.abilitiesPanel.destroy();
    }
    
    // 清除技能图标缓存
    this.abilityIcons.clear();
    
    // 创建技能面板容器
    this.abilitiesPanel = this.scene.add.container(this.scene.cameras.main.width - 150, 350);
    
    if (!this.abilitiesPanel) return; 
    
    // 创建面板背景
    const panelBg = this.scene.add.rectangle(0, 0, 250, 120, 0x222222, 0.7)
      .setStrokeStyle(1, 0xffffff);
    
    // 创建技能标题
    const titleText = this.scene.add.text(-100, -50, '角色技能', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    });
    
    this.abilitiesPanel.add([panelBg, titleText]);
    
    // 为每个技能创建按钮或图标
    player.abilities.forEach((ability, index) => {
      const yPos = -20 + index * 40;
      
      // 创建技能容器
      const abilityContainer = this.scene.add.container(-80, yPos);
      
      if (!abilityContainer) return; 
      
      // 创建技能图标背景
      const iconBg = this.scene.add.rectangle(0, 0, 32, 32, !ability.isPassive ? 0x4a3b96 : 0x666666, 1)
        .setStrokeStyle(1, 0xffffff);
      
      // 如果是主动技能，添加交互功能
      if (!ability.isPassive) {
        iconBg.setInteractive()
          .on('pointerdown', () => {
            if (this.onAbilityClicked) this.onAbilityClicked(ability.id);
          })
          .on('pointerover', () => {
            iconBg.setFillStyle(0x5a4ba6)
            iconBg.setStrokeStyle(2, 0xffff00);
          })
          .on('pointerout', () => {
            iconBg.setFillStyle(0x4a3b96)
            iconBg.setStrokeStyle(1, 0xffffff);
          });
      }
      
      // 创建技能图标（使用首字母）
      const iconText = this.scene.add.text(0, 0, ability.name.charAt(0), {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      // 创建技能名称
      const nameText = this.scene.add.text(25, -8, ability.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
      });
      
      // 创建技能描述
      const descText = this.scene.add.text(25, 8, ability.description, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#cccccc',
        wordWrap: { width: 150 }
      });
      
      // 添加冷却显示（仅对主动技能）
      if (!ability.isPassive) {
        const cooldownText = this.scene.add.text(0, 0, 
          ability.currentCooldown > 0 ? `${ability.currentCooldown}` : '', {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ff0000',
          backgroundColor: '#000000'
        }).setOrigin(1, 1);
        
        // 将冷却文本添加到图标右下角
        cooldownText.setPosition(16, 16);
      }
      
      
      // 为被动技能添加激活指示器（初始隐藏）
      let activeIndicator;
      if (ability.isPassive) {
        activeIndicator = this.scene.add.rectangle(0, 0, 32, 32, 0x00ff00, 0.3)
          .setVisible(false);
        abilityContainer.add(activeIndicator);
      }
      
      // 将所有元素添加到容器
      abilityContainer.add([iconBg, iconText, nameText, descText]);
      if (this.abilitiesPanel) {
        this.abilitiesPanel.add(abilityContainer);
      }
      
      // 保存技能图标引用
      this.abilityIcons.set(ability.id, { 
        bg: iconBg, 
        icon: iconText,
        activeIndicator
      });
    });
    
    // 初始更新被动技能状态
    this.updatePassiveAbilities();
  }

  createStatusEffectsPanel(player: Character): void {
    if (!player) return;
    
    // 清除现有的状态效果面板
    if (this.statusEffectsPanel) {
      this.statusEffectsPanel.destroy();
    }
    
    // 如果没有状态效果，则不创建面板
    if (!player.effects || player.effects.length === 0) return;
    
    // 创建状态效果面板容器
    this.statusEffectsPanel = this.scene.add.container(150, 150);
    
    if (!this.statusEffectsPanel) return; // 添加null检查
    
    // 创建面板背景
    const panelBg = this.scene.add.rectangle(-25, 0, 180, 100, 0x222222, 0.7)
      .setStrokeStyle(1, 0xffffff);
    
    // 创建状态效果标题
    const titleText = this.scene.add.text(-50, -40, '状态效果', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    });
    
    this.statusEffectsPanel.add([panelBg, titleText]);
    
    // 为每个状态效果创建图标
    player.effects.forEach((effect, index) => {
      const xPos = -80 + (index % 5) * 40;
      const yPos = -10 + Math.floor(index / 5) * 40;
      
      // 创建效果容器
      const effectContainer = this.scene.add.container(xPos, yPos) as any; // 使用any类型以添加自定义属性
      effectContainer.tooltip = null; // 初始化tooltip属性
      
      // 创建效果图标背景
      const iconBg = this.scene.add.rectangle(0, 0, 32, 32, 0x333333, 1)
        .setStrokeStyle(1, 0xffffff);
      
      // 设置图标背景为可交互，以显示提示信息
      iconBg.setInteractive()
        .on('pointerover', () => {
          // 显示效果描述提示
          const tooltip = this.scene.add.text(0, -40, `${effect.name}: ${effect.description}`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
          }).setOrigin(0.5, 1);
          
          effectContainer.add(tooltip);
          effectContainer.tooltip = tooltip;
        })
        .on('pointerout', () => {
          // 移除提示
          if (effectContainer.tooltip) {
            effectContainer.tooltip.destroy();
            effectContainer.tooltip = null;
          }
        });
      
      // 创建效果名称首字母
      const nameText = this.scene.add.text(0, 0, effect.name.charAt(0), {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      // 创建效果值
      const valueText = this.scene.add.text(0, 10, `${effect.value}`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      // 创建效果持续时间（如果有）
      let durationText = null;
      if (effect.duration && effect.duration > 0) {
        durationText = this.scene.add.text(12, 12, `${effect.duration}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ffcc00',
          backgroundColor: '#000000'
        }).setOrigin(1);
      }
      
      // 将元素添加到容器
      const containerElements = [iconBg, nameText, valueText];
      if (durationText) containerElements.push(durationText);
      if (effectContainer) { 
        effectContainer.add(containerElements);
        
        // 添加到状态效果面板
        if (this.statusEffectsPanel) { 
          this.statusEffectsPanel.add(effectContainer);
        }
      }
    });
  }

  updateInfoPanel(player: Character | null): void {
    if (!this.infoPanel || !player) return;
    
    // 更新玩家信息
    const healthInfo = this.infoPanel.getAt(2) as Phaser.GameObjects.Text;
    const energyInfo = this.infoPanel.getAt(3) as Phaser.GameObjects.Text;
    
    if (healthInfo && energyInfo) {
      healthInfo.setText(`生命: ${player.health}/${player.maxHealth}`);
      energyInfo.setText(`能量: ${player.energy}/${player.maxEnergy}`);
    }
    
    // 更新技能面板
    if (player) {
      this.createAbilitiesPanel(player);
      
      // 更新状态效果面板
      this.createStatusEffectsPanel(player);
    }
  }

  updateTurnText(isPlayerTurn: boolean): void {
    if (this.turnText) {
      this.turnText.setText(isPlayerTurn ? '玩家回合' : '敌人回合');
    }
  }

  createGameOverScreen(onRestartClicked: () => void): void {
    // 显示游戏结束界面
    const overlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0);
    
    const gameOverText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 - 50, '游戏结束', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const restartButton = this.scene.add.container(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 + 50);
    
    const buttonBg = this.scene.add.rectangle(0, 0, 200, 50, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', onRestartClicked)
      .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
      .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));
    
    const buttonText = this.scene.add.text(0, 0, '返回主菜单', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    restartButton.add([buttonBg, buttonText]);
  }

  clearUI(): void {
    // 清除信息面板
    if (this.infoPanel) {
      this.infoPanel.destroy();
      this.infoPanel = null;
    }
    
    // 清除回合文本
    if (this.turnText) {
      this.turnText.destroy();
      this.turnText = null;
    }

    // 清除结束回合按钮
    if (this.endTurnButton) {
      this.endTurnButton.destroy();
      this.endTurnButton = null;
    }
    
    // 清除技能面板
    if (this.abilitiesPanel) {
      this.abilitiesPanel.destroy();
      this.abilitiesPanel = null;
    }
    
    // 清除状态效果面板
    if (this.statusEffectsPanel) {
      this.statusEffectsPanel.destroy();
      this.statusEffectsPanel = null;
    }
  }

  getInfoPanel(): Phaser.GameObjects.Container | null {
    return this.infoPanel;
  }

  getTurnText(): Phaser.GameObjects.Text | null {
    return this.turnText;
  }

  // 更新被动技能的显示状态
  updatePassiveAbilities(): void {
    if (!this.playerManager || !this.abilitiesPanel) return;
    
    const activeAbilities = this.playerManager.getActivePassiveAbilities();
    
    // 更新每个被动技能的显示状态
    this.abilityIcons.forEach((iconElements, abilityId) => {
      const isActive = activeAbilities.has(abilityId);
      
      if (iconElements.activeIndicator) {
        // 更新激活指示器可见性
        iconElements.activeIndicator.setVisible(isActive);
        
        // 更新图标背景颜色
        if (isActive) {
          iconElements.bg.setFillStyle(0x00aa00, 1);
        } else {
          iconElements.bg.setFillStyle(0x666666, 1);
        }
      }
    });
  }
  
  // 更新玩家血量显示
  updatePlayerHealth(health: number, maxHealth: number): void {
    if (!this.infoPanel) return;
    
    // 查找血量文本
    const healthText = this.infoPanel.getByName('healthText') as Phaser.GameObjects.Text;
    if (healthText) {
      healthText.setText(`生命: ${health}/${maxHealth}`);
    }
    
    // 计算血量百分比
    const healthPercent = health / maxHealth;
    
    // 查找血条
    const healthBar = this.infoPanel.getByName('healthBar') as Phaser.GameObjects.Rectangle;
    if (healthBar) {
      // 更新血条宽度
      healthBar.width = 150 * healthPercent;
      
      // 根据血量百分比更改颜色
      if (healthPercent <= 0.3) {
        healthBar.setFillStyle(0xff0000); // 红色（低血量）
      } else if (healthPercent <= 0.6) {
        healthBar.setFillStyle(0xffaa00); // 橙色（中等血量）
      } else {
        healthBar.setFillStyle(0x00ff00); // 绿色（高血量）
      }
    }
  }
}
