import { Fighter } from "../Player/Fighter";
import { Rng, SeededRng } from "../Rng";
import { planEnemyTimeline } from "./ai";
import { Combatant } from "./Combatant";
import { matchFromState, matchToState } from "./matchState";
import { MatchPhase, MatchStateDTO } from "./matchTypes";
import {
  applyRoundResult,
  resolveRound,
  RoundSimulation,
} from "./simulateRound";

export type PlayerCommand =
  | { type: "goToStance"; target: number }
  | { type: "selectTimeline"; index: number }
  | { type: "moveTimeline"; offset: number }
  | { type: "removeTimeline" }
  | { type: "beginPlacement"; handIndex: number }
  | { type: "placeCard"; handIndex: number; row: number; col: number }
  | { type: "placeDodge"; handIndex: number }
  | { type: "clearPending" }
  | { type: "submitRound" }
  | { type: "finishPlayback" };

export type BattleSessionResult = {
  ok: boolean;
  hint?: string;
  simulation?: RoundSimulation;
  battleEnded?: {
    playerDead: boolean;
    enemyDead: boolean;
    message: string;
    color: string;
  };
};

export type BattleEndBanner = {
  message: string;
  color: string;
};

/**
 * Оркестратор матча без Phaser: фаза, команды, симуляция раунда.
 */
export class BattleSession {
  readonly left: Combatant;
  readonly right: Combatant;
  readonly matchSeed: number;
  private rng: Rng;

  phase: MatchPhase = "planning";
  roundNumber = 1;
  selectedTimelineIndex = -1;
  pendingHandIndex = -1;
  lastSimulation?: RoundSimulation;
  endBanner?: BattleEndBanner;

  constructor(player: Fighter, enemy: Fighter, matchSeed?: number) {
    this.matchSeed = matchSeed ?? Date.now();
    this.rng = new SeededRng(this.matchSeed);
    this.left = new Combatant(player, this.rng);
    this.right = new Combatant(enemy, this.rng);
    this.left.drawHand(0);
    this.right.drawHand(0);
  }

  static fromState(state: MatchStateDTO): BattleSession {
    const session = Object.create(BattleSession.prototype) as BattleSession;
    const raw = session as unknown as {
      matchSeed: number;
      rng: Rng;
      left: Combatant;
      right: Combatant;
      phase: MatchPhase;
      roundNumber: number;
      selectedTimelineIndex: number;
      pendingHandIndex: number;
    };
    raw.matchSeed = state.matchSeed;
    raw.rng = new SeededRng(state.matchSeed);
    const { left, right } = matchFromState(state, raw.rng);
    raw.left = left;
    raw.right = right;
    raw.phase = state.phase;
    raw.roundNumber = state.roundNumber;
    raw.selectedTimelineIndex = state.selectedTimelineIndex;
    raw.pendingHandIndex = state.pendingHandIndex;
    return session;
  }

  get isFinished(): boolean {
    return this.phase === "finished";
  }

  get isPlaying(): boolean {
    return this.phase === "playback";
  }

  apply(command: PlayerCommand): BattleSessionResult {
    if (command.type === "finishPlayback") {
      return this.finishPlayback();
    }

    if (this.phase === "finished" || this.phase === "playback") {
      return { ok: false, hint: "Сейчас нельзя менять план" };
    }

    switch (command.type) {
      case "goToStance":
        return this.goToStance(command.target);
      case "selectTimeline":
        this.selectedTimelineIndex = command.index;
        return { ok: true };
      case "moveTimeline":
        return this.moveTimeline(command.offset);
      case "removeTimeline":
        return this.removeTimeline();
      case "beginPlacement":
        return this.beginPlacement(command.handIndex);
      case "placeCard":
        return this.placeCard(command.handIndex, command.row, command.col);
      case "placeDodge":
        return this.placeDodge(command.handIndex);
      case "clearPending":
        this.pendingHandIndex = -1;
        return { ok: true };
      case "submitRound":
        return this.submitRound();
      default:
        return { ok: false };
    }
  }

  getState(): MatchStateDTO {
    return matchToState(this.left, this.right, {
      matchSeed: this.matchSeed,
      roundNumber: this.roundNumber,
      phase: this.phase,
      selectedTimelineIndex: this.selectedTimelineIndex,
      pendingHandIndex: this.pendingHandIndex,
    });
  }

