import {
  StatusEffect,
  StatusEffectFlags,
  StatusEffectModifiers,
  StatusEffectPolarity,
} from "../StatusEffect";
import { Fighter } from "../Fighter";

type EffectInput = {
  id: string;
  name: string;
  polarity: StatusEffectPolarity;
  durationRounds: number;
  modifiers?: StatusEffectModifiers;
  flags?: StatusEffectFlags;
  custom?: (fighter: Fighter) => void;
};

/** Эффект без встроенного тика — чистые модификаторы стат/флаги механик. */
export const modifierEffect = (props: EffectInput): StatusEffect => ({ ...props });

type DamageOverTimeInput = EffectInput & { hpPerRound: number };

/** Эффект, отнимающий фиксированный HP в конце каждого раунда, пока активен (кровотечение и т.п.). */
export const damageOverTime = (props: DamageOverTimeInput): StatusEffect => {
  const { hpPerRound, ...rest } = props;
  return {
    ...rest,
    onRoundEnd: (fighter) => {
      fighter.health.makeDamage(hpPerRound, "point");
    },
  };
};
