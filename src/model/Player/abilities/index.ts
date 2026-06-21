import { Ability } from "../Ability";
import { attacks } from "./attacks";
import { defences } from "./defences";
import { dodges } from "./dodges";

export type AbilityId = string;

/** Полный каталог всех способностей игры. */
export const ABILITIES: Ability[] = [...attacks, ...defences, ...dodges];

const byId = new Map<AbilityId, Ability>(ABILITIES.map((a) => [a.id, a]));

export function getAbility(id: AbilityId): Ability {
  const ability = byId.get(id);
  if (!ability) {
    throw new Error(`Нет способности с id: ${id}`);
  }
  return ability;
}

export function getAbilities(ids: AbilityId[]): Ability[] {
  return ids.map(getAbility);
}
