import { describe, expect, it } from "vitest";
import { FighterProfile } from "../../model/Player/FighterProfile";
import { buildCharacterInfoState } from "./characterInfoState";

describe("buildCharacterInfoState", () => {
  it("maps the fighter profile to a read-only display summary", () => {
    const profile = new FighterProfile(
      "Алекс",
      ["jab", "jump"],
      {
        power: 8,
        agility: 6,
        stamina: 7,
        speed: 5,
        luck: 4,
      },
      "street"
    );

    const before = profile.toDTO();

    expect(buildCharacterInfoState(profile)).toEqual({
      name: "Алекс",
      style: "Уличный",
      maxHealth: 88,
      stats: {
        power: 8,
        agility: 6,
        stamina: 7,
        speed: 5,
        luck: 4,
      },
      abilities: ["Джеб", "Прыжок"],
    });
    expect(profile.toDTO()).toEqual(before);
  });
});
