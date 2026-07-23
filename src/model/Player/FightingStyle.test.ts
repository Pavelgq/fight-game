import { describe, expect, it } from "vitest";
import { FIGHTING_STYLES, getFightingStyle, getStyleAbilities } from "./FightingStyle";

describe("getFightingStyle", () => {
  it("returns the matching style by id", () => {
    const style = getFightingStyle("karate");
    expect(style.id).toBe("karate");
    expect(style.name).toBe("Карате");
  });

  it("throws for an unknown style id", () => {
    // @ts-expect-error deliberately passing an invalid id to check the runtime guard
    expect(() => getFightingStyle("not-a-style")).toThrow();
  });
});

describe("getStyleAbilities", () => {
  it("resolves every ability id declared by the style to a real Ability", () => {
    for (const style of FIGHTING_STYLES) {
      const abilities = getStyleAbilities(style);
      expect(abilities).toHaveLength(style.abilityIds.length);
      abilities.forEach((ability, i) => {
        expect(ability.id).toBe(style.abilityIds[i]);
      });
    }
  });
});

describe("FIGHTING_STYLES", () => {
  it("has unique style ids", () => {
    const ids = FIGHTING_STYLES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every style at least one ability", () => {
    for (const style of FIGHTING_STYLES) {
      expect(style.abilityIds.length).toBeGreaterThan(0);
    }
  });
});
