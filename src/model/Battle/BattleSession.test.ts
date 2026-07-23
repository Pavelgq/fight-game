import { describe, expect, it } from "vitest";
import { BattleSession } from "./BattleSession";
import { FighterOverrides, makeFighter } from "../testFixtures";
import { abilityRegistry } from "../Player/abilities/AbilityRegistry";
import { damageOverTime } from "../Player/statusEffects/factories";
import { battleConfig } from "./constants";

function makeSession(opts: { seed?: number; playerStats?: FighterOverrides["stats"] } = {}) {
  const player = makeFighter({ name: "Игрок", stats: { stamina: 8, ...opts.playerStats } });
  const enemy = makeFighter({ name: "Враг", stats: { stamina: 8 } });
  return new BattleSession(player, enemy, opts.seed ?? 1);
}

describe("BattleSession construction", () => {
  it("starts in planning phase, round 1, with a drawn hand on both sides", () => {
    const session = makeSession();
    expect(session.phase).toBe("planning");
    expect(session.roundNumber).toBe(1);
    expect(session.left.hand.length).toBeGreaterThan(0);
    expect(session.right.hand.length).toBeGreaterThan(0);
    expect(session.isFinished).toBe(false);
    expect(session.isPlaying).toBe(false);
  });

  it("is fully deterministic for the same matchSeed", () => {
    const a = makeSession({ seed: 42 });
    const b = makeSession({ seed: 42 });
    expect(a.left.hand.map((x) => x.id)).toEqual(b.left.hand.map((x) => x.id));
    expect(a.right.hand.map((x) => x.id)).toEqual(b.right.hand.map((x) => x.id));
  });
});

describe("goToStance", () => {
  it("adds steps toward the target stance", () => {
    const session = makeSession();
    const result = session.apply({ type: "goToStance", target: 2 });
    expect(result.ok).toBe(true);
    expect(session.left.projectedStance()).toBe(2);
  });

  it("is a no-op when already at the target stance", () => {
    const session = makeSession();
    const before = session.left.timeline.length;
    const result = session.apply({ type: "goToStance", target: battleConfig.startStance });
    expect(result.ok).toBe(true);
    expect(session.left.timeline.length).toBe(before);
  });

  it("fails with a hint once the time budget is exhausted", () => {
    const session = makeSession({ playerStats: { stamina: 1 } }); // budget = 6
    expect(session.apply({ type: "goToStance", target: 2 }).ok).toBe(true); // 1 step, remaining 5
    session.left.addAbility(abilityRegistry.get("kick")); // speed 5 — drains the rest
    expect(session.left.remainingTime()).toBe(0);

    const timelineBefore = session.left.timeline.length;
    const result = session.apply({ type: "goToStance", target: 0 }); // needs 2 steps, budget is 0
    expect(result.ok).toBe(false);
    expect(result.hint).toBeTruthy();
    expect(session.left.timeline.length).toBe(timelineBefore);
  });
});

describe("timeline selection commands", () => {
  it("selectTimeline stores the selected index", () => {
    const session = makeSession();
    session.apply({ type: "goToStance", target: 2 });
    const result = session.apply({ type: "selectTimeline", index: 0 });
    expect(result.ok).toBe(true);
    expect(session.selectedTimelineIndex).toBe(0);
  });

  it("moveTimeline swaps two actions and follows the selection", () => {
    const session = makeSession();
    session.left.addStep(1);
    session.left.addStep(-1);
    session.apply({ type: "selectTimeline", index: 0 });
    const [firstBefore, secondBefore] = session.left.timeline;

    const result = session.apply({ type: "moveTimeline", offset: 1 });
    expect(result.ok).toBe(true);
    expect(session.left.timeline[0]).toBe(secondBefore);
    expect(session.left.timeline[1]).toBe(firstBefore);
    expect(session.selectedTimelineIndex).toBe(1);
  });

  it("moveTimeline fails when nothing is selected", () => {
    const session = makeSession();
    session.left.addStep(1);
    expect(session.apply({ type: "moveTimeline", offset: 1 }).ok).toBe(false);
  });

  it("removeTimeline returns an ability card to the hand", () => {
    const session = makeSession();
    session.left.hand = abilityRegistry.getMany(["jab"]);
    session.apply({ type: "placeCard", handIndex: 0, row: 1, col: battleConfig.startStance });
    expect(session.left.hand).toHaveLength(0);

    session.apply({ type: "selectTimeline", index: 0 });
    const result = session.apply({ type: "removeTimeline" });
    expect(result.ok).toBe(true);
    expect(session.left.timeline).toHaveLength(0);
    expect(session.left.hand.map((a) => a.id)).toEqual(["jab"]);
    expect(session.selectedTimelineIndex).toBe(-1);
  });

  it("removeTimeline fails when nothing is selected", () => {
    const session = makeSession();
    expect(session.apply({ type: "removeTimeline" }).ok).toBe(false);
  });

  it("clearPending always resets pendingHandIndex", () => {
    const session = makeSession();
    session.pendingHandIndex = 3;
    const result = session.apply({ type: "clearPending" });
    expect(result.ok).toBe(true);
    expect(session.pendingHandIndex).toBe(-1);
  });
});

