import { Ability } from "./Ability";
import { AbilityId, getAbilities } from "./abilities";

export type FightingStyleId = "street" | "karate" | "boxer";

export type FightingStyle = {
  id: FightingStyleId;
  name: string;
  description: string;
  abilityIds: AbilityId[];
};

export const FIGHTING_STYLES: FightingStyle[] = [
  {
    id: "street",
    name: "Уличный",
    description: "Грязная драка: бьёт и уходит с линии атаки",
    abilityIds: ["simple_punch", "kick", "step_right", "step_left"],
  },
  {
    id: "karate",
    name: "Карате",
    description: "Удары ногами и уклонения по вертикали",
    abilityIds: ["kick", "hard_punch", "jump", "duck"],
  },
  {
    id: "boxer",
    name: "Боксёр",
    description: "Серии ударов руками и крепкие блоки",
    abilityIds: ["simple_punch", "hard_punch", "one_hand_block", "two_hands_block"],
  },
];

export function getStyleAbilities(style: FightingStyle): Ability[] {
  return getAbilities(style.abilityIds);
}

export function getFightingStyle(id: FightingStyleId): FightingStyle {
  const style = FIGHTING_STYLES.find((item) => item.id === id);
  if (!style) {
    throw new Error(`Неизвестный стиль боя: ${id}`);
  }
  return style;
}
