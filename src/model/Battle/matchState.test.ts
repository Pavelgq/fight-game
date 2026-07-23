import { describe, expect, it } from "vitest";
import { SeededRng } from "../Rng";
import { makeCombatant } from "../testFixtures";
import {
  combatantFromState,
  combatantToState,
  deserializeMatchState,
  matchFromState,
  matchToState,
  serializeMatchState,
  timelineFromDTO,
  timelineToDTO,
} from "./matchState";
import { abilityRegistry } from "../Player/abilities/AbilityRegistry";
import { AttackAbility } from "../Player/Ability";
import { statusEffectRegistry } from "../Player/statusEffects/StatusEffectRegistry";

describe("timeline DTO round-trip", () => {
  it("round-trips a step action", () => {
    const dto = timelineToDTO([{ kind: "step", direction: 1, duration: 1 }]);
    const restored = timelineFromDTO(dto);
    expect(restored).toEqual([{ kind: "step", direction: 1, duration: 1 }]);
  });

  it("round-trips an ability action by id, dropping the object identity", () => {
    const jab = abilityRegistry.get("jab") as AttackAbility;
    const dto = timelineToDTO([
      { kind: "ability", ability: jab, row: 0, col: 1, duration: jab.speed },
    ]);
    expect(dto).toEqual([{ kind: "ability", abilityId: "jab", row: 0, col: 1 }]);

    const restored = timelineFromDTO(dto);
    const restoredAction = restored[0];
    expect(restoredAction).toMatchObject({ kind: "ability", row: 0, col: 1, duration: jab.speed });
    if (restoredAction.kind !== "ability") throw new Error("expected an ability action");
    expect(restoredAction.ability.id).toBe("jab");
  });
});

describe("combatant state round-trip", () => {
  it("round-trips combatant state", () => {
    const original = makeCombatant({ name: "Сериализация" }, 11);
    original.drawHand(1);
    original.hand = original.hand.slice(0, 3);

    const dto = combatantToState(original);
    const restored = combatantFromState(dto, new SeededRng(11));

    expect(restored.fighter.name).toBe(original.fighter.name);
    expect(restored.hand.map((a) => a.id)).toEqual(original.hand.map((a) => a.id));
    expect(restored.stance).toBe(original.stance);
    expect(restored.roundIndex).toBe(original.roundIndex);
  });

  it("preserves current HP even if it's below max", () => {
    const original = makeCombatant({ name: "Раненый" }, 5);
    original.drawHand(0);
    original.fighter.health.currentValue = 1;

    const dto = combatantToState(original);
    expect(dto.hp).toBe(1);

    const restored = combatantFromState(dto);
    expect(restored.fighter.health.currentValue).toBe(1);
    expect(restored.fighter.health.maxValue).toBe(original.fighter.health.maxValue);
  });

  it("round-trips a non-empty timeline", () => {
    const original = makeCombatant({ name: "Таймлайн" }, 3);
    original.drawHand(0);
    original.addStep(1);

    const dto = combatantToState(original);
    const restored = combatantFromState(dto);
    expect(restored.timeline).toEqual(original.timeline);
  });

  it("round-trips active status effects", () => {
    const original = makeCombatant({ name: "Раненый" }, 5);
    original.drawHand(0);
    original.fighter.addEffect(statusEffectRegistry.get("bleeding"));
    original.fighter.tickEffects();

    const dto = combatantToState(original);
    expect(dto.activeEffects).toEqual([{ id: "bleeding", roundsRemaining: 1 }]);

    const restored = combatantFromState(dto);
    expect(restored.fighter.activeEffects).toEqual([
      { effect: statusEffectRegistry.get("bleeding"), roundsRemaining: 1 },
    ]);
  });

  it("defaults to no active effects for a save from before A2", () => {
    const original = makeCombatant({ name: "Старое" }, 5);
    original.drawHand(0);

    const dto = combatantToState(original);
    delete dto.activeEffects;

    const restored = combatantFromState(dto);
    expect(restored.fighter.activeEffects).toEqual([]);
  });
});

describe("match state serialization", () => {
  it("round-trips full match state JSON", () => {
    const left = makeCombatant({ name: "L" }, 1);
    const right = makeCombatant({ name: "R" }, 2);
    left.drawHand(0);
    right.drawHand(0);

    const state = matchToState(left, right, {
      matchSeed: 123,
      roundNumber: 1,
      phase: "planning",
      selectedTimelineIndex: -1,
      pendingHandIndex: -1,
    });

    const json = serializeMatchState(state);
    const parsed = deserializeMatchState(json);
    expect(parsed.matchSeed).toBe(123);
    expect(parsed.left.profile.name).toBe("L");
    expect(parsed.right.profile.name).toBe("R");
  });

  it("matchFromState reconstructs both combatants", () => {
    const left = makeCombatant({ name: "L" }, 1);
    const right = makeCombatant({ name: "R" }, 2);
    left.drawHand(0);
    right.drawHand(0);

    const state = matchToState(left, right, {
      matchSeed: 7,
      roundNumber: 2,
      phase: "planning",
      selectedTimelineIndex: -1,
      pendingHandIndex: -1,
    });

    const { left: restoredLeft, right: restoredRight } = matchFromState(state, new SeededRng(7));
    expect(restoredLeft.fighter.name).toBe("L");
    expect(restoredRight.fighter.name).toBe("R");
    expect(restoredLeft.roundIndex).toBe(left.roundIndex);
  });
});
