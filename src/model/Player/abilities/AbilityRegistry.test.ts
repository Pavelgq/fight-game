import { describe, expect, it } from "vitest";
import { ABILITIES, abilityRegistry, getAbilities, getAbility } from "./AbilityRegistry";

describe("abilityRegistry", () => {
  it("all() returns the full catalogue", () => {
    expect(abilityRegistry.all()).toBe(ABILITIES);
    expect(abilityRegistry.all().length).toBeGreaterThan(0);
  });

  it("get() returns the ability with a matching id", () => {
    const jab = abilityRegistry.get("jab");
    expect(jab.id).toBe("jab");
  });

  it("get() throws for an unknown id", () => {
    expect(() => abilityRegistry.get("does-not-exist")).toThrow();
  });

  it("getMany() resolves multiple ids in order", () => {
    const abilities = abilityRegistry.getMany(["jab", "duck"]);
    expect(abilities.map((a) => a.id)).toEqual(["jab", "duck"]);
  });

  it("has() reports whether an id exists in the catalogue", () => {
    expect(abilityRegistry.has("jab")).toBe(true);
    expect(abilityRegistry.has("does-not-exist")).toBe(false);
  });

  it("every ability id in the catalogue is unique", () => {
    const ids = ABILITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getAbility / getAbilities (module-level helpers)", () => {
  it("getAbility matches abilityRegistry.get", () => {
    expect(getAbility("jab")).toBe(abilityRegistry.get("jab"));
  });

  it("getAbilities throws if any id is unknown", () => {
    expect(() => getAbilities(["jab", "nope"])).toThrow();
  });
});
