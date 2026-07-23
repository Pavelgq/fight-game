import { describe, expect, it } from "vitest";
import { damageOverTime, modifierEffect } from "./factories";
import { Fighter } from "../Fighter";
import { attack } from "../abilities/factories";

function makeFighter() {
  return new Fighter("Тест", [attack({ id: "a", name: "A", speed: 2, reach: 1, damage: { base: 1 } })]);
}

describe("modifierEffect", () => {
  it("builds a plain effect with no onRoundEnd tick", () => {
    const effect = modifierEffect({
      id: "buff",
      name: "Бафф",
      polarity: "positive",
      durationRounds: 3,
      modifiers: { powerDelta: 2 },
    });
    expect(effect.onRoundEnd).toBeUndefined();
    expect(effect.modifiers).toEqual({ powerDelta: 2 });
  });
});

describe("damageOverTime", () => {
  it("deals the configured flat damage on round end", () => {
    const fighter = makeFighter();
    const startHp = fighter.health.currentValue;
    const bleed = damageOverTime({
      id: "bleed",
      name: "Кровотечение",
      polarity: "negative",
      durationRounds: 2,
      hpPerRound: 7,
    });
    bleed.onRoundEnd?.(fighter);
    expect(fighter.health.currentValue).toBe(startHp - 7);
  });

  it("does not include hpPerRound in the resulting effect data", () => {
    const bleed = damageOverTime({
      id: "bleed",
      name: "Кровотечение",
      polarity: "negative",
      durationRounds: 2,
      hpPerRound: 7,
    });
    expect(bleed).not.toHaveProperty("hpPerRound");
  });
});
