import Phaser from 'phaser';
import { Card, Character, CardType, CardEffectType } from '@/types';

export class CardManager {
  private scene: Phaser.Scene;
  private playerCards: Card[] = []; // 玩家手牌
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private selectedCard: Card | null = null;
  private onCardSelected: ((card: Card) => void) | null = null;
  private drawPile: Card[] = []; // 抽牌堆
  private discardPile: Card[] = []; // 弃牌堆

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setOnCardSelected(callback: (card: Card) => void): void {
    this.onCardSelected = callback;
  }

  createCards(player: Character): void {
    // 确保玩家有卡牌
    if (!player || !player.deck || player.deck.length === 0) {
      console.error('玩家卡组为空');
      return;
    }
    
    // 初始化抽牌堆和弃牌堆
    // 每次调用createCards时都重新初始化卡牌系统，确保不会累积卡牌
    this.playerCards = [];
    this.drawPile = [...player.deck];
    this.shuffleDrawPile();
    
    // 初始抽5张牌作为起始手牌
    for (let i = 0; i < 5; i++) {
      if (this.drawPile.length > 0) {
        this.playerCards.push(this.drawPile.pop()!);
      }
    }
    
    // 清空之前的卡牌精灵
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    
    // 创建卡牌区域
    const cardAreaY = this.scene.cameras.main.height - 100;
    const cardWidth = 80;
    const cardSpacing = 20;
    const totalWidth = (cardWidth + cardSpacing) * this.playerCards.length - cardSpacing;
    const startX = (this.scene.cameras.main.width - totalWidth) / 2;
    
    // 创建卡牌精灵
    this.playerCards.forEach((card, index) => {
      const x = startX + index * (cardWidth + cardSpacing) + cardWidth / 2;
      const y = cardAreaY;
      
      // 创建卡牌容器
      const cardContainer = this.scene.add.container(x, y);
      
      // 定义卡牌各部分的位置
      const cardHeight = cardWidth * 1.4;
      const headerHeight = cardHeight * 0.2; // 顶部区域（标题和类型）
      const descHeight = cardHeight * 0.3;   // 描述区域
      const valueHeight = cardHeight * 0.3;  // 数值区域
      
      // 创建卡牌背景
      let cardBackground;
      if (this.scene.textures.exists('card-frame')) {
        cardBackground = this.scene.add.image(0, 0, 'card-frame');
      } else {
        // 如果没有加载到卡牌图像，则使用矩形替代
        cardBackground = this.scene.add.rectangle(0, 0, cardWidth, cardHeight, 0x333333, 1)
          .setStrokeStyle(2, 0xffffff);
          
        // 为矩形添加自定义的 setTint 和 clearTint 方法
        (cardBackground as any).setTint = function(tint) {
          this.setFillStyle(tint);
          return this;
        };
        
        (cardBackground as any).clearTint = function() {
          this.setFillStyle(0x333333); // 恢复默认颜色
          return this;
        };
      }
      
      // 添加卡牌消耗（左上角）
      const costText = this.scene.add.text(-cardWidth * 0.4, -cardHeight * 0.5 + 15, card.cost.toString(), {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffde00',
      }).setOrigin(0.5);
      
      // 添加卡牌标题（顶部中央）
      const titleText = this.scene.add.text(0, -cardHeight * 0.5 + 15, card.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      // 添加卡牌类型（标题下方）
      const typeText = this.scene.add.text(0, -cardHeight * 0.5 + 30, card.type, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      
      // 添加卡牌描述（中央区域）
      // 描述文本区域位于卡牌中部
      const descY = -cardHeight * 0.05; // 描述文本Y位置，位于卡牌上半部分
      const descriptionStyle = {
        fontFamily: 'Arial',
        fontSize: '8px',
        color: '#ffffff',
        align: 'center',
        fixedWidth: cardWidth - 15,
        wordWrap: { width: cardWidth - 15, useAdvancedWrap: true }
      };
      
      const descText = this.scene.add.text(0, descY, card.description, descriptionStyle).setOrigin(0.5);
      
      // 添加卡牌数值信息（底部区域）
      const valueTexts: Phaser.GameObjects.Text[] = [];
      const valueY = cardHeight * 0.2; // 数值信息起始Y位置，位于卡牌下半部分
      let yOffset = valueY;
      const ySpacing = 16; // Y轴间距
      
      // 添加攻击数值
      if (card.baseDamage || card.type === CardType.ATTACK) {
        const damage = card.baseDamage || 0;
        const attackText = this.scene.add.text(0, yOffset, `攻击: ${damage}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ff6666',
        }).setOrigin(0.5);
        valueTexts.push(attackText);
        yOffset += ySpacing;
      }
      
      // 添加防御数值
      if (card.baseDefense || card.type === CardType.DEFENSE) {
        const defense = card.baseDefense || 0;
        const defenseText = this.scene.add.text(0, yOffset, `防御: ${defense}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#66ccff',
        }).setOrigin(0.5);
        valueTexts.push(defenseText);
        yOffset += ySpacing;
      }
      
      // 添加治愈数值
      if (card.type === CardType.SKILL && card.effects.some(e => e.type === CardEffectType.HEAL)) {
        const healEffect = card.effects.find(e => e.type === CardEffectType.HEAL);
        const healValue = healEffect ? healEffect.value : 0;
        const healText = this.scene.add.text(0, yOffset, `治愈: ${healValue}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#66ff66',
        }).setOrigin(0.5);
        valueTexts.push(healText);
      }
      
      // 将元素添加到容器
      cardContainer.add([cardBackground, costText, titleText, typeText, descText]);
      
      // 将数值文本添加到容器
      valueTexts.forEach(text => {
        cardContainer.add(text);
      });
      
      // 添加交互
      cardBackground.setInteractive()
        .on('pointerdown', () => this.handleCardClick(card, index))
        .on('pointerover', () => {
          cardContainer.setScale(1.1);
          if (cardBackground instanceof Phaser.GameObjects.Rectangle) {
            (cardBackground as Phaser.GameObjects.Rectangle).setFillStyle(0x5a4ba6);
          } else if (cardBackground instanceof Phaser.GameObjects.Image) {
            cardBackground.setTint(0x5a4ba6);
          }
        })
        .on('pointerout', () => {
          if (!this.selectedCard || this.selectedCard.id !== card.id) {
            if (cardBackground instanceof Phaser.GameObjects.Rectangle) {
              (cardBackground as Phaser.GameObjects.Rectangle).setFillStyle(0x333333);
            } else if (cardBackground instanceof Phaser.GameObjects.Image) {
              cardBackground.clearTint();
            }
          }
          cardContainer.setScale(1);
        });
      
      // 保存卡牌容器引用
      this.cardSprites.push(cardContainer);
    });
    
    // 显示抽牌堆和弃牌堆数量
    this.updateDeckCounters();
  }

  handleCardClick(card: Card, index: number): void {
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
    
    // 触发卡牌选中回调
    if (this.onCardSelected) {
      this.onCardSelected(card);
    }
  }

  playCard(card: Card, player: Character): void {
    if (!player) return;
    
    // 实现卡牌效果
    console.log(`使用卡牌: ${card.name}`);
    
    // 消耗能量
    player.energy = Math.max(0, player.energy - card.cost);
    
    // 从手牌中移除卡牌
    const cardIndex = this.playerCards.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      const playedCard = this.playerCards.splice(cardIndex, 1)[0];
      
      // 将使用过的卡牌放入弃牌堆
      this.discardPile.push(playedCard);
      
      // 移除卡牌精灵
      if (this.cardSprites[cardIndex]) {
        this.cardSprites[cardIndex].destroy();
        this.cardSprites.splice(cardIndex, 1);
      }
      
      // 重新排列剩余卡牌
      this.rearrangeCards();
      
      // 更新抽牌堆和弃牌堆计数器
      this.updateDeckCounters();
    }
  }

  rearrangeCards(): void {
    // 重新排列剩余卡牌
    const cardWidth = 80;
    const cardSpacing = 20;
    const totalWidth = (cardWidth + cardSpacing) * this.playerCards.length - cardSpacing;
    const startX = (this.scene.cameras.main.width - totalWidth) / 2;
    const cardAreaY = this.scene.cameras.main.height - 100;
    
    this.cardSprites.forEach((sprite, index) => {
      const x = startX + index * (cardWidth + cardSpacing) + cardWidth / 2;
      this.scene.tweens.add({
        targets: sprite,
        x: x,
        duration: 300,
        ease: 'Power2'
      });
    });
  }

  clearCardSelection(): void {
    // 清除卡牌选中状态
    this.selectedCard = null;
    
    // 恢复卡牌显示
    this.cardSprites.forEach(sprite => {
      sprite.setScale(1);
      sprite.setAlpha(1);
    });
  }

  drawCards(player: Character, count: number): void {
    // 如果玩家卡组为空，则不抽牌
    if (!player) return;
    
    // 抽取指定数量的卡牌
    for (let i = 0; i < count; i++) {
      // 检查手牌是否已满
      if (this.playerCards.length >= 10) {
        console.log('手牌已满，无法抽取更多卡牌');
        break;
      }
      
      // 检查抽牌堆是否为空
      if (this.drawPile.length === 0) {
        // 如果弃牌堆也为空，则无法抽牌
        if (this.discardPile.length === 0) {
          console.log('抽牌堆和弃牌堆均为空，无法抽取更多卡牌');
          break;
        }
        
        // 将弃牌堆洗牌后放入抽牌堆
        console.log('抽牌堆已空，重新洗牌');
        this.drawPile = [...this.discardPile];
        this.discardPile = [];
        this.shuffleDrawPile();
      }
      
      // 从抽牌堆顶部抽一张牌
      const card = this.drawPile.pop();
      if (card) {
        // 添加到手牌
        this.playerCards.push(card);
      }
    }
    
    // 重新创建卡牌显示
    this.createCards(player);
  }

  clearCards(): void {
    // 清除卡牌精灵
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    this.playerCards = [];
    this.drawPile = [];
    this.discardPile = [];
    this.selectedCard = null;
    // 不要清除回调函数，否则会导致卡牌选择功能失效
    // this.onCardSelected = null;
    
    // 清除抽牌堆和弃牌堆计数器
    this.clearDeckCounters();
  }
  
  // 洗牌函数
  private shuffleDrawPile(): void {
    // Fisher-Yates 洗牌算法
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }
  
  // 创建抽牌堆和弃牌堆计数器
  private updateDeckCounters(): void {
    // 清除现有计数器
    this.clearDeckCounters();
    
    // 创建抽牌堆计数器
    const drawPileCounter = this.scene.add.text(
      this.scene.cameras.main.width - 50, 
      this.scene.cameras.main.height - 50,
      `抽牌堆: ${this.drawPile.length}`,
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 5, y: 3 }
      }
    ).setOrigin(1, 1).setName('drawPileCounter');
    
    // 创建弃牌堆计数器
    const discardPileCounter = this.scene.add.text(
      50, 
      this.scene.cameras.main.height - 50,
      `弃牌堆: ${this.discardPile.length}`,
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 5, y: 3 }
      }
    ).setOrigin(0, 1).setName('discardPileCounter');
  }
  
  // 清除抽牌堆和弃牌堆计数器
  private clearDeckCounters(): void {
    const drawPileCounter = this.scene.children.getByName('drawPileCounter');
    if (drawPileCounter) {
      drawPileCounter.destroy();
    }
    
    const discardPileCounter = this.scene.children.getByName('discardPileCounter');
    if (discardPileCounter) {
      discardPileCounter.destroy();
    }
  }
  
  // 弃置所有手牌
  discardHand(): void {
    // 将所有手牌移至弃牌堆
    this.discardPile.push(...this.playerCards);
    this.playerCards = [];
    
    // 清除卡牌精灵
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    
    // 更新计数器
    this.updateDeckCounters();
  }
  
  // 获取抽牌堆
  getDrawPile(): Card[] {
    return this.drawPile;
  }
  
  // 获取弃牌堆
  getDiscardPile(): Card[] {
    return this.discardPile;
  }

  getSelectedCard(): Card | null {
    return this.selectedCard;
  }

  getPlayerCards(): Card[] {
    return this.playerCards;
  }
}
