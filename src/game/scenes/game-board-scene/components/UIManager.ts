import Phaser from 'phaser';
import { Character } from '@/types';

export class UIManager {
  private scene: Phaser.Scene;
  private infoPanel: Phaser.GameObjects.Container | null = null;
  private turnText: Phaser.GameObjects.Text | null = null;
  private endTurnButton: Phaser.GameObjects.Container | null = null;
  private onEndTurnClicked: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setOnEndTurnClicked(callback: () => void): void {
    this.onEndTurnClicked = callback;
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
  }

  getInfoPanel(): Phaser.GameObjects.Container | null {
    return this.infoPanel;
  }

  getTurnText(): Phaser.GameObjects.Text | null {
    return this.turnText;
  }
}
