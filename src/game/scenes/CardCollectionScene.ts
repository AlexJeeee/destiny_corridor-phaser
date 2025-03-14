import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Card, CardPosition, CardType, ElementType } from '../../types';
import { initialDeck, rareCards } from '../../data/cards';

export class CardCollectionScene extends BaseScene {
  private cards: Card[] = [];
  private cardContainers: Phaser.GameObjects.Container[] = [];
  private currentPage: number = 0;
  private cardsPerPage: number = 8;
  private selectedCard: Card | null = null;
  private cardDetailPanel: Phaser.GameObjects.Container | null = null;
  
  constructor() {
    super('CardCollectionScene');
  }
  
  preload(): void {
    // 加载卡牌资源
    this.load.image('card-collection-bg', 'assets/images/card-collection-bg.png');
    this.load.image('card-back', 'assets/images/card-back.png');
    this.load.image('card-frame', 'assets/images/card-frame.png');
    this.load.image('element-fire', 'assets/images/element-fire.png');
    this.load.image('element-water', 'assets/images/element-water.png');
    this.load.image('element-earth', 'assets/images/element-earth.png');
    this.load.image('element-air', 'assets/images/element-air.png');
    this.load.image('element-light', 'assets/images/element-light.png');
    this.load.image('element-dark', 'assets/images/element-dark.png');
    this.load.image('card-detail-panel', 'assets/images/card-detail-panel.png');
    this.load.image('button-prev', 'assets/images/button-prev.png');
    this.load.image('button-next', 'assets/images/button-next.png');
    
    // 加载卡牌图片
    const allCards = [...initialDeck, ...rareCards];
    allCards.forEach(card => {
      if (card.imageUrl) {
        const imageKey = `card-${card.id}`;
        this.load.image(imageKey, card.imageUrl);
      }
    });
  }
  
