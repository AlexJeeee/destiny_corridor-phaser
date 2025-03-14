import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Character, ElementType } from '../../types';
import { playerCharacters } from '../../data/characters';

export class CharacterSelectionScene extends BaseScene {
  private characters: Character[] = [];
  private selectedCharacterIndex: number = 0;
  private characterSprites: Phaser.GameObjects.Sprite[] = [];
  private characterInfo: Phaser.GameObjects.Text | null = null;
  private startButton: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('CharacterSelectionScene');
  }

  preload(): void {
    // 加载角色选择场景资源
    this.load.image('character-bg', 'assets/images/character-selection-bg.png');
    this.load.image('character-frame', 'assets/images/character-frame.png');
    this.load.image('arrow-left', 'assets/images/arrow-left.png');
    this.load.image('arrow-right', 'assets/images/arrow-right.png');
    
    // 加载角色图片
    playerCharacters.forEach(character => {
      this.load.image(`character-${character.id}`, character.avatarUrl || 'assets/images/default-character.png');
    });
  }

  create(): void {
    super.create();

    // 获取角色数据
    this.characters = playerCharacters;

    // 添加背景
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'character-bg');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // 如果没有加载到背景图片，则使用纯色背景
    if (!this.textures.exists('character-bg')) {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e)
        .setOrigin(0)
        .setScrollFactor(0);
    }

    // 添加标题
    this.add.text(this.cameras.main.width / 2, 50, '选择你的角色', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 创建角色选择区域
    this.createCharacterSelection();

    // 创建角色信息显示区域
    this.createCharacterInfo();

    // 创建开始游戏按钮
    this.createStartButton();

    // 创建返回按钮
    this.createBackButton();

    // 初始显示第一个角色的信息
    this.updateCharacterInfo(0);
  }

  private createCharacterSelection(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2 - 50;

    // 创建角色框
    const frame = this.add.image(centerX, centerY, 'character-frame');
    
    // 如果没有加载到角色框图片，则使用矩形替代
    if (!this.textures.exists('character-frame')) {
      this.add.rectangle(centerX, centerY, 200, 200, 0x0f3460, 1)
        .setStrokeStyle(4, 0xf7d02c);
    }

    // 创建角色精灵
    this.characters.forEach((character, index) => {
      const sprite = this.add.sprite(centerX, centerY, `character-${character.id}`);
      
      // 如果没有加载到角色图片，则使用文本替代
      if (!this.textures.exists(`character-${character.id}`)) {
        this.add.text(centerX, centerY, character.name.charAt(0), {
          fontFamily: 'Arial',
          fontSize: '64px',
          color: '#ffffff',
        }).setOrigin(0.5);
      }
      
      sprite.setVisible(index === this.selectedCharacterIndex);
      this.characterSprites.push(sprite);
    });

    // 创建左右箭头
    const leftArrow = this.add.image(centerX - 150, centerY, 'arrow-left')
      .setInteractive()
      .on('pointerdown', () => this.selectPreviousCharacter());
      
    // 如果没有加载到左箭头图片，则使用文本替代
    if (!this.textures.exists('arrow-left')) {
      this.add.text(centerX - 150, centerY, '<', {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
      }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.selectPreviousCharacter());
    }

    const rightArrow = this.add.image(centerX + 150, centerY, 'arrow-right')
      .setInteractive()
      .on('pointerdown', () => this.selectNextCharacter());
      
    // 如果没有加载到右箭头图片，则使用文本替代
    if (!this.textures.exists('arrow-right')) {
      this.add.text(centerX + 150, centerY, '>', {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
      }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.selectNextCharacter());
    }
  }

  private createCharacterInfo(): void {
    const infoX = this.cameras.main.width / 2;
    const infoY = this.cameras.main.height / 2 + 100;

    // 创建角色信息文本
    this.characterInfo = this.add.text(infoX, infoY, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
  }

  private createStartButton(): void {
    const buttonX = this.cameras.main.width / 2;
    const buttonY = this.cameras.main.height - 80;

    // 创建按钮容器
    this.startButton = this.add.container(buttonX, buttonY);

    // 创建按钮背景
    const buttonBg = this.add.rectangle(0, 0, 200, 50, 0x4a3b96, 1)
      .setInteractive()
      .on('pointerdown', () => this.startGame())
      .on('pointerover', () => buttonBg.setFillStyle(0x5a4ba6))
      .on('pointerout', () => buttonBg.setFillStyle(0x4a3b96));

    // 创建按钮文本
    const buttonText = this.add.text(0, 0, '开始游戏', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 将背景和文本添加到容器
    this.startButton.add([buttonBg, buttonText]);
  }

  private createBackButton(): void {
    const buttonX = 100;
    const buttonY = 50;

    // 创建返回按钮
    const backButton = this.add.container(buttonX, buttonY);

    // 创建按钮背景
    const buttonBg = this.add.rectangle(0, 0, 100, 40, 0x333333, 1)
      .setInteractive()
      .on('pointerdown', () => this.transitionTo('MainMenuScene'))
      .on('pointerover', () => buttonBg.setFillStyle(0x444444))
      .on('pointerout', () => buttonBg.setFillStyle(0x333333));

    // 创建按钮文本
    const buttonText = this.add.text(0, 0, '返回', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 将背景和文本添加到容器
    backButton.add([buttonBg, buttonText]);
  }

  private selectPreviousCharacter(): void {
    this.characterSprites[this.selectedCharacterIndex].setVisible(false);
    this.selectedCharacterIndex = (this.selectedCharacterIndex - 1 + this.characters.length) % this.characters.length;
    this.characterSprites[this.selectedCharacterIndex].setVisible(true);
    this.updateCharacterInfo(this.selectedCharacterIndex);
  }

  private selectNextCharacter(): void {
    this.characterSprites[this.selectedCharacterIndex].setVisible(false);
    this.selectedCharacterIndex = (this.selectedCharacterIndex + 1) % this.characters.length;
    this.characterSprites[this.selectedCharacterIndex].setVisible(true);
    this.updateCharacterInfo(this.selectedCharacterIndex);
  }

  private updateCharacterInfo(index: number): void {
    const character = this.characters[index];
    if (this.characterInfo) {
      this.characterInfo.setText([
        `${character.name} - ${character.title || ''}`,
        '',
        `生命: ${character.maxHp || 0}  攻击: ${character.attack || 0}`,
        `防御: ${character.defense || 0}  速度: ${character.speed || 0}`,
        '',
        character.description || ''
      ]);
    }
  }

  private startGame(): void {
    const selectedCharacter = this.characters[this.selectedCharacterIndex];
    this.transitionTo('GameBoardScene', { character: selectedCharacter });
  }

  // 获取元素颜色
  private getElementColor(element: ElementType | string | undefined): string {
    if (!element) return '#718096'; // 默认颜色
    
    const colors: Record<string, string> = {
      [ElementType.FIRE]: '#e53e3e',
      [ElementType.ICE]: '#3182ce',
      [ElementType.LIGHTNING]: '#d69e2e',
      [ElementType.EARTH]: '#38a169',
      [ElementType.WIND]: '#319795',
      [ElementType.WATER]: '#4299e1',
      [ElementType.LIGHT]: '#f6e05e',
      [ElementType.DARK]: '#6b46c1',
      [ElementType.NEUTRAL]: '#718096'
    };
    
    return colors[element] || colors[ElementType.NEUTRAL];
  }

  // 获取元素名称
  private getElementName(element: ElementType | string | undefined): string {
    if (!element) return '未知';
    
    const names: Record<string, string> = {
      [ElementType.FIRE]: '火',
      [ElementType.ICE]: '冰',
      [ElementType.LIGHTNING]: '雷',
      [ElementType.EARTH]: '土',
      [ElementType.WIND]: '风',
      [ElementType.WATER]: '水',
      [ElementType.LIGHT]: '光',
      [ElementType.DARK]: '暗',
      [ElementType.NEUTRAL]: '中性'
    };
    
    return names[element] || '未知';
  }
}
