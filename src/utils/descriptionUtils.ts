import { CardEffectType } from '@/types';

export const getEffectName = (effectType: CardEffectType): string => {
  switch (effectType) {
    case CardEffectType.DAMAGE:
      return '伤害';
    case CardEffectType.HEAL:
      return '治疗';
    case CardEffectType.DEFENSE:
      return '防御';
    case CardEffectType.POISON:
      return '毒素';
    case CardEffectType.DRAW_CARD:
      return '抽牌';
    case CardEffectType.ENERGY_GAIN:
      return '能量';
    case CardEffectType.SHIELD:
      return '护盾';
    case CardEffectType.STRENGTH:
      return '力量';
    case CardEffectType.VULNERABLE:
      return '易伤';
    case CardEffectType.WEAKEN:
      return '虚弱';
    default:
      return '未知效果';
  }
}

// 获取效果描述
export const getEffectDescription = (effectType: CardEffectType): string => {
  switch (effectType) {
    case CardEffectType.DAMAGE:
      return '造成伤害';
    case CardEffectType.HEAL:
      return '恢复生命值';
    case CardEffectType.DEFENSE:
      return '减少受到的伤害';
    case CardEffectType.POISON:
      return '每回合受到伤害';
    case CardEffectType.DRAW_CARD:
      return '抽取卡牌';
    case CardEffectType.ENERGY_GAIN:
      return '获得能量';
    case CardEffectType.SHIELD:
      return '获得护盾';
    case CardEffectType.STRENGTH:
      return '增加攻击力';
    case CardEffectType.VULNERABLE:
      return '受到的伤害增加';
    case CardEffectType.WEAKEN:
      return '造成的伤害减少';
    default:
      return '未知效果';
  }
}