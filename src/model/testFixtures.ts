import { SeededRng } from "./Rng";
import { Combatant } from "./Battle/Combatant";
import { FighterStatsDTO } from "./Battle/matchTypes";
import { Fighter } from "./Player/Fighter";
import { FighterProfile } from "./Player/FighterProfile";
import { FightingStyleId, getFightingStyle, getStyleAbilities } from "./Player/FightingStyle";

/** Общие билдеры для тестов модели — единая точка правды вместо копипасты по файлам. */

const DEFAULT_STATS: FighterStatsDTO = {
  power: 5,
  agility: 5,
  stamina: 5,
  speed: 5,
  luck: 5,
};

export type FighterOverrides = {
  name?: string;
  styleId?: FightingStyleId;
  stats?: Partial<FighterStatsDTO>;
};

export function makeProfile(overrides: FighterOverrides = {}): FighterProfile {
  const styleId = overrides.styleId ?? "boxer";
  const style = getFightingStyle(styleId);
  return new FighterProfile(
    overrides.name ?? "Тест",
    style.abilityIds,
    { ...DEFAULT_STATS, ...overrides.stats },
    style.id
  );
}

/** Собирает `Fighter` напрямую из стиля, без randomness — детерминированные статы для тестов. */
export function makeFighter(overrides: FighterOverrides = {}): Fighter {
  const styleId = overrides.styleId ?? "boxer";
  const style = getFightingStyle(styleId);
  const stats = { ...DEFAULT_STATS, ...overrides.stats };
  return new Fighter(overrides.name ?? "Тест", getStyleAbilities(style), stats, new SeededRng(1));
}

/** Боец в контексте боя с детерминированным RNG. */
export function makeCombatant(overrides: FighterOverrides = {}, seed = 1): Combatant {
  const fighter = makeFighter(overrides);
  return new Combatant(fighter, new SeededRng(seed));
}
