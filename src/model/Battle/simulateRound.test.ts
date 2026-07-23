import { describe, expect, it } from "vitest";
import { makeCombatant } from "../testFixtures";
import { abilityRegistry } from "../Player/abilities/AbilityRegistry";
import { attack } from "../Player/abilities/factories";
import { AttackAbility } from "../Player/Ability";
import { damageOverTime, modifierEffect } from "../Player/statusEffects/factories";
import { battleConfig } from "./constants";
import { applyRoundResult, resolveRound, simulateRound } from "./simulateRound";

function makeFighterCombatant(name: string, stamina = 8) {
  return makeCombatant({ name, stats: { power: 7, stamina } });
}

describe("resolveRound", () => {
  it("does not mutate HP until applyRoundResult", () => {
    const left = makeFighterCombatant("Игрок");
    const right = makeFighterCombatant("Враг");
    left.drawHand(0);
    right.drawHand(0);

    const jab = abilityRegistry.get("jab") as AttackAbility;
    left.addAbility(jab, 1, battleConfig.startStance);
    right.addStep(1);

    const hpBefore = right.fighter.health.currentValue;
    const sim = resolveRound(left, right);
    expect(right.fighter.health.currentValue).toBe(hpBefore);
    expect(sim.endHp.right).toBeLessThanOrEqual(hpBefore);

    applyRoundResult(left, right, sim);
    expect(right.fighter.health.currentValue).toBe(sim.endHp.right);
  });

  it("simulateRound matches resolve + apply", () => {
    const left = makeFighterCombatant("A");
    const right = makeFighterCombatant("B");
    left.drawHand(0);
    right.drawHand(0);

    const leftClone = makeFighterCombatant("A");
    const rightClone = makeFighterCombatant("B");
    leftClone.drawHand(0);
    rightClone.drawHand(0);

    const attack = abilityRegistry.get("hard_punch") as AttackAbility;
    left.addAbility(attack, 1, battleConfig.startStance);
    leftClone.addAbility(attack, 1, battleConfig.startStance);

    const simCombined = simulateRound(left, right);
    const simPure = resolveRound(leftClone, rightClone);
    applyRoundResult(leftClone, rightClone, simPure);

    expect(simCombined.endHp).toEqual(simPure.endHp);
    expect(left.fighter.health.currentValue).toBe(leftClone.fighter.health.currentValue);
  });

  it("caps damage per round", () => {
    const left = makeFighterCombatant("Атакующий", 10);
    const right = makeFighterCombatant("Защитник", 5);
    left.drawHand(0);
    right.drawHand(0);

    const heavy = abilityRegistry.get("hard_punch") as AttackAbility;
    for (let i = 0; i < 3; i++) {
      if (left.canAdd(heavy.speed)) {
        left.addAbility(heavy, 1, battleConfig.startStance);
      }
    }

    const sim = resolveRound(left, right);
    const totalDamage = sim.events.reduce((sum, e) => sum + e.damage, 0);
    const cap = Math.floor(right.fighter.health.maxValue * battleConfig.maxRoundDamageRatio);
    expect(totalDamage).toBeLessThanOrEqual(cap);
  });

  it("misses when the attacker's own stance drifts out of reach before the strike resolves", () => {
    const left = makeFighterCombatant("Атакующий");
    const right = makeFighterCombatant("Защитник");
    left.drawHand(0);
    right.drawHand(0);

    const jab = abilityRegistry.get("jab") as AttackAbility; // reach 1
    // Left steps away first, then aims at column 2 — by the time the jab
    // resolves, left's own stance (0) is too far from column 2 (distance 2 > reach 1).
    left.addStep(-1);
    left.addAbility(jab, 1, 2);
    // Right steps into column 2, exactly where the jab is aimed, to isolate
    // the miss as a reach failure rather than the defender simply not being there.
    right.addStep(1);

    const sim = resolveRound(left, right);
    const jabEvent = sim.events.find((e) => e.ability === jab.name);
    expect(jabEvent?.result).toBe("miss");
    expect(jabEvent?.damage).toBe(0);
  });

  it("blocks reduce damage via the block coefficient", () => {
    const left = makeFighterCombatant("Атакующий", 8);
    const right = makeFighterCombatant("Защитник", 8);
    left.drawHand(0);
    right.drawHand(0);

    const punch = abilityRegistry.get("simple_punch") as AttackAbility; // speed 3, reach 1, upper body
    const block = abilityRegistry.get("two_hands_block"); // speed 3 — same window as the punch

    left.addAbility(punch, 0, battleConfig.startStance);
    right.addAbility(block, 0, battleConfig.startStance);

    const sim = resolveRound(left, right);
    const hit = sim.events.find((e) => e.ability === punch.name);
    expect(hit?.result).toBe("blocked");
    expect(hit!.damage).toBeGreaterThan(0);
  });

  it("a dodge guarding the strike's zone prevents damage", () => {
    const left = makeFighterCombatant("Атакующий", 8);
    const right = makeFighterCombatant("Защитник", 8);
    left.drawHand(0);
    right.drawHand(0);

    // Kick (speed 5, reach 2) aimed at the legs (row 2) in column 2.
    const kick = abilityRegistry.get("kick") as AttackAbility;
    left.addAbility(kick, 2, 2);

    // Right steps into column 2 (matching the kick's target) and keeps a "jump"
    // dodge (guards the legs) active until the kick actually lands at t=5: three
    // steps (0-1,1-2,2-3) then jump (3-5) — its window covers the strike time.
    right.addStep(1);
    right.addStep(1);
    right.addStep(1);
    const jump = abilityRegistry.get("jump");
    right.addAbility(jump);

    const sim = resolveRound(left, right);
    const kickEvent = sim.events.find((e) => e.ability === kick.name);
    expect(kickEvent?.result).toBe("dodged");
    expect(kickEvent?.damage).toBe(0);
  });

  it("interrupts the defender's own attack when it's hit mid-flight", () => {
    const left = makeFighterCombatant("Атакующий", 8);
    const right = makeFighterCombatant("Защитник", 8);
    left.drawHand(0);
    right.drawHand(0);

    // Fast jab (speed 2) lands before the defender's slower hard_punch (speed 4) resolves.
    const jab = abilityRegistry.get("jab") as AttackAbility;
    const heavy = abilityRegistry.get("hard_punch") as AttackAbility;
    left.addAbility(jab, 1, battleConfig.startStance);
    right.addAbility(heavy, 1, battleConfig.startStance);

    const sim = resolveRound(left, right);
    const heavyEvent = sim.events.find((e) => e.ability === heavy.name);
    expect(heavyEvent?.result).toBe("interrupted");
  });
});

