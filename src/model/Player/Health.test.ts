import { describe, expect, it } from "vitest";
import { Health } from "./Health";

describe("Health", () => {
  it("starts at max value", () => {
    const health = new Health(50);
    expect(health.currentValue).toBe(50);
    expect(health.maxValue).toBe(50);
  });

  it("applies flat point damage", () => {
    const health = new Health(50);
    health.makeDamage(20, "point");
    expect(health.currentValue).toBe(30);
  });

  it("applies percent damage relative to current value", () => {
    const health = new Health(50);
    health.makeDamage(50, "percent");
    expect(health.currentValue).toBe(25);
  });

  it("percent damage compounds on an already-reduced value", () => {
    const health = new Health(100);
    health.makeDamage(50, "percent"); // 100 -> 50
    health.makeDamage(50, "percent"); // 50 -> 25
    expect(health.currentValue).toBe(25);
  });

  it("reports death once current value drops to zero or below", () => {
    const health = new Health(10);
    expect(health.isDeath()).toBe(false);
    health.makeDamage(10, "point");
    expect(health.isDeath()).toBe(true);
  });

  it("allows current value to go negative from point damage", () => {
    const health = new Health(10);
    health.makeDamage(25, "point");
    expect(health.currentValue).toBe(-15);
    expect(health.isDeath()).toBe(true);
  });

  it("makeDamage returns the death state", () => {
    const health = new Health(5);
    expect(health.makeDamage(5, "point")).toBe(true);
  });
});
