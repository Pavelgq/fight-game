import { describe, expect, it } from "vitest";
import { SeededRng } from "../Rng";
import { planEnemyTimeline } from "./ai";
import { battleConfig } from "./constants";
import { makeCombatant } from "../testFixtures";
import { abilityRegistry } from "../Player/abilities/AbilityRegistry";
import { AttackAbility } from "../Player/Ability";
import { Combatant } from "./Combatant";

function enemyWithHand(abilityIds: string[], stamina = 8): Combatant {
  const enemy = makeCombatant({ stats: { stamina } });
  enemy.drawHand(0);
  enemy.hand = abilityRegistry.getMany(abilityIds);
  return enemy;
}

function placedAbilityActions(enemy: Combatant) {
  return enemy.timeline.filter((a) => a.kind === "ability") as Extract<
    Combatant["timeline"][number],
    { kind: "ability" }
  >[];
}

describe("planEnemyTimeline", () => {
  it("never exceeds the enemy's time budget", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const enemy = enemyWithHand(["jab", "hard_punch", "kick", "one_hand_block", "duck"]);
      planEnemyTimeline(enemy, new SeededRng(seed));
      expect(enemy.usedTime()).toBeLessThanOrEqual(enemy.budget());
    }
  });

  it("only aims attacks at the assumed defender stance (center)", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const enemy = enemyWithHand(["jab", "hard_punch", "kick"]);
      planEnemyTimeline(enemy, new SeededRng(seed));
      for (const action of placedAbilityActions(enemy)) {
        if (action.ability instanceof AttackAbility) {
          expect(action.col).toBe(battleConfig.startStance);
        }
      }
    }
  });

  it("resets the timeline on every call instead of accumulating across rounds", () => {
    const enemy = enemyWithHand(["jab", "hard_punch"]);
    planEnemyTimeline(enemy, new SeededRng(3));
    const first = enemy.timeline.length;
    planEnemyTimeline(enemy, new SeededRng(3));
    expect(enemy.timeline.length).toBe(first);
  });

  it("only places attacks the enemy can actually reach from its final planned stance", () => {
    for (let seed = 1; seed <= 15; seed++) {
      const enemy = enemyWithHand(["uppercut", "kick", "jab"]);
      planEnemyTimeline(enemy, new SeededRng(seed));
      const finalStance = enemy.projectedStance();
      for (const action of placedAbilityActions(enemy)) {
        if (action.ability instanceof AttackAbility && action.col !== undefined) {
          expect(action.ability.canReachColumn(finalStance, action.col)).toBe(true);
        }
      }
    }
  });

  it("does not place any ability when the hand has none it can afford", () => {
    const enemy = enemyWithHand(["hard_punch"], 1); // tiny budget, hard_punch speed 4
    planEnemyTimeline(enemy, new SeededRng(1));
    expect(enemy.usedTime()).toBeLessThanOrEqual(enemy.budget());
    expect(placedAbilityActions(enemy).every((a) => a.duration <= enemy.budget())).toBe(true);
  });

  it("is empty when the hand has no abilities at all", () => {
    const enemy = enemyWithHand([]);
    planEnemyTimeline(enemy, new SeededRng(1));
    expect(enemy.timeline).toEqual([]);
  });
});
