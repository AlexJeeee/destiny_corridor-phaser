// 卡牌位置枚举
export enum CardPosition {
  UPRIGHT = 'upright',  // 正位
  REVERSED = 'reversed' // 逆位
}

// 卡牌类型枚举
export enum CardType {
  ATTACK = 'attack',    // 攻击卡
  DEFENSE = 'defense',  // 防御卡
  SKILL = 'skill',      // 技能卡
  MOVEMENT = 'movement',// 移动卡
  SPECIAL = 'special',  // 特殊卡
  ITEM = 'item'         // 物品卡
}

// 元素类型枚举
export enum ElementType {
  FIRE = 'fire',        // 火
  ICE = 'ice',          // 冰
  LIGHTNING = 'lightning', // 雷
  WIND = 'wind',        // 风
  EARTH = 'earth',      // 土
  WATER = 'water',      // 水
  LIGHT = 'light',      // 光
  DARK = 'dark',        // 暗
  NEUTRAL = 'neutral',  // 中性
  AIR = 'air'           // 空气
}

// 地形类型枚举
export enum TerrainType {
  NORMAL = 'normal',    // 普通地面
  FIRE = 'fire',        // 火焰地形
  ICE = 'ice',          // 冰冻地形
  POISON = 'poison',    // 毒雾地形
  ENERGY = 'energy',    // 能量地形
  VOID = 'void',        // 虚空地形
  OBSTACLE = 'obstacle' // 障碍物
}

// 神明类型枚举
export enum DeityType {
  WAR = 'war',          // 战神
  WISDOM = 'wisdom',    // 智慧女神
  FORTUNE = 'fortune',  // 幸运之神
  DEATH = 'death'       // 死亡神明
}

// 卡牌接口
export interface Card {
  id: string;
  name: string;
  description: string;
  position: CardPosition;
  type: CardType;
  element: ElementType;
  cost: number;
  rarity: number; // 1-5，表示稀有度
  baseDamage?: number;
  baseDefense?: number;
  effects: CardEffect[];
  uprightEffect: CardEffect[];
  reversedEffect: CardEffect[];
  imageUrl: string;
  // 正位和逆位效果
  uprightEffectDesc: string;
  reversedEffectDesc: string;
  isUnlocked?: boolean; // 添加isUnlocked属性，表示卡牌是否已解锁
  flipped?: boolean; // 添加flipped属性，表示卡牌是否被翻转
}

export enum CardEffectType {
  DAMAGE = 'damage',
  AOE_DAMAGE = 'aoe_damage',
  ENERGY_GAIN = 'energy_gain',
  MOVE = 'move',
  THORNS = 'thorns',
  ELEMENTAL_DAMAGE = 'elemental_damage',
  RANDOM_ELEMENT_EFFECT = 'random_element_effect',
  WEAKNESS_EFFECT = 'weakness_effect',
  EXTRA_TURN = 'extra_turn',
  SKIP_TURN = 'skip_turn',
  DRAW_CARD = 'draw_card',
  BURN = 'burn',
  OBSTACLE = 'obstacle',
  RETURN_CARD = 'return_card',
  REMOVE_NEGATIVE_EFFECT = 'remove_negative_effect',
  FREEZE = 'freeze',
  POISON = 'poison',
  ENERGY_DRAIN = 'energy_drain',
  WEAKEN = 'weaken',
  HEAL = 'heal',
  CHAIN_DAMAGE = 'chain_damage',
  STRENGTH = 'strength',
  DEFENSE = 'defense',
  VULNERABLE = 'vulnerable',
  BOOST_ELEMENT = 'boost_element',
  SHIELD = 'shield'
}

export enum Target {
  SELF = 'self',
  SINGLE_ALLY = 'single_ally',
  ALL_ALLIES = 'all_allies',
  SINGLE_ENEMY = 'single_enemy',
  ALL_ENEMIES = 'all_enemies',
  AREA = 'area',
  ADJACENT = 'adjacent',
  MULTI = 'multi'
}

// 卡牌效果接口
export interface CardEffect {
  type: CardEffectType;
  value: number;
  duration?: number;
  target?: string;
  condition?: string;
}