  private goToStance(target: number): BattleSessionResult {
    let cur = this.left.projectedStance();
    if (cur === target) return { ok: true };

    const dir: 1 | -1 = target > cur ? 1 : -1;
    let added = false;
    while (cur !== target) {
      if (!this.left.addStep(dir)) {
        return { ok: false, hint: "Не хватает времени на шаг" };
      }
      cur += dir;
      added = true;
    }
    if (added) {
      this.pendingHandIndex = -1;
    }
    return { ok: true };
  }

  private moveTimeline(offset: number): BattleSessionResult {
    if (this.selectedTimelineIndex < 0) return { ok: false };
    this.left.moveAction(this.selectedTimelineIndex, offset);
    this.selectedTimelineIndex = Math.max(
      0,
      Math.min(this.left.timeline.length - 1, this.selectedTimelineIndex + offset)
    );
    return { ok: true };
  }

  private removeTimeline(): BattleSessionResult {
    const index = this.selectedTimelineIndex;
    if (index < 0) return { ok: false };
    const action = this.left.timeline[index];
    if (action?.kind === "ability") {
      this.left.hand.push(action.ability);
    }
    this.left.removeAt(index);
    this.selectedTimelineIndex = -1;
    return { ok: true };
  }

  private beginPlacement(handIndex: number): BattleSessionResult {
    const ability = this.left.hand[handIndex];
    if (!ability) return { ok: false };

    if (ability.speed > this.left.remainingTime()) {
      return { ok: false, hint: "Не хватает времени на этот приём" };
    }

    if (ability.type === "dodge") {
      return this.placeDodge(handIndex);
    }

    this.pendingHandIndex = handIndex;
    return { ok: true };
  }

  private placeDodge(handIndex: number): BattleSessionResult {
    const ability = this.left.hand[handIndex];
    if (!ability) return { ok: false };

    if (!this.left.addAbility(ability)) {
      return { ok: false, hint: "Не хватает времени на этот приём" };
    }
    this.left.hand.splice(handIndex, 1);
    this.pendingHandIndex = -1;
    return { ok: true };
  }

  private placeCard(handIndex: number, row: number, col: number): BattleSessionResult {
    const ability = this.left.hand[handIndex];
    if (!ability) return { ok: false };

    if (!this.left.addAbility(ability, row, col)) {
      return { ok: false, hint: "Не хватает времени на этот приём" };
    }

    this.left.hand.splice(handIndex, 1);
    this.pendingHandIndex = -1;
    return { ok: true };
  }

  private submitRound(): BattleSessionResult {
    this.phase = "resolving";
    planEnemyTimeline(this.right, this.rng);
    const simulation = resolveRound(this.left, this.right);
    applyRoundResult(this.left, this.right, simulation);
    this.lastSimulation = simulation;
    this.pendingHandIndex = -1;
    this.phase = "playback";
    return { ok: true, simulation };
  }

  private finishPlayback(): BattleSessionResult {
    if (this.phase !== "playback") return { ok: false };

    const playerDead = this.left.fighter.health.isDeath();
    const enemyDead = this.right.fighter.health.isDeath();

    if (playerDead || enemyDead) {
      this.selectedTimelineIndex = -1;
      this.phase = "finished";
      const banner = this.buildEndBanner(playerDead, enemyDead);
      this.endBanner = banner;
      return {
        ok: true,
        battleEnded: {
          playerDead,
          enemyDead,
          message: banner.message,
          color: banner.color,
        },
      };
    }

    this.roundNumber += 1;
    this.selectedTimelineIndex = -1;
    this.left.drawHand(this.roundNumber - 1);
    this.right.drawHand(this.roundNumber - 1);
    this.phase = "planning";
    return { ok: true };
  }

  private buildEndBanner(playerDead: boolean, enemyDead: boolean): BattleEndBanner {
    if (playerDead && enemyDead) {
      return { message: "Ничья", color: "#ffffff" };
    }
    if (playerDead) {
      return { message: "Поражение", color: "#ff5555" };
    }
    return { message: "Победа!", color: "#7CFC00" };
  }
}
