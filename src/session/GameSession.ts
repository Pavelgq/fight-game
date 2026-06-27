import { Fighter } from "../model/Player/Fighter";
import { FighterProfile } from "../model/Player/FighterProfile";
import { abilityRegistry } from "../model/Player/abilities/AbilityRegistry";
import { FighterProfileDTO, MatchStateDTO } from "../model/Battle/matchTypes";
import {
  deserializeMatchState,
  serializeMatchState,
} from "../model/Battle/matchState";
import { BattleSession } from "../model/Battle/BattleSession";
import {
  Opponent,
  createOpponentFighter,
  getOpponent,
} from "../model/Opponents/opponents";

const PROFILE_KEY = "fight-game:player-profile";
const MATCH_KEY = "fight-game:match-in-progress";

export type GameSessionSnapshot = {
  player?: FighterProfileDTO;
  opponentId?: string;
  match?: MatchStateDTO;
};

/**
 * Глобальная игровая сессия вне Phaser. Источник истины для профиля и матча.
 */
export class GameSession {
  private static instance = new GameSession();

  private playerProfile?: FighterProfile;
  private opponentId?: string;
  private battleSession?: BattleSession;

  static get(): GameSession {
    return GameSession.instance;
  }

  static reset(): void {
    GameSession.instance = new GameSession();
  }

  setPlayer(profile: FighterProfile): void {
    this.playerProfile = profile;
    this.save();
  }

  getPlayerProfile(): FighterProfile | undefined {
    return this.playerProfile;
  }

  getPlayerFighter(): Fighter | undefined {
    if (!this.playerProfile) return undefined;
    const abilities = abilityRegistry.getMany(this.playerProfile.abilityIds);
    return this.playerProfile.toFighter(abilities);
  }

  setOpponent(opponent: Opponent): void {
    this.opponentId = opponent.id;
    this.battleSession = undefined;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(MATCH_KEY);
    }
    this.save();
  }

  getOpponentFighter(): Fighter | undefined {
    if (!this.opponentId) return undefined;
    return createOpponentFighter(getOpponent(this.opponentId));
  }

  startBattle(player: Fighter, enemy: Fighter, matchSeed?: number): BattleSession {
    this.battleSession = new BattleSession(player, enemy, matchSeed);
    this.save();
    return this.battleSession;
  }

  getBattleSession(): BattleSession | undefined {
    return this.battleSession;
  }

  setBattleSession(session: BattleSession): void {
    this.battleSession = session;
    this.save();
  }

  clearBattle(): void {
    this.battleSession = undefined;
    this.opponentId = undefined;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(MATCH_KEY);
    }
  }

  serialize(): string {
    const snapshot: GameSessionSnapshot = {
      player: this.playerProfile?.toDTO(),
      opponentId: this.opponentId,
      match: this.battleSession?.getState(),
    };
    return JSON.stringify(snapshot);
  }

  static deserialize(json: string): GameSession {
    const data = JSON.parse(json) as GameSessionSnapshot;
    const session = new GameSession();
    if (data.player) {
      session.playerProfile = FighterProfile.fromDTO(data.player);
    }
    session.opponentId = data.opponentId;
    if (data.match) {
      session.battleSession = BattleSession.fromState(data.match);
    }
    return session;
  }

  save(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(PROFILE_KEY, this.serialize());
    if (this.battleSession) {
      localStorage.setItem(MATCH_KEY, serializeMatchState(this.battleSession.getState()));
    }
  }

  static load(): GameSession {
    if (typeof localStorage === "undefined") {
      return new GameSession();
    }
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return new GameSession();
    try {
      const session = GameSession.deserialize(raw);
      GameSession.instance = session;
      return session;
    } catch {
      return new GameSession();
    }
  }

  static loadMatchInProgress(): BattleSession | undefined {
    if (typeof localStorage === "undefined") return undefined;
    const raw = localStorage.getItem(MATCH_KEY);
    if (!raw) return undefined;
    try {
      return BattleSession.fromState(deserializeMatchState(raw));
    } catch {
      return undefined;
    }
  }
}
