import { AbilityType } from "../model/Player/Ability";
import { abilityColors } from "../views/theme";

/** Визуальные константы для типов приёмов — слой ui/, не model/. */
export function abilityTagFill(type: AbilityType): number {
  return abilityColors[type];
}
