import Phaser from 'phaser';

// 资源类型枚举
export enum AssetType {
  IMAGE = 'image',
  SPRITESHEET = 'spritesheet',
  AUDIO = 'audio',
  JSON = 'json'
}

// 资源接口
interface Asset {
  key: string;
  path: string;
  type: AssetType;
  options?: any;
}

// 资源组接口
interface AssetGroup {
  name: string;
  assets: Asset[];
}

// 资源加载器类
export class AssetLoader {
  private scene: Phaser.Scene;
  private assetGroups: AssetGroup[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeDefaultAssets();
  }

  // 初始化默认资源
  private initializeDefaultAssets(): void {
    // 通用UI资源
    this.addAssetGroup('ui', [
      { key: 'button-bg', path: 'assets/images/ui/button-bg.png', type: AssetType.IMAGE },
      { key: 'panel-bg', path: 'assets/images/ui/panel-bg.png', type: AssetType.IMAGE },
      { key: 'logo', path: 'assets/images/ui/logo.png', type: AssetType.IMAGE }
    ]);

    // 角色资源
    this.addAssetGroup('characters', [
      { key: 'character-placeholder', path: 'assets/images/characters/placeholder.png', type: AssetType.IMAGE }
    ]);

    // 卡牌资源
    this.addAssetGroup('cards', [
      { key: 'card-back', path: 'assets/images/cards/card-back.png', type: AssetType.IMAGE },
      { key: 'card-frame', path: 'assets/images/cards/card-frame.png', type: AssetType.IMAGE }
    ]);

    // 战场资源
    this.addAssetGroup('battlefield', [
      { key: 'hex-tile', path: 'assets/images/battlefield/hex-tile.png', type: AssetType.IMAGE },
      { key: 'hex-highlight', path: 'assets/images/battlefield/hex-highlight.png', type: AssetType.IMAGE }
    ]);
  }

  // 添加资源组
  public addAssetGroup(name: string, assets: Asset[]): void {
    this.assetGroups.push({ name, assets });
  }

  // 加载特定资源组
  public loadGroup(groupName: string, onComplete?: () => void): void {
    const group = this.assetGroups.find(g => g.name === groupName);
    
    if (!group) {
      console.warn(`资源组 "${groupName}" 不存在`);
      if (onComplete) onComplete();
      return;
    }

    if (group.assets.length === 0) {
      console.log(`资源组 "${groupName}" 没有资源需要加载`);
      if (onComplete) onComplete();
      return;
    }

    // 添加加载进度事件
    this.scene.load.on('progress', (value: number) => {
      console.log(`加载进度: ${Math.floor(value * 100)}%`);
    });

    // 添加加载完成事件
    this.scene.load.on('complete', () => {
      console.log(`资源组 "${groupName}" 加载完成`);
      if (onComplete) onComplete();
    });

    // 加载资源
    group.assets.forEach(asset => {
      switch (asset.type) {
        case AssetType.IMAGE:
          this.scene.load.image(asset.key, asset.path);
          break;
        case AssetType.SPRITESHEET:
          this.scene.load.spritesheet(asset.key, asset.path, asset.options);
          break;
        case AssetType.AUDIO:
          this.scene.load.audio(asset.key, asset.path);
          break;
        case AssetType.JSON:
          this.scene.load.json(asset.key, asset.path);
          break;
        default:
          console.warn(`未知资源类型: ${asset.type}`);
      }
    });

    // 开始加载
    this.scene.load.start();
  }

  // 加载所有资源
  public loadAll(onComplete?: () => void): void {
    // 将所有资源组合并为一个大组
    const allAssets: Asset[] = [];
    this.assetGroups.forEach(group => {
      allAssets.push(...group.assets);
    });

    // 添加加载进度事件
    this.scene.load.on('progress', (value: number) => {
      console.log(`加载进度: ${Math.floor(value * 100)}%`);
    });

    // 添加加载完成事件
    this.scene.load.on('complete', () => {
      console.log('所有资源加载完成');
      if (onComplete) onComplete();
    });

    // 加载所有资源
    allAssets.forEach(asset => {
      switch (asset.type) {
        case AssetType.IMAGE:
          this.scene.load.image(asset.key, asset.path);
          break;
        case AssetType.SPRITESHEET:
          this.scene.load.spritesheet(asset.key, asset.path, asset.options);
          break;
        case AssetType.AUDIO:
          this.scene.load.audio(asset.key, asset.path);
          break;
        case AssetType.JSON:
          this.scene.load.json(asset.key, asset.path);
          break;
        default:
          console.warn(`未知资源类型: ${asset.type}`);
      }
    });

    // 开始加载
    this.scene.load.start();
  }
}
