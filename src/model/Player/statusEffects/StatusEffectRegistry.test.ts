import { describe, expect, it } from "vitest";
import { getStatusEffect, statusEffectRegistry, STATUS_EFFECTS } from "./StatusEffectRegistry";

describe("statusEffectRegistry", () => {
  it("all() returns the full catalogue", () => {
    expect(statusEffectRegistry.all()).toBe(STATUS_EFFECTS);
    expect(statusEffectRegistry.all().length).toBeGreaterThan(0);
  });

  it("get() returns the effect with a matching id", () => {
    expect(statusEffectRegistry.get("bleeding").id).toBe("bleeding");
  });

  it("get() throws for an unknown id", () => {
    expect(() => statusEffectRegistry.get("does-not-exist")).toThrow();
  });

  it("has() reports whether an id exists in the catalogue", () => {
    expect(statusEffectRegistry.has("bleeding")).toBe(true);
    expect(statusEffectRegistry.has("does-not-exist")).toBe(false);
  });

  it("every effect id in the catalogue is unique", () => {
    const ids = STATUS_EFFECTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getStatusEffect matches statusEffectRegistry.get", () => {
    expect(getStatusEffect("bleeding")).toBe(statusEffectRegistry.get("bleeding"));
  });
});
