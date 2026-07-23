import { describe, expect, it } from "vitest";
import { Ability, AttackAbility } from "./Ability";
import { AvailableSectionState } from "../Battle/zones";

describe("Ability", () => {
  it("defaults availableSector to every cell allowed", () => {
    const ability = new Ability({ id: "a", type: "defence", name: "A", speed: 1 });
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        expect(ability.checkAvailableSector(row, col)).toBe(true);
      }
    }
  });

  it("respects a custom availableSector", () => {
    const onlyHead: AvailableSectionState = [
      [true, true, true],
      [false, false, false],
      [false, false, false],
    ];
    const ability = new Ability({ id: "a", type: "defence", name: "A", speed: 1, availableSector: onlyHead });
    expect(ability.checkAvailableSector(0, 1)).toBe(true);
    expect(ability.checkAvailableSector(1, 1)).toBe(false);
  });
});

describe("AttackAbility", () => {
  it("baseDamage exposes the configured base damage", () => {
    const attack = new AttackAbility({
      id: "a",
      name: "A",
      speed: 2,
      reach: 1,
      damage: { base: 12, power: 0.4 },
    });
    expect(attack.baseDamage).toBe(12);
  });

  it("canReachColumn allows any distance within reach", () => {
    const attack = new AttackAbility({ id: "a", name: "A", speed: 2, reach: 1, damage: { base: 1 } });
    expect(attack.canReachColumn(1, 0)).toBe(true);
    expect(attack.canReachColumn(1, 2)).toBe(true);
    expect(attack.canReachColumn(1, 1)).toBe(true);
  });

  it("canReachColumn rejects distances beyond reach", () => {
    const attack = new AttackAbility({ id: "a", name: "A", speed: 2, reach: 1, damage: { base: 1 } });
    expect(attack.canReachColumn(0, 2)).toBe(false);
  });

  it("reach 0 only allows the attacker's own column", () => {
    const attack = new AttackAbility({ id: "a", name: "A", speed: 2, reach: 0, damage: { base: 1 } });
    expect(attack.canReachColumn(1, 1)).toBe(true);
    expect(attack.canReachColumn(1, 0)).toBe(false);
    expect(attack.canReachColumn(1, 2)).toBe(false);
  });

  it("reach 2 allows any column regardless of stance", () => {
    const attack = new AttackAbility({ id: "a", name: "A", speed: 2, reach: 2, damage: { base: 1 } });
    expect(attack.canReachColumn(0, 2)).toBe(true);
  });
});
