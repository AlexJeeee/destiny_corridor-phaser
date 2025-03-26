import Phaser from 'phaser';
import { BaseScene } from '../BaseScene';
import { Character, Enemy, GridCoord, Card, CardType, CardEffectType } from '@/types';
import { getEnemiesByFloor } from '@/data/enemies';
import { 
  BattlefieldManager, 
  PlayerManager, 
  EnemyManager, 
  CardManager, 
  UIManager, 
  TurnManager,
  GameUtils
} from './components';
import { BattleSystem } from '@/game/systems/BattleSystem';

export class GameBoardScene extends BaseScene {
  // 游戏数据
  private player: Character | null = null;
  private currentFloor: number = 1;
  
  // 管理器
  private battlefieldManager: BattlefieldManager;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private cardManager: CardManager;
  private uiManager: UIManager;
  private turnManager: TurnManager;
  private battleSystem: BattleSystem | null = null;
  
  // 音频
  private battleMusic: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super('GameBoardScene');
    
    // 初始化管理器
    this.battlefieldManager = new BattlefieldManager(this);
    this.playerManager = new PlayerManager(this, this.battlefieldManager);
    this.enemyManager = new EnemyManager(this, this.battlefieldManager);
    this.cardManager = new CardManager(this);
    this.uiManager = new UIManager(this, this.playerManager);
    this.turnManager = new TurnManager(
      this, 
      this.playerManager, 
      this.enemyManager, 
      this.cardManager, 
      this.uiManager
    );
    
