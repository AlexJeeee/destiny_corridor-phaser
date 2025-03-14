import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Character, Enemy, HexCoord, Card } from '../../types';
import { generateBattlefield } from '../../utils/battlefieldUtils';
import { getEnemiesByFloor } from '../../data/enemies';

export class GameBoardScene extends BaseScene {
  // 游戏数据
  private player: Character | null = null;
  private enemies: Enemy[] = [];
  private currentFloor: number = 1;
  private playerCards: Card[] = [];
  private selectedCard: Card | null = null;
  
  // 游戏对象
  private hexTiles: Phaser.GameObjects.Container[] = [];
  private playerSprite: Phaser.GameObjects.Sprite | null = null;
  private enemySprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private infoPanel: Phaser.GameObjects.Container | null = null;
  private turnText: Phaser.GameObjects.Text | null = null;
  
  // 游戏状态
  private currentTurn: string = 'player'; // 'player' 或 'enemy'
  private validMoves: HexCoord[] = [];
  private hexSize: number = 40;
  private hexGrid: any[][] = [];

  constructor() {
    super('GameBoardScene');
  }

  init(data: any): void {
    // 初始化游戏数据
    if (data && data.character) {
      this.player = data.character;
    }
    this.currentFloor = 1;
  }

  preload(): void {
    // 加载游戏资源
    this.load.image('hex-tile', 'assets/images/hex-tile.png');
    this.load.image('hex-highlight', 'assets/images/hex-highlight.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('card-back', 'assets/images/card-back.png');
    this.load.image('card-frame', 'assets/images/card-frame.png');
    this.load.image('button', 'assets/images/button.png');
  }

  create(): void {
    super.create();

    // 创建游戏界面
    this.createBackground();
    this.createBattlefield();
    this.createPlayer();
    this.createEnemies();
    this.createCards();
    this.createUI();

    // 设置相机
    this.cameras.main.setBounds(0, 0, this.game.config.width as number, this.game.config.height as number);
    
    // 开始玩家回合
    this.startPlayerTurn();
  }

  update(): void {
    // 游戏逻辑更新
  }

  private createBackground(): void {
    // 创建游戏背景
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e)
      .setOrigin(0)
      .setScrollFactor(0);
  }

