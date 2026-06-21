import { AttackAbility } from "../Player/Ability";
import { Fighter } from "../Player/Fighter";

/**
 * Единая формула урона на всю игру. Приёмы хранят только конфиг (DamageConfig),
 * а баланс крутится здесь в одном месте.
 */
export function calculateDamage(
  ability: AttackAbility,
  attacker: Fighter,
  distance: number
): number {
  const cfg = ability.damage;

  if (cfg.custom) {
    return cfg.custom(attacker, distance);
  }

  const base = cfg.base[distance] ?? 0;

  return (
    base +
    attacker.power * (cfg.power ?? 0) +
    attacker.agility * (cfg.agility ?? 0)
  );
}