    // 设置回调
    this.setupCallbacks();
  }

  init(data: any): void {
    // 初始化游戏数据
    if (data && data.character) {
      this.player = data.character;
      this.playerManager.setPlayer(this.player);
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
    
    // 加载战斗音乐
    this.load.audio('battle-music', 'src/assets/audios/battle.mp3');
  }

  create(): void {
    super.create();

    // 创建游戏界面
    GameUtils.createBackground(this);
    this.createGameElements();

    // 设置相机
    this.cameras.main.setBounds(0, 0, this.game.config.width as number, this.game.config.height as number);
    
    // 播放战斗音乐
    this.battleMusic = this.sound.add('battle-music', {
      volume: 0.4,
      loop: true
    });
    this.battleMusic.play();
    
    // 开始玩家回合
    this.turnManager.startPlayerTurn();
  }

  update(): void {
    // 游戏逻辑更新
  }

  private setupCallbacks(): void {
    // 设置卡牌选中回调
    this.cardManager.setOnCardSelected((card: Card) => {
      this.handleCardSelected(card);
    });
    
    // 设置结束回合按钮回调
    this.uiManager.setOnEndTurnClicked(() => {
      this.turnManager.endPlayerTurn();
    });
    
    // 设置技能使用回调
    this.uiManager.setOnAbilityClicked((abilityId: string) => {
      this.handleAbilityUsed(abilityId);
    });
    
    // 设置敌人回合结束回调
    this.turnManager.setOnEnemyTurnEnd(() => {
      // 可以在这里添加敌人回合结束后的逻辑
    });
    
    // 设置玩家回合结束回调
    this.turnManager.setOnPlayerTurnEnd(() => {
      // 可以在这里添加玩家回合结束后的逻辑
    });
    
    // 设置进入下一层回调
    this.turnManager.setOnNextFloor(() => {
      this.goToNextFloor();
    });
  }

  private createGameElements(): void {
    // 创建背景
    GameUtils.createBackground(this);
    
    // 创建战场
    this.battlefieldManager.createBattlefield();
    
    // 创建玩家
    this.playerManager.createPlayer();
    
    // 创建敌人
    this.enemyManager.createEnemies(this.currentFloor);
    
    // 创建卡牌
    if (this.player) {
      this.cardManager.createCards(this.player);
    }
    
    // 创建UI
    this.uiManager.createUI();
    
    // 创建信息面板，确保传递非空值
    if (this.player) {
      this.uiManager.createInfoPanel(this.player, this.currentFloor);
    } else {
      // 如果玩家为空，创建一个默认的信息面板
      this.uiManager.createInfoPanel(null, this.currentFloor);
    }
    
    // 初始化战斗系统
    if (this.player) {
      this.battleSystem = new BattleSystem(
        this,
        this.player,
        this.playerManager,
        this.enemyManager,
        this.cardManager,
        this.turnManager
      );
      
      // 设置TurnManager的BattleSystem引用
      this.turnManager.setBattleSystem(this.battleSystem);
    }
    
    // 设置格子点击事件
    this.setupGridClickEvents();
  }

  private setupGridClickEvents(): void {
    // 为每个格子添加点击事件
    const gridTiles = this.battlefieldManager.getGridTiles();
    gridTiles.forEach(tile => {
      const gridTile = tile.getAt(0);
      if (gridTile) {
        gridTile.off('pointerdown'); // 移除之前的事件
        gridTile.on('pointerdown', () => {
          const coordText = tile.getAt(1) as Phaser.GameObjects.Text;
          if (coordText) {
            const coordStr = coordText.text;
            const [x, y] = coordStr.split(',').map(Number);
            this.handleGridClick({ x, y });
          }
        });
      }
    });
  }

  private handleCardSelected(card: Card): void {
    // 处理卡牌选中事件
    if (this.turnManager.getCurrentTurn() === 'player' && this.player) {
      // 根据卡牌类型决定操作
      if (card.type === CardType.MOVEMENT) {
        // 显示可移动的位置
        const playerPos = this.playerManager.getPlayerPosition();
        if (playerPos) {
          const enemyPositions = this.enemyManager.getEnemyPositions();
          const validMoves = this.battlefieldManager.getValidMoves(playerPos, 2, enemyPositions);
          this.battlefieldManager.showValidMoves(validMoves);
        }
      } else if (card.type === CardType.ATTACK) {
        // 显示可攻击的敌人
        const playerPos = this.playerManager.getPlayerPosition();
        if (playerPos) {
          const enemies = this.enemyManager.getEnemies();
          const attackablePositions: GridCoord[] = [];
          
          enemies.forEach(enemy => {
            if (enemy.position && playerPos) {
              const distance = GameUtils.getGridDistance(playerPos, enemy.position);
              if (distance <= 3) { // 假设攻击范围为3格
                attackablePositions.push(enemy.position);
              }
            }
          });
          
          this.battlefieldManager.showAttackableEnemies(attackablePositions);
        }
      } else if (card.type === CardType.DEFENSE || (card.type === CardType.SKILL && card.effects.some(e => e.type === CardEffectType.HEAL || e.type === CardEffectType.DEFENSE))) {
        // 对于防御和治疗卡牌，高亮显示玩家自身
        const playerPos = this.playerManager.getPlayerPosition();
        if (playerPos) {
          // 创建一个只包含玩家位置的数组
          const selfTargetPositions: GridCoord[] = [playerPos];
          // 使用与攻击目标相同的高亮方式，但只高亮玩家位置
          this.battlefieldManager.showSelfTargetable(selfTargetPositions);
        }
      }
    }
  }

  private handleGridClick(coord: GridCoord): void {
    console.log(`点击了格子: ${coord.x},${coord.y}`);
    const selectedCard = this.cardManager.getSelectedCard();
    // 如果是玩家回合且选中了卡牌
    if (this.turnManager.getCurrentTurn() === 'player' && selectedCard) {
      
      // 检查是否是有效的移动位置
      const playerPos = this.playerManager.getPlayerPosition();
      if (playerPos) {
        const enemyPositions = this.enemyManager.getEnemyPositions();
        const validMoves = this.battlefieldManager.getValidMoves(playerPos, 2, enemyPositions);
        
        const isValidMove = validMoves.some(move => 
          move.x === coord.x && move.y === coord.y
        );
        
        console.log(`是否有效移动: ${isValidMove}`);
        
        if (isValidMove && selectedCard) {
          // 检查卡牌类型
          if (selectedCard.type === CardType.MOVEMENT) {
            // 移动玩家
            this.playerManager.movePlayer(coord);
            
            // 使用卡牌
            if (this.player) {
              this.cardManager.playCard(selectedCard, this.player);
              this.uiManager.updateInfoPanel(this.player);
            }
            
            // 清除选中状态和有效移动标记
            this.cardManager.clearCardSelection();
            this.battlefieldManager.clearValidMoves();
          }
        }
      }
      
      // 检查是否点击了敌人（攻击卡牌）
      if (selectedCard && selectedCard.type === CardType.ATTACK) {
        const clickedEnemy = this.enemyManager.findEnemyByPosition(coord);
        
        if (clickedEnemy && this.battleSystem) {
          // 使用BattleSystem攻击敌人
          const damage = selectedCard.baseDamage || 0; // 如果卡牌没有伤害值，默认为0
          this.battleSystem.damageEnemy(clickedEnemy, damage);
          
          // 显示视觉效果
          this.enemyManager.attackEnemy(clickedEnemy, damage);
          
          // 使用卡牌
          if (this.player) {
            this.cardManager.playCard(selectedCard, this.player);
            this.uiManager.updateInfoPanel(this.player);
          }
          
          // 清除选中状态和有效移动标记
          this.cardManager.clearCardSelection();
          this.battlefieldManager.clearValidMoves();
          
          // 检查敌人是否死亡
          if (clickedEnemy.health <= 0) {
            this.enemyManager.removeEnemy(clickedEnemy, () => {
              // 检查是否所有敌人都被击败
              if (this.enemyManager.areAllEnemiesDead()) {
                // 延迟一段时间后进入下一层
                this.time.delayedCall(1000, () => {
                  this.turnManager.goToNextFloor();
                }, [], this);
              }
            });
          }
        }
      }
      
      // 检查是否点击了玩家自身（防御或治疗卡牌）
      if (selectedCard && (selectedCard.type === CardType.DEFENSE || 
          (selectedCard.type === CardType.SKILL && selectedCard.effects && 
           selectedCard.effects.some(e => e.type === CardEffectType.HEAL || e.type === CardEffectType.DEFENSE)))) {
        
        // 检查点击的是否是玩家位置
        const isPlayerPosition = playerPos && coord.x === playerPos.x && coord.y === playerPos.y;
        
        if (isPlayerPosition && this.player && this.battleSystem) {
          console.log(`对自身使用卡牌: ${selectedCard.name}`);
          
          // 使用PlayerManager的useCardOnSelf方法应用卡牌效果
          this.playerManager.useCardOnSelf(selectedCard);
          
          // 使用卡牌
          this.cardManager.playCard(selectedCard, this.player);
          this.uiManager.updateInfoPanel(this.player);
          
          // 清除选中状态和有效移动标记
          this.cardManager.clearCardSelection();
          this.battlefieldManager.clearValidMoves();
        }
      }
    }
  }

  private handleAbilityUsed(abilityId: string): void {
    // 检查当前是否为玩家回合
    if (this.turnManager.getCurrentTurn() !== 'player' || !this.player) {
      console.log('现在不是玩家回合，无法使用技能');
      return;
    }
    
    // 使用技能
    const success = this.playerManager.useAbility(abilityId);
    
    if (success) {
      // 更新UI
      this.uiManager.updateInfoPanel(this.player);
      
      // 播放技能使用音效
      // this.sound.play('ability-sound');
    }
  }

  private goToNextFloor(): void {
    // 增加楼层
    this.currentFloor++;
    
    // 恢复玩家能量
    if (this.player) {
      this.player.energy = this.player.maxEnergy;
    }
    
    // 清除当前战场
    this.clearGameElements();
    
    // 创建新的战场
    this.createGameElements();
    
    // 开始新的回合
    this.turnManager.startPlayerTurn();
  }

  private clearGameElements(): void {
    // 清除战场
    this.battlefieldManager.clearBattlefield();
    
    // 清除玩家
    this.playerManager.clearPlayer();
    
    // 清除敌人
    this.enemyManager.clearEnemies();
    
    // 清除卡牌
    this.cardManager.clearCards();
    
    // 清除UI
    this.uiManager.clearUI();
  }

  transitionTo(key: string, data?: any): void {
    // 停止战斗音乐
    if (this.battleMusic) {
      this.battleMusic.stop();
    }
    
    // 调用父类的场景切换方法
    super.transitionTo(key, data);
  }
}
