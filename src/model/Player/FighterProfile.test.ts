import { describe, expect, it } from "vitest";
import { FighterProfile } from "./FighterProfile";
import { getFightingStyle, getStyleAbilities } from "./FightingStyle";

describe("FighterProfile", () => {
  it("uses provided stats instead of rolling random ones", () => {
    const profile = new FighterProfile(
      "Тест",
      ["jab"],
      { power: 9, agility: 8, stamina: 7, speed: 6, luck: 5 },
      "boxer"
    );
    expect(profile.stats).toEqual({ power: 9, agility: 8, stamina: 7, speed: 6, luck: 5 });
  });

  it("rolls missing stats within the 1-10 range", () => {
    const profile = new FighterProfile("Тест", ["jab"]);
    const { power, agility, stamina, speed, luck } = profile.stats;
    for (const value of [power, agility, stamina, speed, luck]) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it("derives maxHp from stamina (60 + stamina * 4)", () => {
    const profile = new FighterProfile("Тест", ["jab"], { stamina: 8 });
    expect(profile.maxHp).toBe(60 + 8 * 4);
  });

  it("round-trips through toDTO/fromDTO", () => {
    const original = new FighterProfile(
      "Циклевич",
      ["jab", "duck"],
      { power: 3, agility: 4, stamina: 5, speed: 6, luck: 7 },
      "street"
    );
    const restored = FighterProfile.fromDTO(original.toDTO());
    expect(restored).toEqual(original);
  });

  it("toDTO returns independent copies, not references", () => {
    const profile = new FighterProfile("Тест", ["jab"], { power: 1, agility: 1, stamina: 1, speed: 1, luck: 1 });
    const dto = profile.toDTO();
    dto.abilityIds.push("mutated");
    dto.stats.power = 999;
    expect(profile.abilityIds).toEqual(["jab"]);
    expect(profile.stats.power).toBe(1);
  });

  it("fromFighter copies stats and name from a Fighter instance", () => {
    const style = getFightingStyle("karate");
    const source = new FighterProfile(
      "Из бойца",
      style.abilityIds,
      { power: 2, agility: 3, stamina: 4, speed: 5, luck: 6 },
      style.id
    ).toFighter(getStyleAbilities(style));

    const profile = FighterProfile.fromFighter(source, style.abilityIds, style.id);
    expect(profile.name).toBe("Из бойца");
    expect(profile.stats).toEqual({ power: 2, agility: 3, stamina: 4, speed: 5, luck: 6 });
    expect(profile.styleId).toBe("karate");
  });

  it("toFighter builds a Fighter whose max HP matches the profile's maxHp", () => {
    const style = getFightingStyle("street");
    const profile = new FighterProfile("Тест", style.abilityIds, { stamina: 9 }, style.id);
    const fighter = profile.toFighter(getStyleAbilities(style));
    expect(fighter.health.maxValue).toBe(profile.maxHp);
    expect(fighter.health.currentValue).toBe(profile.maxHp);
  });
});

describe("FighterProfile currency", () => {
  it("starts at zero", () => {
    const profile = new FighterProfile("Тест", ["jab"]);
    expect(profile.currency).toBe(0);
  });

  it("earn adds to the balance", () => {
    const profile = new FighterProfile("Тест", ["jab"]);
    profile.earn(50);
    profile.earn(25);
    expect(profile.currency).toBe(75);
  });

  it("spend subtracts and returns true when the balance covers the cost", () => {
    const profile = new FighterProfile("Тест", ["jab"]);
    profile.earn(100);
    expect(profile.spend(40)).toBe(true);
    expect(profile.currency).toBe(60);
  });

  it("spend returns false and leaves the balance untouched when funds are insufficient", () => {
    const profile = new FighterProfile("Тест", ["jab"]);
    profile.earn(10);
    expect(profile.spend(20)).toBe(false);
    expect(profile.currency).toBe(10);
  });

  it("spending exactly the full balance is allowed", () => {
    const profile = new FighterProfile("Тест", ["jab"]);
    profile.earn(30);
    expect(profile.spend(30)).toBe(true);
    expect(profile.currency).toBe(0);
  });

  it("round-trips currency through toDTO/fromDTO", () => {
    const profile = new FighterProfile("Тест", ["jab"]);
    profile.earn(42);
    const restored = FighterProfile.fromDTO(profile.toDTO());
    expect(restored.currency).toBe(42);
  });

  it("defaults restored currency to 0 for a DTO missing the field (pre-currency save)", () => {
    const style = getFightingStyle("boxer");
    const legacyDto = {
      name: "Старое сохранение",
      abilityIds: style.abilityIds,
      stats: { power: 5, agility: 5, stamina: 5, speed: 5, luck: 5 },
      styleId: style.id,
    };
    const restored = FighterProfile.fromDTO(legacyDto as Parameters<typeof FighterProfile.fromDTO>[0]);
    expect(restored.currency).toBe(0);
  });
});
