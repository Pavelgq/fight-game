import { Fighter } from "./Fighter";

export type StatusEffectId = string;
export type StatusEffectPolarity = "positive" | "negative";

/** Числовые модификаторы, которые читаются «по запросу» местами вроде DamageCalculator/roundBudget. */
export type StatusEffectModifiers = {
  powerDelta?: number;
  agilityDelta?: number;
  /** Сдвиг бюджета времени раунда (см. roundBudget's fatigueRelief). */
  budgetDelta?: number;
  /** Множитель входящего урона (< 1 — уязвимость снижена, > 1 — повышена). */
  damageTakenMultiplier?: number;
};

/** Флаги механик — читаются в конкретных точках resolveRound. Растёт по мере надобности. */
export type StatusEffectFlags = {
  blockDisabled?: boolean;
  dodgeDisabled?: boolean;
};

/**
 * Определение эффекта (контент, неизменяемые данные) — по аналогии с Ability.
 * Экземпляр на бойце — это ActiveStatusEffect (эта definition + оставшиеся раунды).
 */
export type StatusEffect = {
  id: StatusEffectId;
  name: string;
  polarity: StatusEffectPolarity;
  durationRounds: number;
  modifiers?: StatusEffectModifiers;
  flags?: StatusEffectFlags;
  /** Разовое действие в конце каждого раунда, пока эффект активен (напр. урон от кровотечения). */
  onRoundEnd?: (fighter: Fighter) => void;
  /** Escape hatch для логики, не выражаемой через modifiers/flags/onRoundEnd — как DamageConfig.custom. */
  custom?: (fighter: Fighter) => void;
};

/** Активный на бойце эффект: definition + сколько раундов ему осталось. */
export type ActiveStatusEffect = {
  effect: StatusEffect;
  roundsRemaining: number;
};
