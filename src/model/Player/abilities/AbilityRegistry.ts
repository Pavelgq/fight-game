import { Ability } from "../Ability";
import { ABILITIES, getAbility, getAbilities } from "./index";

export type AbilityId = string;

/** Реестр контента: определения карт по стабильному id. */
export const abilityRegistry = {
  all(): Ability[] {
    return ABILITIES;
  },

  get(id: AbilityId): Ability {
    return getAbility(id);
  },

  getMany(ids: AbilityId[]): Ability[] {
    return getAbilities(ids);
  },

  has(id: AbilityId): boolean {
    return ABILITIES.some((a) => a.id === id);
  },
};

export { getAbility, getAbilities, ABILITIES };
