import { AttackAbility } from "../Player/Ability";
import { Fighter } from "../Player/Fighter";

/**
 * Единая формула урона на всю игру. Приёмы хранят только конфиг (DamageConfig),
 * а баланс крутится здесь в одном месте.
 */
export function calculateDamage(ability: AttackAbility, attacker: Fighter): number {
  const cfg = ability.damage;

  if (cfg.custom) {
    return cfg.custom(attacker);
  }

  const mods = attacker.effectModifiers();
  const power = attacker.power + mods.powerDelta;
  const agility = attacker.agility + mods.agilityDelta;

  return cfg.base + power * (cfg.power ?? 0) + agility * (cfg.agility ?? 0);
}
