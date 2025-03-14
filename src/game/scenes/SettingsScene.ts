import Phaser from 'phaser';
import { BaseScene } from './BaseScene';

interface GameSettings {
  musicVolume: number;
  soundVolume: number;
  language: string;
  difficulty: string;
  showTutorial: boolean;
}

export class SettingsScene extends BaseScene {
  private settings: GameSettings = {
    musicVolume: 0.7,
    soundVolume: 0.8,
    language: 'zh',
    difficulty: 'normal',
    showTutorial: true
  };
  
  private sliders: Map<string, Phaser.GameObjects.Container> = new Map();
  private languageOptions: Phaser.GameObjects.Container | null = null;
  private difficultyOptions: Phaser.GameObjects.Container | null = null;
  private tutorialToggle: Phaser.GameObjects.Container | null = null;
  
  constructor() {
    super('SettingsScene');
  }
  
  preload(): void {
    // 加载资源
    this.load.image('settings-bg', 'assets/images/settings-bg.png');
    this.load.image('slider-track', 'assets/images/slider-track.png');
    this.load.image('slider-thumb', 'assets/images/slider-thumb.png');
    this.load.image('checkbox', 'assets/images/checkbox.png');
    this.load.image('checkbox-checked', 'assets/images/checkbox-checked.png');
  }
  
