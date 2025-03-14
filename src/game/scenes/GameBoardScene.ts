import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Character, Enemy, GridCoord, Card } from '../../types';
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
  private gridTiles: Phaser.GameObjects.Container[] = [];
  private playerSprite: Phaser.GameObjects.Container | null = null;
  private enemySprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private infoPanel: Phaser.GameObjects.Container | null = null;
  private turnText: Phaser.GameObjects.Text | null = null;
  
  // 游戏状态
  private currentTurn: string = 'player'; // 'player' 或 'enemy'
  private validMoves: GridCoord[] = [];
  private tileSize: number = 60;
  private grid: any[][] = [];

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
    this.load.image('grid-tile', 'assets/images/grid-tile.png');
    this.load.image('grid-highlight', 'assets/images/grid-highlight.png');
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
    
    // 计算正方形网格的起始位置
    const startX = this.cameras.main.width / 2 - (5 * this.tileSize) / 2;
    const startY = this.cameras.main.height / 2 - (5 * this.tileSize) / 2;
    
    // 创建正方形网格
    for (let row = 0; row < battlefield.tiles.length; row++) {
      this.grid[row] = [];
      for (let col = 0; col < battlefield.tiles[row].length; col++) {
        const tile = battlefield.tiles[row][col];
        const pixelX = startX + col * this.tileSize;
        const pixelY = startY + row * this.tileSize;
        
        // 创建正方形容器
        const gridContainer = this.add.container(pixelX, pixelY);
        
        // 创建正方形图像或形状
        let gridTile;
        if (this.textures.exists('grid-tile')) {
          gridTile = this.add.image(0, 0, 'grid-tile');
        } else {
          // 如果没有加载到正方形图像，则使用矩形绘制
          gridTile = this.add.rectangle(0, 0, this.tileSize, this.tileSize, 0x0f3460);
          
          // 为矩形添加自定义的setTint和clearTint方法
          gridTile.setTint = function(tint) {
            this.setFillStyle(tint);
            return this;
          };
          
          gridTile.clearTint = function() {
            this.setFillStyle(0x0f3460); // 恢复默认颜色
            return this;
          };
        }
        
        // 添加交互
        gridTile.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.tileSize, this.tileSize), Phaser.Geom.Rectangle.Contains)
          .on('pointerdown', () => this.handleGridClick(tile.coord))
          .on('pointerover', () => {
            if (gridTile.type === 'Rectangle') {
              gridTile.setFillStyle(0x5a4ba6);
            } else {
              gridTile.setTint(0x5a4ba6);
            }
          })
          .on('pointerout', () => {
            if (gridTile.type === 'Rectangle') {
              gridTile.setFillStyle(0x0f3460);
            } else {
              gridTile.clearTint();
            }
          });
        
        // 添加坐标文本（调试用）
        const coordText = this.add.text(0, 0, `${tile.coord.x},${tile.coord.y}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ffffff',
        }).setOrigin(0.5);
        
        // 将元素添加到容器
        gridContainer.add([gridTile, coordText]);
        
        // 保存引用
        this.gridTiles.push(gridContainer);
        this.grid[row][col] = {
          container: gridContainer,
          tile: tile,
          pixelX: pixelX,
          pixelY: pixelY
        };
      }
    }
  }

  private createPlayer(): void {
    if (!this.player) return;
    
    // 设置玩家初始位置
    const startPosition = { x: 0, y: 0 };
    this.player.position = startPosition;
    
    // 找到对应的正方形格子
    const gridCell = this.findGridCellByCoord(startPosition);
    if (gridCell) {
      // 创建玩家精灵
      if (this.textures.exists('player')) {
        const playerSprite = this.add.sprite(0, 0, 'player');
        const playerContainer = this.add.container(gridCell.pixelX, gridCell.pixelY);
        playerContainer.add(playerSprite);
        this.playerSprite = playerContainer;
      } else {
        // 如果没有加载到玩家图像，则使用容器包含圆形和文本
        const playerContainer = this.add.container(gridCell.pixelX, gridCell.pixelY);
        
        // 创建圆形
        const circle = this.add.circle(0, 0, this.tileSize / 2, 0x4a9ae1);
        
        // 添加玩家名称首字母
        const nameText = this.add.text(0, 0, this.player.name.charAt(0), {
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

  private createEnemies(): void {
    // 获取当前楼层的敌人
    this.enemies = getEnemiesByFloor(this.currentFloor);
    
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
      const gridCell = this.findGridCellByCoord(position);
      if (gridCell) {
        // 创建敌人精灵
        let enemySprite;
        if (this.textures.exists('enemy')) {
          enemySprite = this.add.sprite(gridCell.pixelX, gridCell.pixelY, 'enemy');
        } else {
          // 如果没有加载到敌人图像，则使用容器包含圆形和文本
          const enemyContainer = this.add.container(gridCell.pixelX, gridCell.pixelY);
          
          // 创建圆形
          const circle = this.add.circle(0, 0, this.tileSize / 2, 0xe53e3e);
          
          // 添加敌人名称
          const nameText = this.add.text(0, -this.tileSize / 3, enemy.name, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
          }).setOrigin(0.5);
          
          // 添加敌人生命值
          const healthText = this.add.text(0, -this.tileSize / 6, `HP: ${enemy.health}/${enemy.maxHealth}`, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff',
          }).setOrigin(0.5);
          
          // 添加敌人意图
          const intentText = this.add.text(0, this.tileSize / 8, `意图: ${this.getIntentText(enemy.intent)}`, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffff00',
          }).setOrigin(0.5);
          
          // 添加敌人伤害
          const damageText = this.add.text(0, this.tileSize / 3, `伤害: ${enemy.damage}`, {
            fontFamily: 'Arial',
            fontSize: '9px',
            color: '#fff666',
          }).setOrigin(0.5);
          
          // 将圆形和文本添加到容器
          enemyContainer.add([circle, nameText, healthText, intentText, damageText]);
          
          enemySprite = enemyContainer;
        }
        
        // 保存敌人精灵引用
        this.enemySprites.set(enemy.id, enemySprite);
      }
    });
  }

  private createCards(): void {
    // 确保玩家有卡牌
    if (!this.player || !this.player.deck || this.player.deck.length === 0) {
      console.error('玩家卡组为空');
      return;
    }
    
    // 模拟玩家手牌
    this.playerCards = this.player.deck.slice(0, 5) || [];
    
    // 清空之前的卡牌精灵
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    
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
          
        // 为矩形添加自定义的 setTint 和 clearTint 方法
        cardBg.setTint = function(tint) {
          this.setFillStyle(tint);
          return this;
        };
        
        cardBg.clearTint = function() {
          this.setFillStyle(0x333333); // 恢复默认颜色
          return this;
        };
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
      
      // 添加卡牌数值信息
      const valueTexts: Phaser.GameObjects.Text[] = [];
      let yOffset = cardWidth * 0.2; // 初始Y偏移量
      const ySpacing = 16; // Y轴间距
      
      // 添加攻击数值
      if (card.baseDamage || (card.type === 'attack' && card.value)) {
        const damage = card.baseDamage || card.value || 0;
        const attackText = this.add.text(0, yOffset, `攻击: ${damage}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ff6666',
        }).setOrigin(0.5);
        valueTexts.push(attackText);
        yOffset += ySpacing;
      }
      
      // 添加防御数值
      if (card.baseDefense || (card.type === 'defense' && card.value)) {
        const defense = card.baseDefense || card.value || 0;
        const defenseText = this.add.text(0, yOffset, `防御: ${defense}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#66ccff',
        }).setOrigin(0.5);
        valueTexts.push(defenseText);
        yOffset += ySpacing;
      }
      
      // 添加治愈数值
      if (card.type === 'skill' && card.effects.some(e => e.type === 'heal')) {
        const healEffect = card.effects.find(e => e.type === 'heal');
        const healValue = healEffect ? healEffect.value : 0;
        const healText = this.add.text(0, yOffset, `治愈: ${healValue}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#66ff66',
        }).setOrigin(0.5);
        valueTexts.push(healText);
      }
      
      // 将元素添加到容器
      cardContainer.add([cardBg, titleText, typeText, descText, costText]);
      
      // 将数值文本添加到容器
      valueTexts.forEach(text => {
        cardContainer.add(text);
      });
      
      // 添加交互
      cardBg.setInteractive()
        .on('pointerdown', () => this.handleCardClick(card, index))
        .on('pointerover', () => {
          cardContainer.setScale(1.1);
          if (cardBg.type === 'Polygon') {
            cardBg.setFillStyle(0x5a4ba6);
          } else {
            cardBg.setTint(0x5a4ba6);
          }
        })
        .on('pointerout', () => {
          cardContainer.setScale(1);
          if (cardBg.type === 'Polygon') {
            cardBg.setFillStyle(0x333333);
          } else {
            cardBg.clearTint();
          }
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
    this.infoPanel = this.add.container(this.cameras.main.width - 150, 190);
    
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

  private findGridCellByCoord(coord: GridCoord): any {
    // 遍历正方形网格查找对应坐标的格子
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const cell = this.grid[row][col];
        if (
          cell.tile.coord.x === coord.x &&
          cell.tile.coord.y === coord.y
        ) {
          return cell;
        }
      }
    }
    return null;
  }

  private handleGridClick(coord: GridCoord): void {
    console.log(`点击了正方形: ${coord.x},${coord.y}`);
    
    // 如果是玩家回合且选中了卡牌
    if (this.currentTurn === 'player' && this.selectedCard) {
      // 检查是否是有效的移动位置
      const isValidMove = this.validMoves.some(move => 
        move.x === coord.x && move.y === coord.y
      );
      
      console.log(`是否有效移动: ${isValidMove}`);
      
      if (isValidMove) {
        // 检查卡牌类型
        if (this.selectedCard.type === 'movement') {
          // 移动玩家
          this.movePlayer(coord);
          
          // 使用卡牌
          this.playCard(this.selectedCard);
          
          // 清除选中状态
          this.clearCardSelection();
        } else if (this.selectedCard.type === 'attack') {
          // 检查是否点击了敌人
          const clickedEnemy = this.enemies.find(enemy => 
            enemy.position && 
            enemy.position.x === coord.x && 
            enemy.position.y === coord.y
          );
          
          if (clickedEnemy) {
            // 攻击敌人
            this.attackEnemy(clickedEnemy, this.selectedCard);
            this.playCard(this.selectedCard);
            this.clearCardSelection();
          }
        }
      }
    }
  }

  private showValidMoves(): void {
    // 清除之前的有效移动标记
    this.clearValidMoves();
    
    // 计算有效移动位置
    if (this.player && this.selectedCard) {
      // 根据卡牌类型决定操作
      if (this.selectedCard.type === 'movement') {
        // 假设移动范围为2格
        const moveRange = 2;
        this.validMoves = this.getValidMoves(this.player.position, moveRange);
        
        // 高亮显示有效移动位置
        this.validMoves.forEach(move => {
          const gridCell = this.findGridCellByCoord(move);
          if (gridCell) {
            const gridTile = gridCell.container.getAt(0);
            // 检查是否为多边形对象
            if (gridTile.type === 'Rectangle') {
              gridTile.setFillStyle(0x00ff00);
            } else {
              gridTile.setTint(0x00ff00);
            }
          }
        });
      } else if (this.selectedCard.type === 'attack') {
        // 显示可攻击的敌人
        this.enemies.forEach(enemy => {
          if (enemy.position && this.player && this.player.position) {
            // 检查是否在攻击范围内（这里简化为3格内）
            const distance = this.getGridDistance(this.player.position, enemy.position);
            if (distance <= 3) {
              const gridCell = this.findGridCellByCoord(enemy.position);
              if (gridCell) {
                const gridTile = gridCell.container.getAt(0);
                // 检查是否为多边形对象
                if (gridTile.type === 'Rectangle') {
                  gridTile.setFillStyle(0xff0000);
                } else {
                  gridTile.setTint(0xff0000);
                }
                this.validMoves.push(enemy.position);
              }
            }
          }
        });
      }
    }
  }

  private movePlayer(coord: GridCoord): void {
    if (!this.player || !this.playerSprite) return;
    
    console.log(`移动玩家到: ${coord.x},${coord.y}`);
    
    // 更新玩家位置
    this.player.position = coord;
    
    // 找到目标正方形格子
    const gridCell = this.findGridCellByCoord(coord);
    if (gridCell) {
      // 创建移动动画
      this.tweens.add({
        targets: this.playerSprite,
        x: gridCell.pixelX,
        y: gridCell.pixelY,
        duration: 500,
        ease: 'Power2'
      });
    }
  }

  private playCard(card: Card): void {
    if (!this.player) return;
    
    // 实现卡牌效果
    console.log(`使用卡牌: ${card.name}`);
    
    // 消耗能量
    this.player.energy = Math.max(0, this.player.energy - card.cost);
    
    // 更新信息面板
    this.updateInfoPanel();
    
    // 从手牌中移除卡牌
    const cardIndex = this.playerCards.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      this.playerCards.splice(cardIndex, 1);
      
      // 移除卡牌精灵
      if (this.cardSprites[cardIndex]) {
        this.cardSprites[cardIndex].destroy();
        this.cardSprites.splice(cardIndex, 1);
      }
      
      // 重新排列剩余卡牌
      this.rearrangeCards();
    }
  }

  private rearrangeCards(): void {
    // 重新排列剩余卡牌
    const cardWidth = 80;
    const cardSpacing = 20;
    const totalWidth = (cardWidth + cardSpacing) * this.playerCards.length - cardSpacing;
    const startX = (this.cameras.main.width - totalWidth) / 2;
    const cardAreaY = this.cameras.main.height - 100;
    
    this.cardSprites.forEach((sprite, index) => {
      const x = startX + index * (cardWidth + cardSpacing) + cardWidth / 2;
      this.tweens.add({
        targets: sprite,
        x: x,
        duration: 300,
        ease: 'Power2'
      });
    });
  }

  private updateInfoPanel(): void {
    if (!this.infoPanel || !this.player) return;
    
    // 更新玩家信息
    const healthInfo = this.infoPanel.getAt(2) as Phaser.GameObjects.Text;
    const energyInfo = this.infoPanel.getAt(3) as Phaser.GameObjects.Text;
    
    if (healthInfo && energyInfo) {
      healthInfo.setText(`生命: ${this.player.health}/${this.player.maxHealth}`);
      energyInfo.setText(`能量: ${this.player.energy}/${this.player.maxEnergy}`);
    }
  }

  private enemyActions(): void {
    // 实现敌人AI行动
    console.log('敌人行动');
    
    // 依次执行每个敌人的行动
    this.enemies.forEach((enemy, index) => {
      // 延迟执行，让敌人依次行动
      this.time.delayedCall(index * 800, () => {
        this.performEnemyAction(enemy);
      }, [], this);
    });
    
    // 延迟结束敌人回合
    this.time.delayedCall(this.enemies.length * 800 + 500, this.endEnemyTurn, [], this);
  }

  private performEnemyAction(enemy: Enemy): void {
    if (!this.player || !enemy.position) return;
    
    // 计算与玩家的距离
    const distance = this.getGridDistance(enemy.position, this.player.position);
    
    // 获取敌人精灵
    const enemySprite = this.enemySprites.get(enemy.id);
    if (!enemySprite) return;
    
    if (distance <= 1) {
      // 如果在攻击范围内，执行攻击
      console.log(`敌人 ${enemy.name} 攻击玩家`);
      
      // 创建攻击动画
      const originalX = enemySprite.x;
      const originalY = enemySprite.y;
      
      // 向玩家方向移动一点再返回，模拟攻击动作
      const playerCell = this.findGridCellByCoord(this.player.position);
      if (playerCell) {
        const directionX = playerCell.pixelX - originalX;
        const directionY = playerCell.pixelY - originalY;
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedX = directionX / length;
        const normalizedY = directionY / length;
        
        this.tweens.add({
          targets: enemySprite,
          x: originalX + normalizedX * 20,
          y: originalY + normalizedY * 20,
          duration: 150,
          yoyo: true,
          onComplete: () => {
            // 对玩家造成伤害
            this.damagePlayer(enemy.damage || 10);
          }
        });
      }
    } else {
      // 如果不在攻击范围内，向玩家移动
      console.log(`敌人 ${enemy.name} 向玩家移动`);
      
      // 获取向玩家方向移动的有效位置
      const movePositions = this.getEnemyMovePositions(enemy.position, this.player.position);
      
      if (movePositions.length > 0) {
        // 选择第一个位置（最接近玩家的位置）
        const targetPos = movePositions[0];
        
        // 先清除原位置的高亮显示
        const oldGridCell = this.findGridCellByCoord(enemy.position);
        if (oldGridCell) {
          const oldGridTile = oldGridCell.container.getAt(0);
          if (oldGridTile.type === 'Rectangle') {
            oldGridTile.setFillStyle(0x0f3460);
          } else {
            oldGridTile.clearTint();
          }
        }
        
        // 更新敌人位置
        enemy.position = targetPos;
        
        // 移动敌人精灵
        const gridCell = this.findGridCellByCoord(targetPos);
        if (gridCell) {
          this.tweens.add({
            targets: enemySprite,
            x: gridCell.pixelX,
            y: gridCell.pixelY,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              // 更新敌人信息显示
              this.updateEnemyInfo(enemy);
            }
          });
          
          // 设置新位置的高亮显示
          const gridTile = gridCell.container.getAt(0);
          if (gridTile.type === 'Rectangle') {
            gridTile.setFillStyle(0xff0000);
          } else {
            gridTile.setTint(0xff0000);
          }
        }
      }
    }
  }

  private updateEnemyInfo(enemy: Enemy): void {
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

  private getEnemyMovePositions(enemyPos: GridCoord, playerPos: GridCoord): GridCoord[] {
    // 获取敌人可移动的位置，优先选择接近玩家的位置
    const moveRange = 1; // 敌人每回合移动1格
    const possibleMoves = this.getValidMoves(enemyPos, moveRange);
    
    // 按照到玩家的距离排序
    return possibleMoves.sort((a, b) => {
      const distA = this.getGridDistance(a, playerPos);
      const distB = this.getGridDistance(b, playerPos);
      return distA - distB;
    });
  }

  private getGridDistance(a: GridCoord, b: GridCoord): number {
    // 计算两个正方形坐标之间的距离
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private attackEnemy(enemy: Enemy, card: Card): void {
    console.log(`攻击敌人 ${enemy.name} 使用卡牌 ${card.name}`);
    
    // 获取敌人精灵
    const enemySprite = this.enemySprites.get(enemy.id);
    if (!enemySprite) return;
    
    // 创建攻击效果
    const attackEffect = this.add.circle(enemySprite.x, enemySprite.y, 30, 0xff0000, 0.7);
    this.tweens.add({
      targets: attackEffect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => attackEffect.destroy()
    });
    
    // 计算伤害
    const damage = card.value || 10;
    
    // 对敌人造成伤害
    enemy.health = Math.max(0, enemy.health - damage);
    
    // 更新敌人信息显示
    this.updateEnemyInfo(enemy);
    
    // 显示伤害数字
    const damageText = this.add.text(enemySprite.x, enemySprite.y - 20, `-${damage}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff0000'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: damageText.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
    
    // 检查敌人是否死亡
    if (enemy.health <= 0) {
      // 移除敌人
      this.removeEnemy(enemy);
    }
  }

  private removeEnemy(enemy: Enemy): void {
    // 获取敌人精灵
    const enemySprite = this.enemySprites.get(enemy.id);
    if (!enemySprite) return;
    
    // 创建死亡动画
    this.tweens.add({
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
        
        // 检查是否所有敌人都被击败
        if (this.enemies.length === 0) {
          // 延迟一段时间后进入下一层
          this.time.delayedCall(1000, () => {
            this.goToNextFloor();
          }, [], this);
        }
      }
    });
  }

  private damagePlayer(damage: number): void {
    if (!this.player) return;
    
    // 对玩家造成伤害
    this.player.health = Math.max(0, this.player.health - damage);
    
    // 更新信息面板
    this.updateInfoPanel();
    
    // 显示伤害数字
    if (this.playerSprite) {
      const damageText = this.add.text(this.playerSprite.x, this.playerSprite.y - 20, `-${damage}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ff0000'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: damageText,
        y: damageText.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      });
    }
    
    // 检查玩家是否死亡
    if (this.player.health <= 0) {
      // 游戏结束
      this.gameOver();
    }
  }

  private gameOver(): void {
    // 显示游戏结束界面
    const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0);
    
    const gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, '游戏结束', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const restartButton = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50);
    
    const buttonBg = this.add.rectangle(0, 0, 200, 50, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MainMenuScene'))
      .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
      .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));
    
    const buttonText = this.add.text(0, 0, '返回主菜单', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    restartButton.add([buttonBg, buttonText]);
  }

  private goToNextFloor(): void {
    // 增加楼层
    this.currentFloor++;
    
    // 恢复玩家能量
    if (this.player) {
      this.player.energy = this.player.maxEnergy;
    }
    
    // 清除当前战场
    this.clearBattlefield();
    
    // 创建新的战场
    this.createBattlefield();
    this.createPlayer();
    this.createEnemies();
    this.createCards();
    this.createUI();
    
    // 开始新的回合
    this.startPlayerTurn();
  }

  private clearBattlefield(): void {
    // 清除正方形网格
    this.gridTiles.forEach(tile => tile.destroy());
    this.gridTiles = [];
    this.grid = [];
    
    // 清除玩家精灵
    if (this.playerSprite) {
      this.playerSprite.destroy();
      this.playerSprite = null;
    }
    
    // 清除敌人精灵
    this.enemySprites.forEach(sprite => sprite.destroy());
    this.enemySprites.clear();
    
    // 清除卡牌精灵
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    
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
  }

  private startPlayerTurn(): void {
    // 设置当前回合为玩家回合
    this.currentTurn = 'player';
    
    // 更新回合文本
    if (this.turnText) {
      this.turnText.setText('玩家回合');
    }
    
    // 恢复玩家能量
    if (this.player) {
      this.player.energy = this.player.maxEnergy;
      this.updateInfoPanel();
    }
    
    // 抽取卡牌
    this.drawCards(1);
  }

  private drawCards(count: number): void {
    // 如果玩家卡组为空，则不抽牌
    if (!this.player || !this.player.deck || this.player.deck.length === 0) return;
    
    // 抽取指定数量的卡牌
    for (let i = 0; i < count; i++) {
      if (this.playerCards.length < 5 && this.player.deck.length > 0) {
        // 从卡组中随机抽取一张卡牌
        const randomIndex = Math.floor(Math.random() * this.player.deck.length);
        const card = this.player.deck[randomIndex];
        
        // 添加到手牌
        this.playerCards.push(card);
      }
    }
    
    // 重新创建卡牌显示
    this.createCards();
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
    } else if (card.type === 'attack') {
      this.showValidMoves();
    }
  }

  private clearValidMoves(): void {
    // 清除有效移动位置的高亮显示
    this.validMoves.forEach(move => {
      const gridCell = this.findGridCellByCoord(move);
      if (gridCell) {
        const gridTile = gridCell.container.getAt(0);
        // 检查是否为多边形对象
        if (gridTile.type === 'Rectangle') {
          gridTile.setFillStyle(0x0f3460);
        } else {
          gridTile.clearTint();
        }
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

  private endEnemyTurn(): void {
    // 开始新的玩家回合
    this.startPlayerTurn();
  }

  private getValidMoves(startPos: GridCoord, range: number): GridCoord[] {
    // 实现获取有效移动位置的逻辑
    const result: GridCoord[] = [];
    
    // 简化版：返回周围的格子
    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        const coord = { x: startPos.x + x, y: startPos.y + y };
        
        // 检查是否在战场内且未被占用
        if (this.isValidGrid(coord) && !this.isGridOccupied(coord)) {
          result.push(coord);
        }
      }
    }
    
    return result;
  }

  private isValidGrid(coord: GridCoord): boolean {
    // 检查坐标是否在战场内
    return this.findGridCellByCoord(coord) !== null;
  }

  private isGridOccupied(coord: GridCoord): boolean {
    // 检查是否有敌人在此格子
    return this.enemies.some(enemy => 
      enemy.position && 
      enemy.position.x === coord.x && 
      enemy.position.y === coord.y
    );
  }

  private getIntentText(intent: string): string {
    switch (intent) {
      case 'attack':
        return '攻击';
      case 'defend':
        return '防御';
      case 'buff':
        return '增益';
      case 'debuff':
        return '减益';
      case 'special':
        return '特殊';
      default:
        return intent;
    }
  }
}
