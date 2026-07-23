import { describe, expect, it } from "vitest";
import { makeCombatant } from "../testFixtures";
import { battleConfig, clampStance } from "./constants";

describe("Combatant", () => {
  it("calculates budget from stamina and round index", () => {
    const c = makeCombatant({ stats: { stamina: 8 } });
    c.drawHand(0);
    expect(c.budget()).toBe(battleConfig.baseRoundTime + 3);
    c.drawHand(2);
    expect(c.budget()).toBe(battleConfig.baseRoundTime + 3 - 2);
  });

  it("tracks projected stance after steps", () => {
    const c = makeCombatant();
    c.drawHand(0);
    c.addStep(1);
    c.addStep(1);
    expect(c.projectedStance()).toBe(clampStance(battleConfig.startStance + 2));
  });

  it("rejects actions that exceed remaining time", () => {
    const c = makeCombatant({ stats: { stamina: 5 } });
    c.drawHand(0);
    const ability = c.hand[0];
    while (c.remainingTime() >= ability.speed) {
      if (!c.addAbility(ability)) break;
    }
    expect(c.canAdd(ability.speed)).toBe(false);
  });

  it("removes an action from the timeline by index", () => {
    const c = makeCombatant();
    c.drawHand(0);
    c.addStep(1);
    c.addStep(-1);
    expect(c.timeline).toHaveLength(2);
    c.removeAt(0);
    expect(c.timeline).toHaveLength(1);
    expect(c.timeline[0].kind).toBe("step");
  });

  it("moves an action within the timeline", () => {
    const c = makeCombatant();
    c.drawHand(0);
    c.addStep(1);
    c.addStep(-1);
    const [firstBefore, secondBefore] = c.timeline;
    c.moveAction(0, 1);
    expect(c.timeline[0]).toBe(secondBefore);
    expect(c.timeline[1]).toBe(firstBefore);
  });

  it("ignores an out-of-range move", () => {
    const c = makeCombatant();
    c.drawHand(0);
    c.addStep(1);
    const before = [...c.timeline];
    c.moveAction(0, 5);
    expect(c.timeline).toEqual(before);
  });

  it("resets stance and timeline on a new hand", () => {
    const c = makeCombatant();
    c.drawHand(0);
    c.addStep(1);
    expect(c.timeline).toHaveLength(1);
    c.drawHand(1);
    expect(c.timeline).toHaveLength(0);
    expect(c.stance).toBe(battleConfig.startStance);
  });
});
