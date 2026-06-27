import { describe, expect, it } from "vitest";
import { SeededRng } from "../Rng";
import { FighterProfile } from "../Player/FighterProfile";
import { getFightingStyle, getStyleAbilities } from "../Player/FightingStyle";
import { Combatant } from "./Combatant";
import { battleConfig, clampStance } from "./constants";

function makeCombatant(stamina = 8): Combatant {
  const style = getFightingStyle("boxer");
  const fighter = new FighterProfile(
    "Тест",
    style.abilityIds,
    { power: 5, agility: 5, stamina, speed: 5, luck: 5 },
    style.id
  ).toFighter(getStyleAbilities(style));
  return new Combatant(fighter, new SeededRng(1));
}

describe("Combatant", () => {
  it("calculates budget from stamina and round index", () => {
    const c = makeCombatant(8);
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
    const c = makeCombatant(5);
    c.drawHand(0);
    const ability = c.hand[0];
    while (c.remainingTime() >= ability.speed) {
      if (!c.addAbility(ability)) break;
    }
    expect(c.canAdd(ability.speed)).toBe(false);
  });
});
