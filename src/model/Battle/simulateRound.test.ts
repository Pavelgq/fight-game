import { describe, expect, it } from "vitest";
import { SeededRng } from "../Rng";
import { AttackAbility } from "../Player/Ability";
import { FighterProfile } from "../Player/FighterProfile";
import { getFightingStyle, getStyleAbilities } from "../Player/FightingStyle";
import { abilityRegistry } from "../Player/abilities/AbilityRegistry";
import { Combatant } from "./Combatant";
import { battleConfig } from "./constants";
import {
  applyRoundResult,
  resolveRound,
  simulateRound,
} from "./simulateRound";
import {
  combatantFromState,
  combatantToState,
  serializeMatchState,
  deserializeMatchState,
} from "./matchState";
import { matchToState } from "./matchState";

function makeCombatant(name: string, stamina = 8): Combatant {
  const style = getFightingStyle("boxer");
  const fighter = new FighterProfile(
    name,
    style.abilityIds,
    { power: 7, agility: 5, stamina, speed: 5, luck: 5 },
    style.id
  ).toFighter(getStyleAbilities(style));
  return new Combatant(fighter, new SeededRng(11));
}

describe("resolveRound", () => {
  it("does not mutate HP until applyRoundResult", () => {
    const left = makeCombatant("Игрок");
    const right = makeCombatant("Враг");
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
    const left = makeCombatant("A");
    const right = makeCombatant("B");
    left.drawHand(0);
    right.drawHand(0);

    const leftClone = makeCombatant("A");
    const rightClone = makeCombatant("B");
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
    const left = makeCombatant("Атакующий", 10);
    const right = makeCombatant("Защитник", 5);
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
    const cap = Math.floor(
      right.fighter.health.maxValue * battleConfig.maxRoundDamageRatio
    );
    expect(totalDamage).toBeLessThanOrEqual(cap);
  });
});

describe("matchState serialization", () => {
  it("round-trips combatant state", () => {
    const original = makeCombatant("Сериализация");
    original.drawHand(1);
    original.hand = original.hand.slice(0, 3);

    const dto = combatantToState(original);
    const restored = combatantFromState(dto, new SeededRng(11));

    expect(restored.fighter.name).toBe(original.fighter.name);
    expect(restored.hand.map((a) => a.id)).toEqual(original.hand.map((a) => a.id));
    expect(restored.stance).toBe(original.stance);
  });

  it("round-trips full match state JSON", () => {
    const left = makeCombatant("L");
    const right = makeCombatant("R");
    left.drawHand(0);
    right.drawHand(0);

    const state = matchToState(left, right, {
      matchSeed: 123,
      roundNumber: 1,
      phase: "planning",
      selectedTimelineIndex: -1,
      pendingHandIndex: -1,
    });

    const json = serializeMatchState(state);
    const parsed = deserializeMatchState(json);
    expect(parsed.matchSeed).toBe(123);
    expect(parsed.left.profile.name).toBe("L");
  });
});