  create(): void {
    super.create();
    
    // 添加背景
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'settings-bg');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    
    // 如果没有加载到背景图片，则使用纯色背景
    if (!this.textures.exists('settings-bg')) {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e)
        .setOrigin(0)
        .setScrollFactor(0);
    }
    
    // 添加标题
    this.add.text(this.cameras.main.width / 2, 50, '游戏设置', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // 添加返回按钮
    this.createButton(100, 50, '返回', () => {
      this.saveSettings();
      this.transitionTo('MainMenuScene');
    });
    
    // 创建设置选项
    this.createSettingsOptions();
    
    // 添加保存按钮
    this.createButton(this.cameras.main.width / 2, this.cameras.main.height - 50, '保存设置', () => {
      this.saveSettings();
      this.showMessage('设置已保存！');
    });
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
  
  private createSettingsOptions(): void {
    const startY = 120;
    const spacing = 80;
    
    // 音乐音量
    this.createVolumeSlider('音乐音量', 'musicVolume', startY);
    
    // 音效音量
    this.createVolumeSlider('音效音量', 'soundVolume', startY + spacing);
    
    // 语言选择
    this.createLanguageOptions(startY + spacing * 2);
    
    // 难度选择
    this.createDifficultyOptions(startY + spacing * 3);
    
    // 教程显示
    this.createTutorialToggle(startY + spacing * 4);
  }
  
  private createVolumeSlider(label: string, key: 'musicVolume' | 'soundVolume', y: number): void {
    const container = this.add.container(this.cameras.main.width / 2, y);
    
    // 添加标签
    const labelText = this.add.text(-200, 0, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    container.add(labelText);
    
    // 添加滑动条轨道
    const trackWidth = 300;
    const track = this.add.image(0, 0, 'slider-track')
      .setDisplaySize(trackWidth, 10);
    container.add(track);
    
    // 如果没有加载到轨道图片，则使用矩形替代
    if (!this.textures.exists('slider-track')) {
      const trackRect = this.add.rectangle(0, 0, trackWidth, 10, 0x666666);
      container.add(trackRect);
    }
    
    // 添加滑动条拇指
    const thumb = this.add.image(0, 0, 'slider-thumb')
      .setDisplaySize(20, 20)
      .setInteractive({ draggable: true });
    container.add(thumb);
    
    // 如果没有加载到拇指图片，则使用圆形替代
    if (!this.textures.exists('slider-thumb')) {
      const thumbCircle = this.add.circle(0, 0, 10, 0xffffff);
      thumbCircle.setInteractive({ draggable: true });
      container.add(thumbCircle);
    }
    
    // 设置初始位置
    const initialValue = this.settings[key];
    thumb.x = (initialValue * trackWidth) - (trackWidth / 2);
    
    // 添加拖动事件
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === thumb) {
        // 限制在轨道范围内
        const minX = -trackWidth / 2;
        const maxX = trackWidth / 2;
        thumb.x = Phaser.Math.Clamp(dragX, minX, maxX);
        
        // 更新设置值
        const value = (thumb.x + (trackWidth / 2)) / trackWidth;
        this.settings[key] = value;
        
        // 更新百分比文本
        const percentText = container.getByName('percentText') as Phaser.GameObjects.Text;
        if (percentText) {
          percentText.setText(`${Math.round(value * 100)}%`);
        }
      }
    });
    
    // 添加百分比文本
    const percentText = this.add.text(trackWidth / 2 + 30, 0, `${Math.round(initialValue * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5)
      .setName('percentText');
    container.add(percentText);
    
    // 保存滑动条引用
    this.sliders.set(key, container);
  }
  
  private createLanguageOptions(y: number): void {
    this.languageOptions = this.add.container(this.cameras.main.width / 2, y);
    
    // 添加标签
    const labelText = this.add.text(-200, 0, '语言', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.languageOptions.add(labelText);
    
    // 语言选项
    const languages = [
      { value: 'zh', label: '中文' },
      { value: 'en', label: 'English' }
    ];
    
    const optionWidth = 100;
    const spacing = 20;
    const startX = -optionWidth - spacing / 2;
    
    languages.forEach((language, index) => {
      const x = startX + index * (optionWidth + spacing);
      
      // 创建选项背景
      const optionBg = this.add.rectangle(x, 0, optionWidth, 40, 0x333333, 1)
        .setInteractive()
        .on('pointerdown', () => {
          this.settings.language = language.value;
          this.updateLanguageSelection();
        });
      this.languageOptions?.add(optionBg);
      
      // 添加选项文本
      const optionText = this.add.text(x, 0, language.label, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5);
      this.languageOptions?.add(optionText);
      
      // 如果是当前选择的语言，高亮显示
      if (language.value === this.settings.language) {
        optionBg.setFillStyle(0x4a3b96);
      }
    });
  }
  
  private updateLanguageSelection(): void {
    if (!this.languageOptions) return;
    
    // 更新语言选项的高亮状态
    const options = this.languageOptions.getAll();
    
    // 过滤出矩形背景
    const backgrounds = options.filter(obj => obj.type === 'Rectangle') as Phaser.GameObjects.Rectangle[];
    
    // 重置所有背景颜色
    backgrounds.forEach(bg => bg.setFillStyle(0x333333));
    
    // 根据当前语言设置高亮
    const languages = [
      { value: 'zh', label: '中文' },
      { value: 'en', label: 'English' }
    ];
    
    const selectedIndex = languages.findIndex(lang => lang.value === this.settings.language);
    if (selectedIndex !== -1 && selectedIndex < backgrounds.length) {
      backgrounds[selectedIndex].setFillStyle(0x4a3b96);
    }
  }
  
  private createDifficultyOptions(y: number): void {
    this.difficultyOptions = this.add.container(this.cameras.main.width / 2, y);
    
    // 添加标签
    const labelText = this.add.text(-200, 0, '难度', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.difficultyOptions.add(labelText);
    
    // 难度选项
    const difficulties = [
      { value: 'easy', label: '简单' },
      { value: 'normal', label: '普通' },
      { value: 'hard', label: '困难' }
    ];
    
    const optionWidth = 80;
    const spacing = 10;
    const startX = -optionWidth * 1.5 - spacing;
    
    difficulties.forEach((difficulty, index) => {
      const x = startX + index * (optionWidth + spacing);
      
      // 创建选项背景
      const optionBg = this.add.rectangle(x, 0, optionWidth, 40, 0x333333, 1)
        .setInteractive()
        .on('pointerdown', () => {
          this.settings.difficulty = difficulty.value;
          this.updateDifficultySelection();
        });
      this.difficultyOptions?.add(optionBg);
      
      // 添加选项文本
      const optionText = this.add.text(x, 0, difficulty.label, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5);
      this.difficultyOptions?.add(optionText);
      
      // 如果是当前选择的难度，高亮显示
      if (difficulty.value === this.settings.difficulty) {
        optionBg.setFillStyle(0x4a3b96);
      }
    });
  }
  
  private updateDifficultySelection(): void {
    if (!this.difficultyOptions) return;
    
    // 更新难度选项的高亮状态
    const options = this.difficultyOptions.getAll();
    
    // 过滤出矩形背景
    const backgrounds = options.filter(obj => obj.type === 'Rectangle') as Phaser.GameObjects.Rectangle[];
    
    // 重置所有背景颜色
    backgrounds.forEach(bg => bg.setFillStyle(0x333333));
    
    // 根据当前难度设置高亮
    const difficulties = [
      { value: 'easy', label: '简单' },
      { value: 'normal', label: '普通' },
      { value: 'hard', label: '困难' }
    ];
    
    const selectedIndex = difficulties.findIndex(diff => diff.value === this.settings.difficulty);
    if (selectedIndex !== -1 && selectedIndex < backgrounds.length) {
      backgrounds[selectedIndex].setFillStyle(0x4a3b96);
    }
  }
  
  private createTutorialToggle(y: number): void {
    this.tutorialToggle = this.add.container(this.cameras.main.width / 2, y);
    
    // 添加标签
    const labelText = this.add.text(-200, 0, '显示教程', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.tutorialToggle.add(labelText);
    
    // 添加复选框
    const checkbox = this.add.image(0, 0, this.settings.showTutorial ? 'checkbox-checked' : 'checkbox')
      .setDisplaySize(30, 30)
      .setInteractive()
      .on('pointerdown', () => {
        this.settings.showTutorial = !this.settings.showTutorial;
        this.updateTutorialToggle();
      });
    this.tutorialToggle.add(checkbox);
    
    // 如果没有加载到复选框图片，则使用矩形替代
    if (!this.textures.exists('checkbox') || !this.textures.exists('checkbox-checked')) {
      const checkboxRect = this.add.rectangle(0, 0, 30, 30, 0x333333, 1)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive()
        .on('pointerdown', () => {
          this.settings.showTutorial = !this.settings.showTutorial;
          this.updateTutorialToggle();
        });
      this.tutorialToggle.add(checkboxRect);
      
      // 如果选中，则添加勾选标记
      if (this.settings.showTutorial) {
        const checkmark = this.add.text(0, 0, '✓', {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffffff',
        }).setOrigin(0.5);
        this.tutorialToggle.add(checkmark);
      }
    }
  }
  
  private updateTutorialToggle(): void {
    if (!this.tutorialToggle) return;
    
    // 更新复选框状态
    const options = this.tutorialToggle.getAll();
    
    // 查找复选框
    const checkbox = options.find(obj => obj.type === 'Image') as Phaser.GameObjects.Image;
    if (checkbox) {
      checkbox.setTexture(this.settings.showTutorial ? 'checkbox-checked' : 'checkbox');
    } else {
      // 如果使用的是矩形替代
      const checkboxRect = options.find(obj => obj.type === 'Rectangle') as Phaser.GameObjects.Rectangle;
      if (checkboxRect) {
        // 查找勾选标记
        const checkmark = options.find(obj => obj.type === 'Text') as Phaser.GameObjects.Text;
        
        if (this.settings.showTutorial) {
          // 如果没有勾选标记，则添加
          if (!checkmark) {
            const newCheckmark = this.add.text(0, 0, '✓', {
              fontFamily: 'Arial',
              fontSize: '24px',
              color: '#ffffff',
            }).setOrigin(0.5);
            this.tutorialToggle.add(newCheckmark);
          }
        } else {
          // 如果有勾选标记，则移除
          if (checkmark) {
            checkmark.destroy();
          }
        }
      }
    }
  }
  
  private saveSettings(): void {
    // 保存设置到本地存储
    localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    
    // 应用设置
    this.applySettings();
  }
  
  private applySettings(): void {
    // 应用音量设置
    if (this.sound.get('background-music')) {
      const bgMusic = this.sound.get('background-music');
      // 使用 as any 临时解决类型问题
      (bgMusic as any).setVolume?.(this.settings.musicVolume);
    }
    
    // 设置全局音效音量
    // 使用 as any 临时解决类型问题
    (this.sound as any).setVolume?.(this.settings.soundVolume);
    
    // 应用语言设置
    // 这里需要根据实际情况实现语言切换逻辑
    
    // 应用难度设置
    // 这里需要根据实际情况实现难度调整逻辑
  }
  
  private showMessage(message: string): void {
    // 创建消息容器
    const messageContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 添加背景
    const messageBg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.8);
    messageContainer.add(messageBg);
    
    // 添加消息文本
    const messageText = this.add.text(0, 0, message, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    messageContainer.add(messageText);
    
    // 自动消失
    this.time.delayedCall(2000, () => {
      messageContainer.destroy();
    });
  }
}