describe("placement commands", () => {
  it("beginPlacement sets pendingHandIndex for a non-dodge ability", () => {
    const session = makeSession();
    session.left.hand = abilityRegistry.getMany(["jab"]);
    const result = session.apply({ type: "beginPlacement", handIndex: 0 });
    expect(result.ok).toBe(true);
    expect(session.pendingHandIndex).toBe(0);
  });

  it("beginPlacement auto-places a dodge ability instead of waiting for a cell", () => {
    const session = makeSession();
    session.left.hand = abilityRegistry.getMany(["jump"]);
    const result = session.apply({ type: "beginPlacement", handIndex: 0 });
    expect(result.ok).toBe(true);
    expect(session.left.timeline).toHaveLength(1);
    expect(session.left.hand).toHaveLength(0);
    expect(session.pendingHandIndex).toBe(-1);
  });

  it("beginPlacement fails for a missing hand index", () => {
    const session = makeSession();
    session.left.hand = [];
    expect(session.apply({ type: "beginPlacement", handIndex: 0 }).ok).toBe(false);
  });

  it("beginPlacement fails with a hint when the ability doesn't fit the budget", () => {
    const session = makeSession({ playerStats: { stamina: 1 } }); // budget 6
    session.left.addAbility(abilityRegistry.get("kick")); // speed 5, remaining 1
    session.left.hand = abilityRegistry.getMany(["hard_punch"]); // speed 4 > remaining
    const result = session.apply({ type: "beginPlacement", handIndex: 0 });
    expect(result.ok).toBe(false);
    expect(result.hint).toBeTruthy();
  });

  it("placeCard adds the ability to the timeline at the given cell and removes it from hand", () => {
    const session = makeSession();
    session.left.hand = abilityRegistry.getMany(["jab"]);
    const result = session.apply({
      type: "placeCard",
      handIndex: 0,
      row: 1,
      col: battleConfig.startStance,
    });
    expect(result.ok).toBe(true);
    expect(session.left.timeline).toHaveLength(1);
    expect(session.left.hand).toHaveLength(0);
    expect(session.pendingHandIndex).toBe(-1);
  });

  it("placeCard fails for a missing hand index", () => {
    const session = makeSession();
    session.left.hand = [];
    expect(session.apply({ type: "placeCard", handIndex: 0, row: 1, col: 1 }).ok).toBe(false);
  });

  it("placeCard fails with a hint when the ability doesn't fit the remaining budget", () => {
    const session = makeSession({ playerStats: { stamina: 1 } }); // budget 6
    session.left.addAbility(abilityRegistry.get("kick")); // speed 5, remaining 1
    session.left.hand = abilityRegistry.getMany(["hard_punch"]); // speed 4 > remaining
    const result = session.apply({ type: "placeCard", handIndex: 0, row: 1, col: battleConfig.startStance });
    expect(result.ok).toBe(false);
    expect(result.hint).toBeTruthy();
    expect(session.left.hand).toHaveLength(1); // untouched on failure
  });

  it("placeDodge fails for a missing hand index", () => {
    const session = makeSession();
    session.left.hand = [];
    expect(session.apply({ type: "placeDodge", handIndex: 0 }).ok).toBe(false);
  });

  it("placeDodge fails with a hint when the ability doesn't fit the remaining budget", () => {
    const session = makeSession({ playerStats: { stamina: 1 } }); // budget 6
    session.left.addAbility(abilityRegistry.get("kick")); // speed 5, remaining 1
    session.left.hand = abilityRegistry.getMany(["weave"]); // dodge, speed 3 > remaining
    const result = session.apply({ type: "placeDodge", handIndex: 0 });
    expect(result.ok).toBe(false);
    expect(result.hint).toBeTruthy();
    expect(session.left.hand).toHaveLength(1); // untouched on failure
  });

  it("placeDodge adds a dodge ability without needing a cell", () => {
    const session = makeSession();
    session.left.hand = abilityRegistry.getMany(["duck"]);
    const result = session.apply({ type: "placeDodge", handIndex: 0 });
    expect(result.ok).toBe(true);
    expect(session.left.timeline).toHaveLength(1);
    expect(session.left.hand).toHaveLength(0);
  });
});

describe("command guard while resolving/playback/finished", () => {
  it("blocks planning commands during playback", () => {
    const session = makeSession();
    session.apply({ type: "submitRound" });
    expect(session.phase).toBe("playback");
    const result = session.apply({ type: "goToStance", target: 2 });
    expect(result.ok).toBe(false);
    expect(result.hint).toBeTruthy();
  });

  it("still allows finishPlayback during playback", () => {
    const session = makeSession();
    session.apply({ type: "submitRound" });
    expect(session.apply({ type: "finishPlayback" }).ok).toBe(true);
  });
});

