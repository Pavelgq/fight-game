import { describe, expect, it } from "vitest";
import { SeededRng } from "./Rng";

describe("SeededRng", () => {
  it("produces deterministic sequence for the same seed", () => {
    const a = new SeededRng(42);
    const b = new SeededRng(42);
    const seqA = Array.from({ length: 5 }, () => a.nextInt(1, 10));
    const seqB = Array.from({ length: 5 }, () => b.nextInt(1, 10));
    expect(seqA).toEqual(seqB);
  });

  it("returns integers within inclusive bounds", () => {
    const rng = new SeededRng(1);
    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(3, 7);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
    }
  });
});
