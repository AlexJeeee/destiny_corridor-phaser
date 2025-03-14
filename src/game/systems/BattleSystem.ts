import Phaser from 'phaser';
import { Character, Enemy, Card, GridCoord, CardPosition } from '@/types';
import { gridDistance } from '@/utils/battlefieldUtils';

// 战斗系统类
export class BattleSystem {
  private scene: Phaser.Scene;
  private player: Character;
  private enemies: Enemy[] = [];
  private currentTurn: 'player' | 'enemy' = 'player';
  private turnCount: number = 1;
  private selectedCard: Card | null = null;
  private selectedEnemy: Enemy | null = null;
  private onTurnEnd: () => void;
  private onBattleEnd: (victory: boolean) => void;

  constructor(scene: Phaser.Scene, player: Character, enemies: Enemy[], 
              onTurnEnd: () => void, onBattleEnd: (victory: boolean) => void) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    this.onTurnEnd = onTurnEnd;
    this.onBattleEnd = onBattleEnd;
  }

  // 开始战斗
  startBattle(): void {
    console.log('战斗开始！');
    this.drawInitialHand();
    this.startPlayerTurn();
  }

  // 抽取初始手牌
  private drawInitialHand(): void {
    // 确保玩家的手牌为空
    this.player.hand = [];
    
    // 从牌库中抽取5张牌
    for (let i = 0; i < 5; i++) {
      this.drawCard();
    }
  }

  // 从牌库抽一张牌
  drawCard(): void {
    if (this.player.deck.length === 0) {
      // 如果牌库为空，将弃牌堆洗入牌库
      this.shuffleDiscardIntoDeck();
    }

    if (this.player.deck.length > 0) {
      const card = this.player.deck.shift();
      if (card) {
        this.player.hand.push(card);
        console.log(`抽到了卡牌: ${card.name}`);
      }
    } else {
      console.log('牌库和弃牌堆都为空，无法抽牌');
    }
  }

  // 将弃牌堆洗入牌库
  private shuffleDiscardIntoDeck(): void {
    if (this.player.discard.length === 0) return;
    
    // 将弃牌堆中的牌复制到牌库中
    this.player.deck = [...this.player.discard];
    
    // 清空弃牌堆
    this.player.discard = [];
    
    // 洗牌
    this.shuffleDeck();
    
    console.log('弃牌堆已洗入牌库');
  }

  // 洗牌
  private shuffleDeck(): void {
    for (let i = this.player.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.player.deck[i], this.player.deck[j]] = [this.player.deck[j], this.player.deck[i]];
    }
  }

  // 开始玩家回合
  startPlayerTurn(): void {
    this.currentTurn = 'player';
    this.player.energy = this.player.maxEnergy;
    
    // 抽一张牌
    if (this.turnCount > 1) {
      this.drawCard();
    }
    
    // 减少技能冷却时间
    this.player.abilities.forEach(ability => {
      if (ability.currentCooldown > 0) {
        ability.currentCooldown--;
      }
    });
    
    // 处理状态效果
    this.processStatusEffects(this.player);
    
    console.log(`玩家回合 ${this.turnCount} 开始`);
  }

  // 结束玩家回合
  endPlayerTurn(): void {
    console.log('玩家回合结束');
    this.startEnemyTurn();
  }

  // 开始敌人回合
  startEnemyTurn(): void {
    this.currentTurn = 'enemy';
    console.log('敌人回合开始');
    
    // 处理每个敌人的行动
    for (const enemy of this.enemies) {
      if (enemy.health <= 0) continue;
      
      // 处理状态效果
      this.processStatusEffects(enemy);
      
      // 减少技能冷却时间
      enemy.abilities.forEach(ability => {
        if (ability.currentCooldown > 0) {
          ability.currentCooldown--;
        }
      });
      
      // 执行敌人行动
      this.executeEnemyAction(enemy);
    }
    
    // 检查战斗是否结束
    if (this.player.health <= 0) {
      this.endBattle(false);
      return;
    }
    
    if (this.enemies.every(enemy => enemy.health <= 0)) {
      this.endBattle(true);
      return;
    }
    
    // 结束敌人回合，开始新的玩家回合
    this.turnCount++;
    this.onTurnEnd();
    this.startPlayerTurn();
  }

  // 执行敌人行动
  private executeEnemyAction(enemy: Enemy): void {
    // 根据敌人的意图执行不同的行动
    switch (enemy.intent) {
      case 'attack':
        this.executeEnemyAttack(enemy);
        break;
      case 'defend':
        this.executeEnemyDefend(enemy);
        break;
      case 'buff':
        this.executeEnemyBuff(enemy);
        break;
      case 'debuff':
        this.executeEnemyDebuff(enemy);
        break;
      default:
        console.log(`敌人 ${enemy.name} 没有行动`);
    }
    
    // 随机更新敌人的下一个意图
    this.updateEnemyIntent(enemy);
  }

  // 执行敌人攻击
  private executeEnemyAttack(enemy: Enemy): void {
    console.log(`敌人 ${enemy.name} 发动攻击`);
    
    // 查找可用的攻击技能
    const attackAbility = enemy.abilities.find(ability => 
      ability.effects.some(effect => effect.type === 'damage') && 
      ability.currentCooldown === 0
    );
    
    if (attackAbility) {
      console.log(`敌人使用技能: ${attackAbility.name}`);
      
      // 计算伤害
      const damageEffect = attackAbility.effects.find(effect => effect.type === 'damage');
      let damage = damageEffect ? damageEffect.value : enemy.damage;
      
      // 应用伤害到玩家
      this.player.health = Math.max(0, this.player.health - damage);
      
      console.log(`玩家受到 ${damage} 点伤害，剩余生命值: ${this.player.health}`);
      
      // 设置技能冷却
      attackAbility.currentCooldown = attackAbility.cooldown;
    } else {
      // 使用基础攻击
      console.log(`敌人使用基础攻击`);
      
      // 应用伤害到玩家
      this.player.health = Math.max(0, this.player.health - enemy.damage);
      
      console.log(`玩家受到 ${enemy.damage} 点伤害，剩余生命值: ${this.player.health}`);
    }
  }

  // 执行敌人防御
  private executeEnemyDefend(enemy: Enemy): void {
    console.log(`敌人 ${enemy.name} 进入防御状态`);
    
    // 添加防御效果
    enemy.effects.push({
      id: `defense_${Date.now()}`,
      name: '防御',
      description: '减少受到的伤害',
      imageUrl: 'assets/images/effects/defense.png',
      type: 'defense',
      value: Math.floor(enemy.damage * 1.5),
      duration: 1
    });
  }

  // 执行敌人增益
  private executeEnemyBuff(enemy: Enemy): void {
    console.log(`敌人 ${enemy.name} 使用增益效果`);
    
    // 查找可用的增益技能
    const buffAbility = enemy.abilities.find(ability => 
      ability.effects.some(effect => 
        effect.type === 'strength' || 
        effect.type === 'defense' || 
        effect.type === 'heal'
      ) && 
      ability.currentCooldown === 0
    );
    
    if (buffAbility) {
      console.log(`敌人使用技能: ${buffAbility.name}`);
      
      // 应用增益效果
      buffAbility.effects.forEach(effect => {
        if (effect.type === 'heal') {
          // 治疗效果
          enemy.health = Math.min(enemy.maxHealth, enemy.health + effect.value);
          console.log(`敌人恢复了 ${effect.value} 点生命值，当前生命值: ${enemy.health}`);
        } else {
          // 其他增益效果
          enemy.effects.push({
            id: `${effect.type}_${Date.now()}`,
            name: this.getEffectName(effect.type),
            description: this.getEffectDescription(effect.type),
            imageUrl: `assets/images/effects/${effect.type}.png`,
            type: effect.type,
            value: effect.value,
            duration: effect.duration || 2
          });
          console.log(`敌人获得了 ${effect.type} 效果，持续 ${effect.duration || 2} 回合`);
        }
      });
      
      // 设置技能冷却
      buffAbility.currentCooldown = buffAbility.cooldown;
    } else {
      console.log(`敌人没有可用的增益技能，改为防御`);
      this.executeEnemyDefend(enemy);
    }
  }

  // 执行敌人减益
  private executeEnemyDebuff(enemy: Enemy): void {
    console.log(`敌人 ${enemy.name} 使用减益效果`);
    
    // 查找可用的减益技能
    const debuffAbility = enemy.abilities.find(ability => 
      ability.effects.some(effect => 
        effect.type === 'weakness' || 
        effect.type === 'vulnerable' || 
        effect.type === 'poison'
      ) && 
      ability.currentCooldown === 0
    );
    
    if (debuffAbility) {
      console.log(`敌人使用技能: ${debuffAbility.name}`);
      
      // 应用减益效果到玩家
      debuffAbility.effects.forEach(effect => {
        this.player.effects.push({
          id: `${effect.type}_${Date.now()}`,
          name: this.getEffectName(effect.type),
          description: this.getEffectDescription(effect.type),
          imageUrl: `assets/images/effects/${effect.type}.png`,
          type: effect.type,
          value: effect.value,
          duration: effect.duration || 2
        });
        console.log(`玩家受到了 ${effect.type} 效果，持续 ${effect.duration || 2} 回合`);
      });
      
      // 设置技能冷却
      debuffAbility.currentCooldown = debuffAbility.cooldown;
    } else {
      console.log(`敌人没有可用的减益技能，改为攻击`);
      this.executeEnemyAttack(enemy);
    }
  }

  // 更新敌人意图
  private updateEnemyIntent(enemy: Enemy): void {
    const intents = ['attack', 'defend', 'buff', 'debuff'];
    const weights = [0.6, 0.2, 0.1, 0.1]; // 权重，攻击概率更高
    
    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        enemy.intent = intents[i] as any;
        break;
      }
      random -= weights[i];
    }
  }

  // 处理状态效果
  private processStatusEffects(entity: Character | Enemy): void {
    // 复制一份效果列表，避免在遍历过程中修改原列表
    const effects = [...entity.effects];
    
    // 清空原效果列表
    entity.effects = [];
    
    // 处理每个效果
    for (const effect of effects) {
      // 减少持续时间
      effect.duration = effect.duration ? effect.duration - 1 : 0;
      
      // 应用效果
      switch (effect.type) {
        case 'poison':
          // 中毒效果，每回合造成伤害
          const poisonDamage = effect.value;
          entity.health = Math.max(0, entity.health - poisonDamage);
          console.log(`${entity.name} 受到 ${poisonDamage} 点中毒伤害，剩余生命值: ${entity.health}`);
          break;
        case 'block':
          // 防御效果在这里不需要特殊处理，只需要保留到下一回合
          console.log(`${entity.name} 有 ${effect.value} 点护盾`);
          break;
        // 可以添加更多效果类型的处理
      }
      
      // 如果效果还有持续时间，则保留
      if (effect.duration > 0) {
        entity.effects.push(effect);
      } else {
        console.log(`${entity.name} 的 ${effect.type} 效果已结束`);
      }
    }
  }

  // 获取效果名称
  private getEffectName(effectType: string): string {
    switch (effectType) {
      case 'strength': return '力量增强';
      case 'defense': return '防御增强';
      case 'weakness': return '虚弱';
      case 'vulnerable': return '易伤';
      case 'poison': return '中毒';
      case 'boost_element': return '元素增强';
      case 'block': return '护盾';
      default: return effectType;
    }
  }
  
  // 获取效果描述
  private getEffectDescription(effectType: string): string {
    switch (effectType) {
      case 'strength': return '增加攻击伤害';
      case 'defense': return '减少受到的伤害';
      case 'weakness': return '降低攻击伤害';
      case 'vulnerable': return '增加受到的伤害';
      case 'poison': return '每回合受到伤害';
      case 'boost_element': return '增强特定元素的效果';
      case 'block': return '减少受到的伤害';
      default: return '状态效果';
    }
  }

  // 使用卡牌
  useCard(card: Card, target?: Enemy): boolean {
    // 检查是否是玩家回合
    if (this.currentTurn !== 'player') {
      console.log('不是玩家回合，无法使用卡牌');
      return false;
    }
    
    // 检查能量是否足够
    if (this.player.energy < card.cost) {
      console.log('能量不足，无法使用卡牌');
      return false;
    }
    
    console.log(`使用卡牌: ${card.name}`);
    
    // 消耗能量
    this.player.energy -= card.cost;
    
    // 从手牌中移除
    const cardIndex = this.player.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      this.player.hand.splice(cardIndex, 1);
    }
    
    // 应用卡牌效果
    this.applyCardEffects(card, target);
    
    // 将卡牌放入弃牌堆
    this.player.discard.push(card);
    
    return true;
  }

  // 对自己使用卡牌（治疗或防御）
  useCardOnSelf(card: Card): boolean {
    // 检查是否是玩家回合
    if (this.currentTurn !== 'player') {
      console.log('不是玩家回合，无法使用卡牌');
      return false;
    }
    
    // 检查能量是否足够
    if (this.player.energy < card.cost) {
      console.log('能量不足，无法使用卡牌');
      return false;
    }
    
    console.log(`对自己使用卡牌: ${card.name}`);
    
    // 消耗能量
    this.player.energy -= card.cost;
    
    // 从手牌中移除
    const cardIndex = this.player.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      this.player.hand.splice(cardIndex, 1);
    }
    
    // 根据卡牌的正逆位状态应用不同效果
    const isUpright = card.position === CardPosition.UPRIGHT;
    
    // 获取对应的效果
    const effects = isUpright ? card.uprightEffect : card.reversedEffect;
    console.log(`应用${isUpright ? '正位' : '逆位'}效果`);
    
    // 应用卡牌效果
    for (const effect of effects) {
      if (effect.type === 'heal') {
        this.applyHealEffect(effect);
      } else if (effect.type === 'block') {
        this.applyBlockEffect(effect);
      }
      // 其他可能的自我效果
    }
    
    // 将卡牌放入弃牌堆
    this.player.discard.push(card);
    
    return true;
  }

  // 应用卡牌效果
  private applyCardEffects(card: Card, target?: Enemy): void {
    // 根据卡牌的正逆位状态应用不同效果
    const isUpright = card.position === CardPosition.UPRIGHT;
    
    // 获取对应的效果
    const effects = isUpright ? card.uprightEffect : card.reversedEffect;
    console.log(`应用${isUpright ? '正位' : '逆位'}效果`);
    
    // 应用卡牌效果
    for (const effect of effects) {
      switch (effect.type) {
        case 'damage':
          this.applyDamageEffect(effect, target, card);
          break;
        case 'heal':
          this.applyHealEffect(effect);
          break;
        case 'block':
          this.applyBlockEffect(effect);
          break;
        case 'draw':
          this.applyDrawEffect(effect);
          break;
        case 'energy':
          this.applyEnergyEffect(effect);
          break;
        case 'aoe_damage':
          this.applyAoeDamageEffect(effect, target, card);
          break;
        // 可以添加更多效果类型的处理
      }
    }
  }

  // 应用治疗效果
  private applyHealEffect(effect: any): void {
    const healAmount = effect.value;
    
    if (effect.target === 'self' || effect.target === 'single_ally') {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
      console.log(`玩家恢复了 ${healAmount} 点生命值，当前生命值: ${this.player.health}`);
    } else if (effect.target === 'all_allies') {
      // 如果有队友系统，可以在这里添加对所有队友的治疗
      this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
      console.log(`所有友方单位恢复了 ${healAmount} 点生命值`);
    }
  }

  // 应用防御效果
  private applyBlockEffect(effect: any): void {
    const blockAmount = effect.value;
    
    if (effect.target === 'self') {
      // 添加防御效果到玩家
      this.player.effects.push({
        id: `block_${Date.now()}`,
        name: '护盾',
        description: '减少受到的伤害',
        imageUrl: 'assets/images/effects/block.png',
        type: 'block',
        value: blockAmount,
        duration: 1 // 防御效果通常持续到下一回合
      });
      console.log(`玩家获得了 ${blockAmount} 点护盾`);
    } else if (effect.target === 'single_ally') {
      // 如果有队友系统，可以在这里添加对特定队友的防御
      this.player.effects.push({
        id: `block_${Date.now()}`,
        name: '护盾',
        description: '减少受到的伤害',
        imageUrl: 'assets/images/effects/block.png',
        type: 'block',
        value: blockAmount,
        duration: 1
      });
      console.log(`目标友方单位获得了 ${blockAmount} 点护盾`);
    }
  }

  // 应用抽牌效果
  private applyDrawEffect(effect: any): void {
    const drawCount = effect.value;
    for (let i = 0; i < drawCount; i++) {
      this.drawCard();
    }
  }

  // 应用能量效果
  private applyEnergyEffect(effect: any): void {
    const energyAmount = effect.value;
    this.player.energy += energyAmount;
    console.log(`玩家获得了 ${energyAmount} 点能量，当前能量: ${this.player.energy}`);
  }

  // 应用范围伤害效果
  private applyAoeDamageEffect(effect: any, target?: Enemy, card?: Card): void {
    if (!target && effect.target !== 'all') {
      console.log('需要选择目标敌人');
      return;
    }
    
    let damage = effect.value;
    
    // 应用元素加成
    if (card && this.player.effects.some(e => e.type === 'boost_element' && e.target === card.element)) {
      const boost = this.player.effects.find(e => e.type === 'boost_element' && e.target === card.element);
      if (boost) {
        damage = Math.floor(damage * (1 + boost.value));
        console.log(`元素加成: 伤害提升至 ${damage}`);
      }
    }
    
    if (effect.target === 'all') {
      // 对所有敌人造成伤害
      for (const enemy of this.enemies) {
        if (enemy.health > 0) {
          enemy.health = Math.max(0, enemy.health - damage);
          console.log(`对 ${enemy.name} 造成 ${damage} 点伤害，剩余生命值: ${enemy.health}`);
        }
      }
    } else if (effect.target === 'adjacent' && target) {
      // 对目标周围敌人造成伤害
      for (const enemy of this.enemies) {
        if (enemy.health > 0 && enemy.id !== target.id) {
          const distance = gridDistance(enemy.position, target.position);
          if (distance <= 1) { // 相邻距离为1
            enemy.health = Math.max(0, enemy.health - damage);
            console.log(`对相邻敌人 ${enemy.name} 造成 ${damage} 点伤害，剩余生命值: ${enemy.health}`);
          }
        }
      }
    }
  }

  // 应用伤害效果
  private applyDamageEffect(effect: any, target?: Enemy, card?: Card): void {
    if (!target && effect.target === 'single') {
      console.log('需要选择目标敌人');
      return;
    }
    
    let damage = effect.value;
    
    // 应用元素加成
    if (card && this.player.effects.some(e => e.type === 'boost_element' && e.target === card.element)) {
      const boost = this.player.effects.find(e => e.type === 'boost_element' && e.target === card.element);
      if (boost) {
        damage = Math.floor(damage * (1 + boost.value));
        console.log(`元素加成: 伤害提升至 ${damage}`);
      }
    }
    
    if (effect.target === 'single' && target) {
      // 检查目标是否有防御效果
      const blockEffect = target.effects.find(e => e.type === 'block');
      if (blockEffect) {
        if (blockEffect.value >= damage) {
          // 防御完全抵消伤害
          blockEffect.value -= damage;
          console.log(`${target.name} 的护盾抵消了 ${damage} 点伤害，剩余护盾: ${blockEffect.value}`);
          damage = 0;
        } else {
          // 防御部分抵消伤害
          damage -= blockEffect.value;
          console.log(`${target.name} 的护盾抵消了 ${blockEffect.value} 点伤害，剩余伤害: ${damage}`);
          blockEffect.value = 0;
        }
      }
      
      // 对单个目标造成伤害
      if (damage > 0) {
        target.health = Math.max(0, target.health - damage);
        console.log(`对 ${target.name} 造成 ${damage} 点伤害，剩余生命值: ${target.health}`);
      }
    } else if (effect.target === 'all') {
      // 对所有敌人造成伤害
      for (const enemy of this.enemies) {
        if (enemy.health > 0) {
          let enemyDamage = damage;
          
          // 检查敌人是否有防御效果
          const blockEffect = enemy.effects.find(e => e.type === 'block');
          if (blockEffect) {
            if (blockEffect.value >= enemyDamage) {
              blockEffect.value -= enemyDamage;
              console.log(`${enemy.name} 的护盾抵消了 ${enemyDamage} 点伤害，剩余护盾: ${blockEffect.value}`);
              enemyDamage = 0;
            } else {
              enemyDamage -= blockEffect.value;
              console.log(`${enemy.name} 的护盾抵消了 ${blockEffect.value} 点伤害，剩余伤害: ${enemyDamage}`);
              blockEffect.value = 0;
            }
          }
          
          if (enemyDamage > 0) {
            enemy.health = Math.max(0, enemy.health - enemyDamage);
            console.log(`对 ${enemy.name} 造成 ${enemyDamage} 点伤害，剩余生命值: ${enemy.health}`);
          }
        }
      }
    } else if (effect.target === 'area' && target) {
      // 对目标及其周围敌人造成伤害
      for (const enemy of this.enemies) {
        if (enemy.health > 0) {
          const distance = gridDistance(enemy.position, target.position);
          if (distance <= (effect.radius || 1)) {
            let enemyDamage = distance === 0 ? damage : Math.floor(damage / 2);
            
            // 检查敌人是否有防御效果
            const blockEffect = enemy.effects.find(e => e.type === 'block');
            if (blockEffect) {
              if (blockEffect.value >= enemyDamage) {
                blockEffect.value -= enemyDamage;
                console.log(`${enemy.name} 的护盾抵消了 ${enemyDamage} 点伤害，剩余护盾: ${blockEffect.value}`);
                enemyDamage = 0;
              } else {
                enemyDamage -= blockEffect.value;
                console.log(`${enemy.name} 的护盾抵消了 ${blockEffect.value} 点伤害，剩余伤害: ${enemyDamage}`);
                blockEffect.value = 0;
              }
            }
            
            if (enemyDamage > 0) {
              enemy.health = Math.max(0, enemy.health - enemyDamage);
              console.log(`对 ${enemy.name} 造成 ${enemyDamage} 点伤害，剩余生命值: ${enemy.health}`);
            }
          }
        }
      }
    }
  }

  // 结束战斗
  endBattle(victory: boolean): void {
    console.log(`战斗${victory ? '胜利' : '失败'}！`);
    this.onBattleEnd(victory);
  }

  // 获取当前回合
  getCurrentTurn(): 'player' | 'enemy' {
    return this.currentTurn;
  }

  // 获取当前回合数
  getTurnCount(): number {
    return this.turnCount;
  }

  // 获取玩家
  getPlayer(): Character {
    return this.player;
  }

  // 获取敌人列表
  getEnemies(): Enemy[] {
    return this.enemies;
  }

  // 选择卡牌
  selectCard(card: Card): void {
    this.selectedCard = card;
    console.log(`选择了卡牌: ${card.name}`);
  }

  // 取消选择卡牌
  deselectCard(): void {
    this.selectedCard = null;
    console.log('取消选择卡牌');
  }

  // 获取选中的卡牌
  getSelectedCard(): Card | null {
    return this.selectedCard;
  }

  // 选择敌人
  selectEnemy(enemy: Enemy): void {
    this.selectedEnemy = enemy;
    console.log(`选择了敌人: ${enemy.name}`);
    
    // 如果已经选择了卡牌，则自动使用
    if (this.selectedCard) {
      this.useCard(this.selectedCard, enemy);
      this.selectedCard = null;
    }
  }

  // 取消选择敌人
  deselectEnemy(): void {
    this.selectedEnemy = null;
    console.log('取消选择敌人');
  }

  // 获取选中的敌人
  getSelectedEnemy(): Enemy | null {
    return this.selectedEnemy;
  }
}