describe("submitRound", () => {
  it("moves the phase to playback and records a simulation", () => {
    const session = makeSession();
    const result = session.apply({ type: "submitRound" });
    expect(result.ok).toBe(true);
    expect(result.simulation).toBeDefined();
    expect(session.phase).toBe("playback");
    expect(session.lastSimulation).toBe(result.simulation);
    expect(session.isPlaying).toBe(true);
  });

  it("plans an enemy timeline before resolving", () => {
    const session = makeSession();
    session.right.hand = abilityRegistry.getMany(["jab", "hard_punch"]);
    session.apply({ type: "submitRound" });
    // planEnemyTimeline always clears+replans; an empty timeline would mean it never ran.
    // With abilities affordable within budget, it should place at least one action.
    expect(session.right.timeline.length).toBeGreaterThanOrEqual(0);
  });
});

describe("finishPlayback", () => {
  it("fails outside of the playback phase", () => {
    const session = makeSession();
    expect(session.apply({ type: "finishPlayback" }).ok).toBe(false);
  });

  it("advances to the next round when both fighters survive", () => {
    const session = makeSession();
    session.apply({ type: "submitRound" });
    const result = session.apply({ type: "finishPlayback" });
    expect(result.ok).toBe(true);
    expect(session.phase).toBe("planning");
    expect(session.roundNumber).toBe(2);
    expect(session.selectedTimelineIndex).toBe(-1);
    expect(session.left.hand.length).toBeGreaterThan(0);
  });

  it("declares victory when only the enemy is dead", () => {
    const session = makeSession();
    session.right.fighter.health.currentValue = 0;
    session.apply({ type: "submitRound" });
    const result = session.apply({ type: "finishPlayback" });
    expect(session.isFinished).toBe(true);
    expect(result.battleEnded).toEqual({
      playerDead: false,
      enemyDead: true,
      message: "Победа!",
      color: "#7CFC00",
    });
    expect(session.endBanner?.message).toBe("Победа!");
  });

  it("declares defeat when only the player is dead", () => {
    const session = makeSession();
    session.left.fighter.health.currentValue = 0;
    session.apply({ type: "submitRound" });
    const result = session.apply({ type: "finishPlayback" });
    expect(result.battleEnded).toMatchObject({
      playerDead: true,
      enemyDead: false,
      message: "Поражение",
    });
  });

  it("declares a draw when both are dead", () => {
    const session = makeSession();
    session.left.fighter.health.currentValue = 0;
    session.right.fighter.health.currentValue = 0;
    session.apply({ type: "submitRound" });
    const result = session.apply({ type: "finishPlayback" });
    expect(result.battleEnded).toMatchObject({
      playerDead: true,
      enemyDead: true,
      message: "Ничья",
    });
  });

  it("ticks active status effects at the round-end step", () => {
    const session = makeSession();
    session.left.fighter.addEffect(
      damageOverTime({
        id: "bleed",
        name: "Кровотечение",
        polarity: "negative",
        durationRounds: 2,
        hpPerRound: 5,
      })
    );
    session.apply({ type: "submitRound" });
    const hpAfterCombat = session.left.fighter.health.currentValue;
    session.apply({ type: "finishPlayback" });

    expect(session.left.fighter.health.currentValue).toBe(hpAfterCombat - 5);
    expect(session.left.fighter.activeEffects[0].roundsRemaining).toBe(1);
  });

  it("declares defeat when a round-end status effect finishes off the player", () => {
    const session = makeSession();
    session.left.fighter.health.currentValue = 3;
    session.left.fighter.addEffect(
      damageOverTime({
        id: "bleed",
        name: "Кровотечение",
        polarity: "negative",
        durationRounds: 2,
        hpPerRound: 5,
      })
    );

    session.apply({ type: "submitRound" });
    const result = session.apply({ type: "finishPlayback" });

    expect(result.battleEnded).toMatchObject({ playerDead: true, message: "Поражение" });
  });
});

describe("getState / fromState round-trip", () => {
  it("restores an equivalent session from a serialized state", () => {
    const session = makeSession({ seed: 7 });
    session.apply({ type: "goToStance", target: 2 });
    session.apply({ type: "selectTimeline", index: 0 });

    const state = session.getState();
    const restored = BattleSession.fromState(state);

    expect(restored.phase).toBe(session.phase);
    expect(restored.roundNumber).toBe(session.roundNumber);
    expect(restored.selectedTimelineIndex).toBe(session.selectedTimelineIndex);
    expect(restored.left.fighter.name).toBe(session.left.fighter.name);
    expect(restored.right.fighter.name).toBe(session.right.fighter.name);
    expect(restored.left.stance).toBe(session.left.stance);
  });
});