// 角色接口
export interface Character {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  position: GridCoord;
  effects: StatusEffect[];
  abilities: Ability[];
  // 添加角色选择场景需要的属性
  avatarUrl?: string;
  description?: string;
}

// 敌人接口
export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  intent: string;
  damage: number;
  position: GridCoord;
  effects: StatusEffect[];
  abilities: Ability[];
  imageUrl: string;
}

// 正方形坐标接口
export interface GridCoord {
  x: number; // 列坐标
  y: number; // 行坐标
}

// 地图格子接口
export interface GridTile {
  coord: GridCoord;
  terrain: TerrainType;
  entity?: Character | Enemy | null;
  effects: StatusEffect[];
}

// 战场接口
export interface Battlefield {
  tiles: GridTile[][];
  width: number;
  height: number;
}

// 状态效果接口
export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  duration: number;
  value: number;
  type: CardEffectType;
  imageUrl: string;
  target?: string; // 添加可选的 target 属性，用于指定效果的目标（如元素类型）
}

// 能力接口
export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  cost: number;
  effects: CardEffect[];
}

// 神谕事件接口
export interface OracleEvent {
  id: string;
  name: string;
  description: string;
  deity: DeityType;
  effects: GameEffect[];
  imageUrl: string;
}

// 游戏效果接口
export interface GameEffect {
  type: string;
  value: number;
  target?: string; // 修改为可选属性
  timing?: string; // 效果触发时机
  description?: string; // 添加描述属性
}

// 游戏状态接口
export interface GameState {
  player: Character;
  enemies: Enemy[];
  battlefield: Battlefield;
  currentFloor: number;
  totalFloors: number;
  oracleEvents: OracleEvent[];
  activeEvent?: OracleEvent;
  destinyCoins: number;
  turn: number;
  phase: GamePhase;
}

// 游戏阶段枚举
export enum GamePhase {
  DRAW = 'draw',
  PLAYER_TURN = 'playerTurn',
  ENEMY_TURN = 'enemyTurn',
  EVENT = 'event',
  REWARD = 'reward',
  SHOP = 'shop',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory'
}

// 移动轨迹接口
export interface MovementTrail {
  path: GridCoord[];
  pattern: MovementPattern;
}

// 移动模式枚举
export enum MovementPattern {
  LINEAR = 'linear',
  CIRCULAR = 'circular',
  ZIGZAG = 'zigzag',
  STATIC = 'static'
}

// 遗物接口
export interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: string; // 修改为string类型，以匹配'common', 'rare', 'epic', 'legendary'等值
  effects: GameEffect[];
  icon?: string; // 添加icon属性
  unlockCondition?: string; // 添加解锁条件
  lore?: string; // 添加遗物传说
  isUnlocked?: boolean; // 添加isUnlocked属性
  imageUrl?: string; // 添加imageUrl属性
}

// 成就接口
export interface Achievement {
  id: string;
  name: string;
  description: string;
  requiredProgress: number; // 修改名称，使其更明确
  progress: number;
  total?: number; // 添加total属性
  isUnlocked?: boolean; // 添加isUnlocked属性
  completed?: boolean;
  reward?: {
    type: string;
    value: number;
    id?: string;
  }; // 修改reward类型
  requirement: string;
}

// 用户设置接口
export interface UserSettings {
  musicVolume: number;
  sfxVolume: number;
  language: string;
  showTutorials: boolean;
  enableParticles: boolean;
  enableScreenShake: boolean;
}

// 用户进度接口
export interface UserProgress {
  unlockedCharacters: string[];
  unlockedRelics: Relic[];
  achievements: Achievement[];
  achievementIds?: string[];
  highestFloor: number;
  totalRuns: number;
  totalVictories: number;
  totalDeaths: number;
  level?: number;
  unlockedCardIds?: string[];
  destinyPoints?: number;
  destinyCoins?: number;
  maxHealthBonus?: number;
  maxEnergyBonus?: number;
  customCards?: any[];
  floorsCleared?: number; // 添加已清理的楼层数
  experience?: number; // 添加经验值
}

// 命运轮盘接口
export interface DestinyWheel {
  deities: DeityType[];
  activeDeity?: DeityType;
  blessings: GameEffect[];
}