  private createBattlefield(): void {
    // 生成战场数据
    const battlefield = generateBattlefield(5, 5);
    
    // 计算六边形网格的起始位置
    const startX = this.cameras.main.width / 2 - (5 * this.hexSize * 1.5) / 2;
    const startY = this.cameras.main.height / 2 - (5 * this.hexSize * 1.73) / 2;
    
    // 创建六边形网格
    for (let row = 0; row < battlefield.tiles.length; row++) {
      this.hexGrid[row] = [];
      for (let col = 0; col < battlefield.tiles[row].length; col++) {
        const tile = battlefield.tiles[row][col];
        const pixelX = startX + col * this.hexSize * 1.5;
        const pixelY = startY + row * this.hexSize * 1.73 + (col % 2) * (this.hexSize * 1.73 / 2);
        
        // 创建六边形容器
        const hexContainer = this.add.container(pixelX, pixelY);
        
        // 创建六边形图像或形状
        let hexTile;
        if (this.textures.exists('hex-tile')) {
          hexTile = this.add.image(0, 0, 'hex-tile');
        } else {
          // 如果没有加载到六边形图像，则使用多边形绘制
          const hexPoints = this.createHexagonPoints(this.hexSize);
          hexTile = this.add.polygon(0, 0, hexPoints, 0x0f3460);
        }
        
        // 添加交互
        hexTile.setInteractive(new Phaser.Geom.Polygon(this.createHexagonPoints(this.hexSize)), Phaser.Geom.Polygon.Contains)
          .on('pointerdown', () => this.handleHexClick(tile.coord))
          .on('pointerover', () => hexTile.setTint(0x5a4ba6))
          .on('pointerout', () => hexTile.clearTint());
        
        // 添加坐标文本（调试用）
        const coordText = this.add.text(0, 0, `${tile.coord.q},${tile.coord.r}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ffffff',
        }).setOrigin(0.5);
        
        // 将元素添加到容器
        hexContainer.add([hexTile, coordText]);
        
        // 保存引用
        this.hexTiles.push(hexContainer);
        this.hexGrid[row][col] = {
          container: hexContainer,
          tile: tile,
          pixelX: pixelX,
          pixelY: pixelY
        };
      }
    }
  }

  private createHexagonPoints(size: number): number[] {
    const points: number[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push(size * Math.cos(angle));
      points.push(size * Math.sin(angle));
    }
    return points;
  }

  private createPlayer(): void {
    if (!this.player) return;
    
    // 设置玩家初始位置
    const startPosition = { q: 0, r: 0, s: 0 };
    this.player.position = startPosition;
    
    // 找到对应的六边形格子
    const hexCell = this.findHexCellByCoord(startPosition);
    if (hexCell) {
      // 创建玩家精灵
      if (this.textures.exists('player')) {
        this.playerSprite = this.add.sprite(hexCell.pixelX, hexCell.pixelY, 'player');
      } else {
        // 如果没有加载到玩家图像，则使用圆形替代
        const graphics = this.add.graphics();
        graphics.fillStyle(0x4a9ae1, 1);
        graphics.fillCircle(hexCell.pixelX, hexCell.pixelY, this.hexSize / 2);
        
        // 添加玩家名称首字母
        this.add.text(hexCell.pixelX, hexCell.pixelY, this.player.name.charAt(0), {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ffffff',
        }).setOrigin(0.5);
      }
    }
  }

  private createEnemies(): void {
    // 获取当前楼层的敌人
    this.enemies = getEnemiesByFloor(this.currentFloor);
    
    // 为敌人分配固定位置
    this.enemies.forEach((enemy, index) => {
      let position: HexCoord;
      
      if (index === 0) {
        position = { q: 3, r: 1, s: -4 };
      } else if (index === 1) {
        position = { q: 2, r: 3, s: -5 };
      } else {
        position = { q: 4, r: 2, s: -6 };
      }
      
      enemy.position = position;
      
      // 找到对应的六边形格子
      const hexCell = this.findHexCellByCoord(position);
      if (hexCell) {
        // 创建敌人精灵
        let enemySprite;
        if (this.textures.exists('enemy')) {
          enemySprite = this.add.sprite(hexCell.pixelX, hexCell.pixelY, 'enemy');
        } else {
          // 如果没有加载到敌人图像，则使用圆形替代
          const graphics = this.add.graphics();
          graphics.fillStyle(0xe53e3e, 1);
          graphics.fillCircle(hexCell.pixelX, hexCell.pixelY, this.hexSize / 2);
          
          // 添加敌人名称首字母
          const nameText = this.add.text(hexCell.pixelX, hexCell.pixelY, enemy.name.charAt(0), {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
          }).setOrigin(0.5);
          
          enemySprite = nameText;
        }
        
        // 保存敌人精灵引用
        this.enemySprites.set(enemy.id, enemySprite);
      }
    });
  }

  private createCards(): void {
    // 模拟玩家手牌
    this.playerCards = this.player?.deck?.slice(0, 5) || [];
    
    // 创建卡牌区域
    const cardAreaY = this.cameras.main.height - 100;
    const cardWidth = 80;
    const cardSpacing = 20;
    const totalWidth = (cardWidth + cardSpacing) * this.playerCards.length - cardSpacing;
    const startX = (this.cameras.main.width - totalWidth) / 2;
    
    // 创建卡牌精灵
    this.playerCards.forEach((card, index) => {
      const x = startX + index * (cardWidth + cardSpacing) + cardWidth / 2;
      const y = cardAreaY;
      
      // 创建卡牌容器
      const cardContainer = this.add.container(x, y);
      
      // 创建卡牌背景
      let cardBg;
      if (this.textures.exists('card-frame')) {
        cardBg = this.add.image(0, 0, 'card-frame');
      } else {
        // 如果没有加载到卡牌图像，则使用矩形替代
        cardBg = this.add.rectangle(0, 0, cardWidth, cardWidth * 1.4, 0x333333, 1)
          .setStrokeStyle(2, 0xffffff);
      }
      
      // 添加卡牌标题
      const titleText = this.add.text(0, -cardWidth * 0.5 + 15, card.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      // 添加卡牌类型
      const typeText = this.add.text(0, -cardWidth * 0.5 + 30, card.type, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      
      // 添加卡牌描述
      const descText = this.add.text(0, 0, card.description, {
        fontFamily: 'Arial',
        fontSize: '8px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: cardWidth - 10 }
      }).setOrigin(0.5);
      
      // 添加卡牌消耗
      const costText = this.add.text(-cardWidth * 0.4, -cardWidth * 0.5 + 15, card.cost.toString(), {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffde00',
      }).setOrigin(0.5);
      
      // 将元素添加到容器
      cardContainer.add([cardBg, titleText, typeText, descText, costText]);
      
      // 添加交互
      cardBg.setInteractive()
        .on('pointerdown', () => this.handleCardClick(card, index))
        .on('pointerover', () => {
          cardContainer.setScale(1.1);
          cardBg.setTint(0x5a4ba6);
        })
        .on('pointerout', () => {
          cardContainer.setScale(1);
          cardBg.clearTint();
        });
      
      // 保存卡牌容器引用
      this.cardSprites.push(cardContainer);
    });
  }

  private createUI(): void {
    // 创建回合信息
    this.turnText = this.add.text(20, 20, '玩家回合', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });
    
    // 创建结束回合按钮
    const endTurnButton = this.add.container(this.cameras.main.width - 100, 50);
    
    // 创建按钮背景
    const buttonBg = this.add.rectangle(0, 0, 120, 40, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', () => this.endPlayerTurn())
      .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
      .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));
    
    // 创建按钮文本
    const buttonText = this.add.text(0, 0, '结束回合', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // 将背景和文本添加到容器
    endTurnButton.add([buttonBg, buttonText]);
    
    // 创建信息面板
    this.createInfoPanel();
  }

  private createInfoPanel(): void {
    // 创建信息面板容器
    this.infoPanel = this.add.container(this.cameras.main.width - 150, 150);
    
    // 创建面板背景
    const panelBg = this.add.rectangle(0, 0, 250, 200, 0x222222, 0.7)
      .setStrokeStyle(1, 0xffffff);
    
    // 创建玩家信息
    const playerInfo = this.add.text(-100, -80, `玩家: ${this.player?.name || ''}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    });
    
    // 创建生命值信息
    const healthInfo = this.add.text(-100, -50, `生命: ${this.player?.health || 0}/${this.player?.maxHealth || 0}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#4ae15a',
    });
    
    // 创建能量信息
    const energyInfo = this.add.text(-100, -20, `能量: ${this.player?.energy || 0}/${this.player?.maxEnergy || 0}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#4a9ae1',
    });
    
    // 创建当前楼层信息
    const floorInfo = this.add.text(-100, 10, `当前楼层: ${this.currentFloor}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#e1c74a',
    });
    
    // 将元素添加到容器
    this.infoPanel.add([panelBg, playerInfo, healthInfo, energyInfo, floorInfo]);
  }

  private findHexCellByCoord(coord: HexCoord): any {
    // 遍历六边形网格查找对应坐标的格子
    for (let row = 0; row < this.hexGrid.length; row++) {
      for (let col = 0; col < this.hexGrid[row].length; col++) {
        const cell = this.hexGrid[row][col];
        if (
          cell.tile.coord.q === coord.q &&
          cell.tile.coord.r === coord.r &&
          cell.tile.coord.s === coord.s
        ) {
          return cell;
        }
      }
    }
    return null;
  }

  private handleHexClick(coord: HexCoord): void {
    // 如果是玩家回合且选中了卡牌
    if (this.currentTurn === 'player' && this.selectedCard) {
      // 检查是否是有效的移动位置
      const isValidMove = this.validMoves.some(move => 
        move.q === coord.q && move.r === coord.r && move.s === coord.s
      );
      
      if (isValidMove) {
        // 移动玩家
        this.movePlayer(coord);
        
        // 使用卡牌
        this.playCard(this.selectedCard);
        
        // 清除选中状态
        this.clearCardSelection();
      }
    }
  }

  private handleCardClick(card: Card, index: number): void {
    // 如果已经选中了这张卡牌，则取消选中
    if (this.selectedCard && this.selectedCard.id === card.id) {
      this.clearCardSelection();
      return;
    }
    
    // 选中卡牌
    this.selectedCard = card;
    
    // 高亮显示选中的卡牌
    this.cardSprites.forEach((sprite, i) => {
      if (i === index) {
        sprite.setScale(1.2);
      } else {
        sprite.setScale(0.9);
        sprite.setAlpha(0.7);
      }
    });
    
    // 如果是移动卡牌，显示可移动的位置
    if (card.type === 'movement') {
      this.showValidMoves();
    }
  }

  private showValidMoves(): void {
    // 清除之前的有效移动标记
    this.clearValidMoves();
    
    // 计算有效移动位置
    if (this.player && this.selectedCard) {
      // 假设移动范围为2格
      const moveRange = 2;
      this.validMoves = this.getValidMoves(this.player.position, moveRange);
      
      // 高亮显示有效移动位置
      this.validMoves.forEach(move => {
        const hexCell = this.findHexCellByCoord(move);
        if (hexCell) {
          const hexTile = hexCell.container.getAt(0);
          hexTile.setTint(0x00ff00);
        }
      });
    }
  }

  private clearValidMoves(): void {
    // 清除有效移动位置的高亮显示
    this.validMoves.forEach(move => {
      const hexCell = this.findHexCellByCoord(move);
      if (hexCell) {
        const hexTile = hexCell.container.getAt(0);
        hexTile.clearTint();
      }
    });
    
    // 清空有效移动列表
    this.validMoves = [];
  }

  private clearCardSelection(): void {
    // 清除卡牌选中状态
    this.selectedCard = null;
    
    // 恢复卡牌显示
    this.cardSprites.forEach(sprite => {
      sprite.setScale(1);
      sprite.setAlpha(1);
    });
    
    // 清除有效移动标记
    this.clearValidMoves();
  }

  private movePlayer(coord: HexCoord): void {
    if (!this.player || !this.playerSprite) return;
    
    // 更新玩家位置
    this.player.position = coord;
    
    // 找到目标六边形格子
    const hexCell = this.findHexCellByCoord(coord);
    if (hexCell) {
      // 创建移动动画
      this.tweens.add({
        targets: this.playerSprite,
        x: hexCell.pixelX,
        y: hexCell.pixelY,
        duration: 500,
        ease: 'Power2'
      });
    }
  }

  private playCard(card: Card): void {
    // 实现卡牌效果
    console.log(`使用卡牌: ${card.name}`);
    
    // 从手牌中移除卡牌
    const cardIndex = this.playerCards.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      this.playerCards.splice(cardIndex, 1);
      
      // 移除卡牌精灵
      if (this.cardSprites[cardIndex]) {
        this.cardSprites[cardIndex].destroy();
        this.cardSprites.splice(cardIndex, 1);
      }
    }
  }

  private startPlayerTurn(): void {
    // 设置当前回合为玩家回合
    this.currentTurn = 'player';
    
    // 更新回合文本
    if (this.turnText) {
      this.turnText.setText('玩家回合');
    }
    
    // 抽取卡牌
    // this.drawCards(1);
  }

  private endPlayerTurn(): void {
    // 清除卡牌选中状态
    this.clearCardSelection();
    
    // 设置当前回合为敌人回合
    this.currentTurn = 'enemy';
    
    // 更新回合文本
    if (this.turnText) {
      this.turnText.setText('敌人回合');
    }
    
    // 延迟执行敌人行动
    this.time.delayedCall(1000, this.enemyActions, [], this);
  }

  private enemyActions(): void {
    // 实现敌人AI行动
    console.log('敌人行动');
    
    // 延迟结束敌人回合
    this.time.delayedCall(1500, this.endEnemyTurn, [], this);
  }

  private endEnemyTurn(): void {
    // 开始新的玩家回合
    this.startPlayerTurn();
  }

  private getValidMoves(startPos: HexCoord, range: number): HexCoord[] {
    // 实现获取有效移动位置的逻辑
    const result: HexCoord[] = [];
    
    // 简化版：返回周围的格子
    for (let q = -range; q <= range; q++) {
      for (let r = -range; r <= range; r++) {
        for (let s = -range; s <= range; s++) {
          if (q + r + s === 0) {
            const coord = { q: startPos.q + q, r: startPos.r + r, s: startPos.s + s };
            
            // 检查是否在战场内且未被占用
            if (this.isValidHex(coord) && !this.isHexOccupied(coord)) {
              result.push(coord);
            }
          }
        }
      }
    }
    
    return result;
  }

  private isValidHex(coord: HexCoord): boolean {
    // 检查坐标是否在战场内
    return this.findHexCellByCoord(coord) !== null;
  }

  private isHexOccupied(coord: HexCoord): boolean {
    // 检查是否有敌人在此格子
    return this.enemies.some(enemy => 
      enemy.position && 
      enemy.position.q === coord.q && 
      enemy.position.r === coord.r && 
      enemy.position.s === coord.s
    );
  }
}
