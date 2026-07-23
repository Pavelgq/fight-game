import { describe, expect, it } from "vitest";
import { createOpponentFighter, getOpponent, OPPONENTS } from "./opponents";
import { getStyleAbilities, getFightingStyle } from "../Player/FightingStyle";

describe("getOpponent", () => {
  it("returns the matching opponent by id", () => {
    const opponent = getOpponent("karate_master");
    expect(opponent.name).toBe("Сэнсэй Кэндзи");
  });

  it("throws for an unknown opponent id", () => {
    expect(() => getOpponent("nobody")).toThrow();
  });
});

describe("OPPONENTS", () => {
  it("has unique ids", () => {
    const ids = OPPONENTS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every opponent references a real fighting style", () => {
    for (const opponent of OPPONENTS) {
      expect(() => getFightingStyle(opponent.styleId)).not.toThrow();
    }
  });
});

describe("createOpponentFighter", () => {
  it("builds a Fighter with the opponent's name and style abilities", () => {
    const opponent = getOpponent("street_boxer");
    const fighter = createOpponentFighter(opponent);
    const style = getFightingStyle(opponent.styleId);

    expect(fighter.name).toBe(opponent.name);
    expect(fighter.abilities.map((a) => a.id)).toEqual(
      getStyleAbilities(style).map((a) => a.id)
    );
  });
});
