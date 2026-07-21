import { FighterProfile } from "../../model/Player/FighterProfile";
import { getFightingStyle } from "../../model/Player/FightingStyle";
import { abilityRegistry } from "../../model/Player/abilities/AbilityRegistry";
import type { CharacterInfoViewState } from "../../screens/CharacterInfoScreen/CharacterInfoScreen";

export function buildCharacterInfoState(
  profile: FighterProfile | undefined
): CharacterInfoViewState {
  if (!profile) {
    return {
      name: "Безымянный боец",
      style: "Не выбран",
      maxHealth: 0,
      stats: { power: 0, agility: 0, stamina: 0, speed: 0, luck: 0 },
      abilities: [],
    };
  }

  return {
    name: profile.name,
    style: profile.styleId
      ? getFightingStyle(profile.styleId).name
      : "Не выбран",
    maxHealth: profile.maxHp,
    stats: { ...profile.stats },
    abilities: abilityRegistry
      .getMany(profile.abilityIds)
      .map((ability) => ability.name),
  };
}
