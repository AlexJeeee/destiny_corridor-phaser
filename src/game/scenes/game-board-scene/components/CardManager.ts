import Phaser from 'phaser';
import { Card, Character } from '@/types';

export class CardManager {
  private scene: Phaser.Scene;
  private playerCards: Card[] = [];
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private selectedCard: Card | null = null;
  private onCardSelected: ((card: Card) => void) | null = null;

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
    
    // 模拟玩家手牌
    this.playerCards = player.deck.slice(0, 5) || [];
    
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
        cardBackground.setTint = function(tint) {
          this.setFillStyle(tint);
          return this;
        };
        
        cardBackground.clearTint = function() {
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
      if (card.baseDamage || (card.type === 'attack' && card.value)) {
        const damage = card.baseDamage || card.value || 0;
        const attackText = this.scene.add.text(0, yOffset, `攻击: ${damage}`, {
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
        const defenseText = this.scene.add.text(0, yOffset, `防御: ${defense}`, {
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
              (cardBackground as Phaser.GameObjects.Rectangle).setFillStyle(0x4a3b96);
            } else if (cardBackground instanceof Phaser.GameObjects.Image) {
              cardBackground.clearTint();
            }
          }
          cardContainer.setScale(1);
        });
      
      // 保存卡牌容器引用
      this.cardSprites.push(cardContainer);
    });
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
    if (!player || !player.deck || player.deck.length === 0) return;
    
    // 抽取指定数量的卡牌
    for (let i = 0; i < count; i++) {
      if (this.playerCards.length < 5 && player.deck.length > 0) {
        // 从卡组中随机抽取一张卡牌
        const randomIndex = Math.floor(Math.random() * player.deck.length);
        const card = player.deck[randomIndex];
        
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
    this.selectedCard = null;
  }

  getSelectedCard(): Card | null {
    return this.selectedCard;
  }

  getPlayerCards(): Card[] {
    return this.playerCards;
  }
}
