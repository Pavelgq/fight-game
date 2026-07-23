import { describe, expect, it } from "vitest";
import { Fighter } from "./Fighter";
import { SeededRng } from "../Rng";
import { attack, dodge } from "./abilities/factories";
import { damageOverTime, modifierEffect } from "./statusEffects/factories";

function makeAbilities() {
  return [
    attack({ id: "atk_a", name: "A", speed: 2, reach: 1, damage: { base: 1 } }),
    attack({ id: "atk_b", name: "B", speed: 2, reach: 1, damage: { base: 1 } }),
    dodge({ id: "dodge_a", name: "D", speed: 2, guard: () => true }),
  ];
}

describe("Fighter", () => {
  it("uses provided stats instead of rolling random ones", () => {
    const fighter = new Fighter(
      "Тест",
      makeAbilities(),
      { power: 9, agility: 8, stamina: 7, speed: 6, luck: 5 },
      new SeededRng(1)
    );
    expect(fighter.power).toBe(9);
    expect(fighter.agility).toBe(8);
    expect(fighter.stamina).toBe(7);
    expect(fighter.speed).toBe(6);
    expect(fighter.luck).toBe(5);
  });

  it("derives max health from stamina (60 + stamina * 4)", () => {
    const fighter = new Fighter("Тест", makeAbilities(), { stamina: 7 }, new SeededRng(1));
    expect(fighter.health.maxValue).toBe(60 + 7 * 4);
    expect(fighter.health.currentValue).toBe(fighter.health.maxValue);
  });

  it("rolls stats deterministically from the injected rng when not provided", () => {
    const a = new Fighter("A", makeAbilities(), undefined, new SeededRng(42));
    const b = new Fighter("B", makeAbilities(), undefined, new SeededRng(42));
    expect(a.power).toBe(b.power);
    expect(a.agility).toBe(b.agility);
    expect(a.stamina).toBe(b.stamina);
    expect(a.speed).toBe(b.speed);
    expect(a.luck).toBe(b.luck);
    expect(a.power).toBeGreaterThanOrEqual(1);
    expect(a.power).toBeLessThanOrEqual(10);
  });

  it("getAbility only returns abilities matching the requested types", () => {
    const fighter = new Fighter("Тест", makeAbilities(), {}, new SeededRng(1));
    for (let i = 0; i < 20; i++) {
      const picked = fighter.getAbility(["attack"]);
      expect(picked?.type).toBe("attack");
    }
  });

  it("getAbility returns undefined when no ability matches", () => {
    const fighter = new Fighter("Тест", makeAbilities(), {}, new SeededRng(1));
    expect(fighter.getAbility(["defence"])).toBeUndefined();
  });

  it("addAbilities appends to the existing ability list", () => {
    const fighter = new Fighter("Тест", makeAbilities(), {}, new SeededRng(1));
    const before = fighter.abilities.length;
    fighter.addAbilities([attack({ id: "atk_c", name: "C", speed: 2, reach: 1, damage: { base: 1 } })]);
    expect(fighter.abilities).toHaveLength(before + 1);
  });
});

describe("Fighter status effects", () => {
  const makeFighter = () => new Fighter("Тест", makeAbilities(), {}, new SeededRng(1));

  it("addEffect adds an active effect with its full duration", () => {
    const fighter = makeFighter();
    const bleed = damageOverTime({
      id: "bleed",
      name: "Кровотечение",
      polarity: "negative",
      durationRounds: 3,
      hpPerRound: 5,
    });
    fighter.addEffect(bleed);
    expect(fighter.activeEffects).toEqual([{ effect: bleed, roundsRemaining: 3 }]);
  });

  it("re-applying an effect with the same id overwrites (resets duration) instead of stacking", () => {
    const fighter = makeFighter();
    const bleed = damageOverTime({
      id: "bleed",
      name: "Кровотечение",
      polarity: "negative",
      durationRounds: 3,
      hpPerRound: 5,
    });
    fighter.addEffect(bleed);
    fighter.tickEffects();
    expect(fighter.activeEffects[0].roundsRemaining).toBe(2);
    fighter.addEffect(bleed);
    expect(fighter.activeEffects).toHaveLength(1);
    expect(fighter.activeEffects[0].roundsRemaining).toBe(3);
  });

  it("removeEffect clears an effect before it expires naturally", () => {
    const fighter = makeFighter();
    fighter.addEffect(
      modifierEffect({ id: "buff", name: "Бафф", polarity: "positive", durationRounds: 5 })
    );
    fighter.removeEffect("buff");
    expect(fighter.activeEffects).toEqual([]);
  });

  it("tickEffects runs onRoundEnd, counts down, and expires at zero", () => {
    const fighter = makeFighter();
    const startHp = fighter.health.currentValue;
    fighter.addEffect(
      damageOverTime({
        id: "bleed",
        name: "Кровотечение",
        polarity: "negative",
        durationRounds: 2,
        hpPerRound: 5,
      })
    );

    fighter.tickEffects();
    expect(fighter.health.currentValue).toBe(startHp - 5);
    expect(fighter.activeEffects).toHaveLength(1);
    expect(fighter.activeEffects[0].roundsRemaining).toBe(1);

    fighter.tickEffects();
    expect(fighter.health.currentValue).toBe(startHp - 10);
    expect(fighter.activeEffects).toHaveLength(0);
  });

  it("hasFlag reports true only while a flag-bearing effect is active", () => {
    const fighter = makeFighter();
    expect(fighter.hasFlag("blockDisabled")).toBe(false);
    fighter.addEffect(
      modifierEffect({
        id: "stun",
        name: "Оглушение",
        polarity: "negative",
        durationRounds: 1,
        flags: { blockDisabled: true },
      })
    );
    expect(fighter.hasFlag("blockDisabled")).toBe(true);
    expect(fighter.hasFlag("dodgeDisabled")).toBe(false);
  });

  it("effectModifiers sums additive deltas and multiplies multipliers across active effects", () => {
    const fighter = makeFighter();
    fighter.addEffect(
      modifierEffect({
        id: "adrenaline",
        name: "Адреналин",
        polarity: "positive",
        durationRounds: 2,
        modifiers: { powerDelta: 2, budgetDelta: 1, damageTakenMultiplier: 0.5 },
      })
    );
    fighter.addEffect(
      modifierEffect({
        id: "weakness",
        name: "Слабость",
        polarity: "negative",
        durationRounds: 2,
        modifiers: { powerDelta: -1, agilityDelta: -1, damageTakenMultiplier: 2 },
      })
    );
    expect(fighter.effectModifiers()).toEqual({
      powerDelta: 1,
      agilityDelta: -1,
      budgetDelta: 1,
      damageTakenMultiplier: 1,
    });
  });

  it("effectModifiers returns neutral values when there are no active effects", () => {
    const fighter = makeFighter();
    expect(fighter.effectModifiers()).toEqual({
      powerDelta: 0,
      agilityDelta: 0,
      budgetDelta: 0,
      damageTakenMultiplier: 1,
    });
  });
});
