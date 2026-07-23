import { FightingStyleId } from "../Player/FightingStyle";

export type MatchPhase =
  | "planning"
  | "resolving"
  | "playback"
  | "roundEnd"
  | "finished";

export type FighterStatsDTO = {
  power: number;
  agility: number;
  stamina: number;
  speed: number;
  luck: number;
};

/** Постоянные данные бойца (мета-персонаж). */
export type FighterProfileDTO = {
  name: string;
  styleId?: FightingStyleId;
  abilityIds: string[];
  stats: FighterStatsDTO;
  currency?: number;
};

export type TimelineActionDTO =
  | { kind: "step"; direction: 1 | -1 }
  | { kind: "ability"; abilityId: string; row?: number; col?: number };

/** Состояние бойца внутри матча. */
export type CombatantStateDTO = {
  profile: FighterProfileDTO;
  hp: number;
  maxHp: number;
  hand: string[];
  drawPile: string[];
  timeline: TimelineActionDTO[];
  stance: number;
  lastStance: number;
  roundIndex: number;
};

/** Полный снимок матча — только JSON-совместимые поля. */
export type MatchStateDTO = {
  matchSeed: number;
  roundNumber: number;
  phase: MatchPhase;
  left: CombatantStateDTO;
  right: CombatantStateDTO;
  selectedTimelineIndex: number;
  pendingHandIndex: number;
};
