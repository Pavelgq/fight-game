import { describe, expect, it } from "vitest";
import { calculateDamage } from "./DamageCalculator";
import { AttackAbility } from "../Player/Ability";
import { makeFighter } from "../testFixtures";

function makeAttack(overrides: Partial<ConstructorParameters<typeof AttackAbility>[0]> = {}) {
  return new AttackAbility({
    id: "test_attack",
    name: "Тестовый удар",
    speed: 2,
    reach: 1,
    damage: { base: 10 },
    ...overrides,
  });
}

describe("calculateDamage", () => {
  it("returns the base damage when no power/agility scaling is configured", () => {
    const attacker = makeFighter({ stats: { power: 7, agility: 3 } });
    const ability = makeAttack({ damage: { base: 10 } });
    expect(calculateDamage(ability, attacker)).toBe(10);
  });

  it("scales with attacker power", () => {
    const attacker = makeFighter({ stats: { power: 8 } });
    const ability = makeAttack({ damage: { base: 4, power: 0.5 } });
    expect(calculateDamage(ability, attacker)).toBe(4 + 8 * 0.5);
  });

  it("scales with attacker agility", () => {
    const attacker = makeFighter({ stats: { agility: 6 } });
    const ability = makeAttack({ damage: { base: 5, agility: 0.4 } });
    expect(calculateDamage(ability, attacker)).toBe(5 + 6 * 0.4);
  });

  it("combines power and agility scaling", () => {
    const attacker = makeFighter({ stats: { power: 8, agility: 4 } });
    const ability = makeAttack({ damage: { base: 2, power: 0.5, agility: 0.25 } });
    expect(calculateDamage(ability, attacker)).toBe(2 + 8 * 0.5 + 4 * 0.25);
  });

  it("uses the custom formula when provided, ignoring base/power/agility", () => {
    const attacker = makeFighter({ stats: { power: 100, agility: 100 } });
    const ability = makeAttack({
      damage: { base: 999, power: 999, custom: () => 3 },
    });
    expect(calculateDamage(ability, attacker)).toBe(3);
  });
});