describe("resolveRound + status effects", () => {
  it("resolveRound collects an inflicted effect on a clean hit but does not apply it (pure)", () => {
    const left = makeFighterCombatant("Атакующий");
    const right = makeFighterCombatant("Защитник");
    left.drawHand(0);
    right.drawHand(0);

    const bleed = damageOverTime({
      id: "bleed",
      name: "Кровотечение",
      polarity: "negative",
      durationRounds: 2,
      hpPerRound: 3,
    });
    const poisonedJab = attack({
      id: "poisoned_jab",
      name: "Ядовитый джеб",
      speed: 2,
      reach: 1,
      damage: { base: 4 },
      inflicts: bleed,
    });
    left.addAbility(poisonedJab, 1, battleConfig.startStance);

    const sim = resolveRound(left, right);
    expect(sim.inflicted).toEqual([{ defenderSide: "right", effect: bleed }]);
    expect(right.fighter.activeEffects).toEqual([]);

    applyRoundResult(left, right, sim);
    expect(right.fighter.activeEffects).toEqual([{ effect: bleed, roundsRemaining: 2 }]);
  });

  it("does not inflict the effect when the strike is blocked or missed", () => {
    const left = makeFighterCombatant("Атакующий", 8);
    const right = makeFighterCombatant("Защитник", 8);
    left.drawHand(0);
    right.drawHand(0);

    const bleed = damageOverTime({
      id: "bleed",
      name: "Кровотечение",
      polarity: "negative",
      durationRounds: 2,
      hpPerRound: 3,
    });
    const poisonedPunch = attack({
      id: "poisoned_punch",
      name: "Ядовитый удар",
      speed: 3,
      reach: 1,
      damage: { base: 7 },
      inflicts: bleed,
    });
    const block = abilityRegistry.get("two_hands_block");
    left.addAbility(poisonedPunch, 0, battleConfig.startStance);
    right.addAbility(block, 0, battleConfig.startStance);

    const sim = resolveRound(left, right);
    const hit = sim.events.find((e) => e.ability === poisonedPunch.name);
    expect(hit?.result).toBe("blocked");
    expect(sim.inflicted).toEqual([]);
  });

  it("damageTakenMultiplier from an active effect scales incoming damage", () => {
    const jab = abilityRegistry.get("jab") as AttackAbility;

    const left = makeFighterCombatant("Атакующий");
    const right = makeFighterCombatant("Защитник");
    left.drawHand(0);
    right.drawHand(0);
    left.addAbility(jab, 1, battleConfig.startStance);
    const baseline = resolveRound(left, right).events.find((e) => e.ability === jab.name)!.damage;

    const leftVuln = makeFighterCombatant("Атакующий");
    const rightVuln = makeFighterCombatant("Защитник");
    leftVuln.drawHand(0);
    rightVuln.drawHand(0);
    rightVuln.fighter.addEffect(
      modifierEffect({
        id: "vulnerable",
        name: "Уязвимость",
        polarity: "negative",
        durationRounds: 2,
        modifiers: { damageTakenMultiplier: 2 },
      })
    );
    leftVuln.addAbility(jab, 1, battleConfig.startStance);
    const scaled = resolveRound(leftVuln, rightVuln).events.find((e) => e.ability === jab.name)!
      .damage;

    expect(scaled).toBe(baseline * 2);
  });

  it("blockDisabled flag makes a normally-blocking defence resolve as a full hit", () => {
    const left = makeFighterCombatant("Атакующий", 8);
    const right = makeFighterCombatant("Защитник", 8);
    left.drawHand(0);
    right.drawHand(0);
    right.fighter.addEffect(
      modifierEffect({
        id: "stun",
        name: "Оглушение",
        polarity: "negative",
        durationRounds: 1,
        flags: { blockDisabled: true },
      })
    );

    const punch = abilityRegistry.get("simple_punch") as AttackAbility;
    const block = abilityRegistry.get("two_hands_block");
    left.addAbility(punch, 0, battleConfig.startStance);
    right.addAbility(block, 0, battleConfig.startStance);

    const sim = resolveRound(left, right);
    const hit = sim.events.find((e) => e.ability === punch.name);
    expect(hit?.result).toBe("hit");
  });

  it("dodgeDisabled flag prevents an active dodge from avoiding a hit", () => {
    const left = makeFighterCombatant("Атакующий");
    const right = makeFighterCombatant("Защитник");
    left.drawHand(0);
    right.drawHand(0);
    right.fighter.addEffect(
      modifierEffect({
        id: "rooted",
        name: "Скован",
        polarity: "negative",
        durationRounds: 1,
        flags: { dodgeDisabled: true },
      })
    );

    const jab = abilityRegistry.get("jab") as AttackAbility; // full sector, reach 1
    const duck = abilityRegistry.get("duck"); // guards row 0 (head)
    left.addAbility(jab, 0, battleConfig.startStance);
    right.addAbility(duck, 0, battleConfig.startStance);

    const sim = resolveRound(left, right);
    const hit = sim.events.find((e) => e.ability === jab.name);
    expect(hit?.result).toBe("hit");
  });
});