  create(): void {
    super.create();
    
    // 合并所有卡牌
    this.cards = [...initialDeck, ...rareCards];
    
    // 添加背景
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'card-collection-bg');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    
    // 如果没有加载到背景图片，则使用纯色背景
    if (!this.textures.exists('card-collection-bg')) {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e)
        .setOrigin(0)
        .setScrollFactor(0);
    }
    
    // 添加标题
    this.add.text(this.cameras.main.width / 2, 50, '卡牌收藏', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // 添加返回按钮
    this.createButton(100, 50, '返回', () => {
      this.transitionTo('MainMenuScene');
    });
    
    // 添加筛选按钮
    this.createButton(this.cameras.main.width - 100, 50, '筛选', () => {
      this.showFilterOptions();
    });
    
    // 添加页面导航按钮
    this.createPageNavigation();
    
    // 显示当前页的卡牌
    this.showCurrentPageCards();
  }
  
  private createButton(x: number, y: number, text: string, callback: () => void): void {
    // 创建按钮背景
    const buttonBg = this.add.rectangle(x, y, 120, 40, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', callback)
      .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
      .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));
    
    // 添加按钮文本
    this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
  
  private createPageNavigation(): void {
    const totalPages = Math.ceil(this.cards.length / this.cardsPerPage);
    
    // 添加上一页按钮
    const prevButton = this.add.image(this.cameras.main.width / 2 - 100, this.cameras.main.height - 50, 'button-prev')
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.showCurrentPageCards();
          this.updatePageText();
        }
      });
    
    // 如果没有加载到按钮图片，则使用文本替代
    if (!this.textures.exists('button-prev')) {
      this.add.text(this.cameras.main.width / 2 - 100, this.cameras.main.height - 50, '< 上一页', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
          if (this.currentPage > 0) {
            this.currentPage--;
            this.showCurrentPageCards();
            this.updatePageText();
          }
        });
    }
    
    // 添加下一页按钮
    const nextButton = this.add.image(this.cameras.main.width / 2 + 100, this.cameras.main.height - 50, 'button-next')
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage < totalPages - 1) {
          this.currentPage++;
          this.showCurrentPageCards();
          this.updatePageText();
        }
      });
    
    // 如果没有加载到按钮图片，则使用文本替代
    if (!this.textures.exists('button-next')) {
      this.add.text(this.cameras.main.width / 2 + 100, this.cameras.main.height - 50, '下一页 >', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
          if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.showCurrentPageCards();
            this.updatePageText();
          }
        });
    }
    
    // 添加页码文本
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, `第 ${this.currentPage + 1} 页 / 共 ${totalPages} 页`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5)
      .setName('pageText');
  }
  
  private updatePageText(): void {
    const totalPages = Math.ceil(this.cards.length / this.cardsPerPage);
    const pageText = this.children.getByName('pageText') as Phaser.GameObjects.Text;
    if (pageText) {
      pageText.setText(`第 ${this.currentPage + 1} 页 / 共 ${totalPages} 页`);
    }
  }
  
  private showCurrentPageCards(): void {
    // 清除现有卡牌显示
    this.cardContainers.forEach(container => container.destroy());
    this.cardContainers = [];
    
    // 计算当前页的卡牌
    const startIndex = this.currentPage * this.cardsPerPage;
    const endIndex = Math.min(startIndex + this.cardsPerPage, this.cards.length);
    const currentPageCards = this.cards.slice(startIndex, endIndex);
    
    // 计算卡牌布局
    const cardWidth = 150;
    const cardHeight = 200;
    const cardsPerRow = 4;
    const startX = (this.cameras.main.width - (cardsPerRow * cardWidth)) / 2 + cardWidth / 2;
    const startY = 150;
    const rowHeight = cardHeight + 30;
    
    // 显示当前页的卡牌
    currentPageCards.forEach((card, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = startX + col * cardWidth;
      const y = startY + row * rowHeight;
      
      const cardContainer = this.createCardDisplay(x, y, card);
      this.cardContainers.push(cardContainer);
    });
  }
  
  private createCardDisplay(x: number, y: number, card: Card): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // 添加卡牌背景
    const cardBg = this.add.image(0, 0, 'card-back')
      .setDisplaySize(120, 160);
    container.add(cardBg);
    
    // 添加卡牌图片
    const imageKey = `card-${card.id}`;
    if (this.textures.exists(imageKey)) {
      const cardImage = this.add.image(0, -20, imageKey)
        .setDisplaySize(100, 100);
      container.add(cardImage);
    }
    
    // 添加卡牌边框
    const cardFrame = this.add.image(0, 0, 'card-frame')
      .setDisplaySize(120, 160);
    container.add(cardFrame);
    
    // 添加卡牌名称
    const nameText = this.add.text(0, -60, card.name, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    container.add(nameText);
    
    // 添加卡牌费用
    const costCircle = this.add.circle(-50, -60, 15, 0x000000, 0.7);
    container.add(costCircle);
    
    const costText = this.add.text(-50, -60, card.cost.toString(), {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(costText);
    
    // 添加卡牌元素图标
    const elementIcon = this.getElementIcon(card.element);
    if (elementIcon) {
      elementIcon.setPosition(50, -60).setDisplaySize(20, 20);
      container.add(elementIcon);
    }
    
    // 添加卡牌描述
    const descText = this.add.text(0, 40, this.truncateText(card.description, 15), {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 100 }
    }).setOrigin(0.5);
    container.add(descText);
    
    // 添加卡牌稀有度
    for (let i = 0; i < card.rarity; i++) {
      const star = this.add.star(
        -40 + i * 20,
        70,
        5,
        5,
        10,
        0xffde00
      );
      container.add(star);
    }
    
    // 添加交互
    container.setInteractive(new Phaser.Geom.Rectangle(-60, -80, 120, 160), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => {
        this.showCardDetails(card);
      })
      .on('pointerover', () => {
        container.setScale(1.1);
      })
      .on('pointerout', () => {
        container.setScale(1);
      });
    
    return container;
  }
  
  private getElementIcon(element: ElementType): Phaser.GameObjects.Image | null {
    let iconKey = '';
    
    switch (element) {
      case ElementType.FIRE:
        iconKey = 'element-fire';
        break;
      case ElementType.WATER:
        iconKey = 'element-water';
        break;
      case ElementType.EARTH:
        iconKey = 'element-earth';
        break;
      case ElementType.AIR:
        iconKey = 'element-air';
        break;
      case ElementType.LIGHT:
        iconKey = 'element-light';
        break;
      case ElementType.DARK:
        iconKey = 'element-dark';
        break;
      default:
        return null;
    }
    
    if (this.textures.exists(iconKey)) {
      return this.add.image(0, 0, iconKey);
    }
    
    // 如果没有加载到图标，则使用圆形替代
    const circle = this.add.circle(0, 0, 10, this.getElementColor(element));
    return circle as unknown as Phaser.GameObjects.Image;
  }
  
  private getElementColor(element: ElementType): number {
    switch (element) {
      case ElementType.FIRE:
        return 0xff4500;
      case ElementType.WATER:
        return 0x1e90ff;
      case ElementType.EARTH:
        return 0x8b4513;
      case ElementType.AIR:
        return 0xadd8e6;
      case ElementType.LIGHT:
        return 0xffff00;
      case ElementType.DARK:
        return 0x800080;
      default:
        return 0xffffff;
    }
  }
  
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
  
  private showCardDetails(card: Card): void {
    // 清除现有的详情面板
    if (this.cardDetailPanel) {
      this.cardDetailPanel.destroy();
    }
    
    this.selectedCard = card;
    
    // 创建详情面板
    this.cardDetailPanel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 添加背景遮罩
    const bgMask = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    this.cardDetailPanel.add(bgMask);
    
    // 添加详情面板背景
    const panelBg = this.add.image(0, 0, 'card-detail-panel')
      .setDisplaySize(600, 400);
    this.cardDetailPanel.add(panelBg);
    
    // 如果没有加载到面板图片，则使用矩形替代
    if (!this.textures.exists('card-detail-panel')) {
      const panel = this.add.rectangle(0, 0, 600, 400, 0x2a2a4a, 1);
      this.cardDetailPanel.add(panel);
    }
    
    // 添加卡牌大图
    const imageKey = `card-${card.id}`;
    if (this.textures.exists(imageKey)) {
      const cardImage = this.add.image(-200, 0, imageKey)
        .setDisplaySize(200, 200);
      this.cardDetailPanel.add(cardImage);
    } else {
      // 如果没有加载到卡牌图片，则使用默认卡背
      const defaultCard = this.add.image(-200, 0, 'card-back')
        .setDisplaySize(200, 280);
      this.cardDetailPanel.add(defaultCard);
    }
    
    // 添加卡牌名称
    const nameText = this.add.text(-200, -150, card.name, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.cardDetailPanel.add(nameText);
    
    // 添加卡牌类型和元素
    const typeText = this.add.text(-200, 150, `${this.getCardTypeName(card.type)} · ${this.getElementName(card.element)}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    this.cardDetailPanel.add(typeText);
    
    // 添加卡牌费用
    const costCircle = this.add.circle(-280, -150, 20, 0x000000, 0.7);
    this.cardDetailPanel.add(costCircle);
    
    const costText = this.add.text(-280, -150, card.cost.toString(), {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.cardDetailPanel.add(costText);
    
    // 添加卡牌详细信息
    const infoTitle = this.add.text(50, -150, '卡牌详情', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.cardDetailPanel.add(infoTitle);
    
    // 添加卡牌描述
    const descText = this.add.text(50, -100, card.description, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: 300 }
    }).setOrigin(0.5, 0);
    this.cardDetailPanel.add(descText);
    
    // 添加正位效果
    const uprightTitle = this.add.text(50, -20, '正位效果:', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffde00'
    }).setOrigin(0.5, 0);
    this.cardDetailPanel.add(uprightTitle);
    
    const uprightText = this.add.text(50, 10, card.uprightEffect || '无特殊效果', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 300 }
    }).setOrigin(0.5, 0);
    this.cardDetailPanel.add(uprightText);
    
    // 添加逆位效果
    const reversedTitle = this.add.text(50, 80, '逆位效果:', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ff6b6b'
    }).setOrigin(0.5, 0);
    this.cardDetailPanel.add(reversedTitle);
    
    const reversedText = this.add.text(50, 110, card.reversedEffect || '无特殊效果', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 300 }
    }).setOrigin(0.5, 0);
    this.cardDetailPanel.add(reversedText);
    
    // 添加关闭按钮
    const closeButton = this.add.circle(280, -180, 20, 0xff0000)
      .setInteractive()
      .on('pointerdown', () => {
        if (this.cardDetailPanel) {
          this.cardDetailPanel.destroy();
          this.cardDetailPanel = null;
        }
      });
    this.cardDetailPanel.add(closeButton);
    
    const closeText = this.add.text(280, -180, 'X', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.cardDetailPanel.add(closeText);
    
    // 设置面板交互区域
    bgMask.setInteractive()
      .on('pointerdown', () => {
        if (this.cardDetailPanel) {
          this.cardDetailPanel.destroy();
          this.cardDetailPanel = null;
        }
      });
  }
  
  private getCardTypeName(type: CardType): string {
    switch (type) {
      case CardType.ATTACK:
        return '攻击';
      case CardType.DEFENSE:
        return '防御';
      case CardType.SKILL:
        return '技能';
      case CardType.ITEM:
        return '道具';
      default:
        return '未知';
    }
  }
  
  private getElementName(element: ElementType): string {
    switch (element) {
      case ElementType.FIRE:
        return '火';
      case ElementType.WATER:
        return '水';
      case ElementType.EARTH:
        return '土';
      case ElementType.AIR:
        return '风';
      case ElementType.LIGHT:
        return '光';
      case ElementType.DARK:
        return '暗';
      default:
        return '无';
    }
  }
  
  private showFilterOptions(): void {
    // 创建筛选选项面板
    const filterPanel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 添加背景遮罩
    const bgMask = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    filterPanel.add(bgMask);
    
    // 添加面板背景
    const panelBg = this.add.rectangle(0, 0, 400, 300, 0x2a2a4a, 1);
    filterPanel.add(panelBg);
    
    // 添加标题
    const titleText = this.add.text(0, -120, '筛选选项', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    filterPanel.add(titleText);
    
    // 添加筛选选项
    // 按类型筛选
    const typeTitle = this.add.text(-150, -80, '卡牌类型:', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    filterPanel.add(typeTitle);
    
    const typeOptions = [
      { text: '全部', value: 'all' },
      { text: '攻击', value: CardType.ATTACK },
      { text: '防御', value: CardType.DEFENSE },
      { text: '技能', value: CardType.SKILL },
      { text: '道具', value: CardType.ITEM }
    ];
    
    typeOptions.forEach((option, index) => {
      const y = -50 + index * 30;
      const optionText = this.add.text(-150, y, option.text, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa'
      }).setOrigin(0, 0.5)
        .setInteractive()
        .on('pointerdown', () => {
          this.filterCardsByType(option.value);
          filterPanel.destroy();
        })
        .on('pointerover', () => {
          optionText.setColor('#ffffff');
        })
        .on('pointerout', () => {
          optionText.setColor('#aaaaaa');
        });
      filterPanel.add(optionText);
    });
    
    // 按元素筛选
    const elementTitle = this.add.text(50, -80, '元素类型:', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    filterPanel.add(elementTitle);
    
    const elementOptions = [
      { text: '全部', value: 'all' },
      { text: '火', value: ElementType.FIRE },
      { text: '水', value: ElementType.WATER },
      { text: '土', value: ElementType.EARTH },
      { text: '风', value: ElementType.AIR },
      { text: '光', value: ElementType.LIGHT },
      { text: '暗', value: ElementType.DARK }
    ];
    
    elementOptions.forEach((option, index) => {
      const y = -50 + index * 30;
      const optionText = this.add.text(50, y, option.text, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa'
      }).setOrigin(0, 0.5)
        .setInteractive()
        .on('pointerdown', () => {
          this.filterCardsByElement(option.value);
          filterPanel.destroy();
        })
        .on('pointerover', () => {
          optionText.setColor('#ffffff');
        })
        .on('pointerout', () => {
          optionText.setColor('#aaaaaa');
        });
      filterPanel.add(optionText);
    });
    
    // 添加关闭按钮
    const closeButton = this.add.circle(180, -120, 15, 0xff0000)
      .setInteractive()
      .on('pointerdown', () => {
        filterPanel.destroy();
      });
    filterPanel.add(closeButton);
    
    const closeText = this.add.text(180, -120, 'X', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    filterPanel.add(closeText);
    
    // 设置面板交互区域
    bgMask.setInteractive()
      .on('pointerdown', () => {
        filterPanel.destroy();
      });
  }
  
  private filterCardsByType(type: string | CardType): void {
    if (type === 'all') {
      this.cards = [...initialDeck, ...rareCards];
    } else {
      const allCards = [...initialDeck, ...rareCards];
      this.cards = allCards.filter(card => card.type === type);
    }
    
    this.currentPage = 0;
    this.showCurrentPageCards();
    this.updatePageText();
  }
  
  private filterCardsByElement(element: string | ElementType): void {
    if (element === 'all') {
      this.cards = [...initialDeck, ...rareCards];
    } else {
      const allCards = [...initialDeck, ...rareCards];
      this.cards = allCards.filter(card => card.element === element);
    }
    
    this.currentPage = 0;
    this.showCurrentPageCards();
    this.updatePageText();
  }
}
