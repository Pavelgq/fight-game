import { describe, expect, it } from "vitest";
import { battleConfig, clampStance, roundBudget } from "./constants";

describe("roundBudget", () => {
  it("equals baseRoundTime for stamina 5 on the first round", () => {
    expect(roundBudget(5, 0)).toBe(battleConfig.baseRoundTime);
  });

  it("adds the stamina delta above/below 5", () => {
    expect(roundBudget(8, 0)).toBe(battleConfig.baseRoundTime + 3);
    expect(roundBudget(2, 0)).toBe(battleConfig.baseRoundTime - 3);
  });

  it("subtracts accumulated fatigue per round", () => {
    expect(roundBudget(5, 1)).toBe(battleConfig.baseRoundTime - battleConfig.fatiguePerRound);
    expect(roundBudget(5, 2)).toBe(battleConfig.baseRoundTime - battleConfig.fatiguePerRound * 2);
  });

  it("caps fatigue at maxFatigue", () => {
    const atCap = roundBudget(5, battleConfig.maxFatigue);
    const beyondCap = roundBudget(5, battleConfig.maxFatigue + 10);
    expect(beyondCap).toBe(atCap);
  });

  it("fatigueRelief reduces effective fatigue", () => {
    const withoutRelief = roundBudget(5, 3);
    const withRelief = roundBudget(5, 3, 1);
    expect(withRelief).toBe(withoutRelief + 1);
  });

  it("never drops below minRoundBudget", () => {
    expect(roundBudget(1, 999)).toBe(battleConfig.minRoundBudget);
  });
});

describe("clampStance", () => {
  it("passes through in-range values", () => {
    expect(clampStance(0)).toBe(0);
    expect(clampStance(1)).toBe(1);
    expect(clampStance(2)).toBe(2);
  });

  it("clamps below the range to 0", () => {
    expect(clampStance(-5)).toBe(0);
  });

  it("clamps above the range to stanceCount - 1", () => {
    expect(clampStance(99)).toBe(battleConfig.stanceCount - 1);
  });
});
