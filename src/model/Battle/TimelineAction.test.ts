import { describe, expect, it } from "vitest";
import { actionLabel } from "./TimelineAction";
import { abilityRegistry } from "../Player/abilities/AbilityRegistry";

describe("actionLabel", () => {
  it("labels a rightward step", () => {
    expect(actionLabel({ kind: "step", direction: 1, duration: 1 })).toBe("Шаг вправо");
  });

  it("labels a leftward step", () => {
    expect(actionLabel({ kind: "step", direction: -1, duration: 1 })).toBe("Шаг влево");
  });

  it("labels an ability action with the ability's name", () => {
    const jab = abilityRegistry.get("jab");
    expect(
      actionLabel({ kind: "ability", ability: jab, row: 1, col: 1, duration: jab.speed })
    ).toBe(jab.name);
  });
});
