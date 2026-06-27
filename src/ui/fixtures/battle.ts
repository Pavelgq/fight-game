import { Fighter } from "../../model/Player/Fighter";
import { Health } from "../../model/Player/Health";
import {
  getFightingStyle,
  getStyleAbilities,
} from "../../model/Player/FightingStyle";
import {
  createOpponentFighter,
  getOpponent,
} from "../../model/Opponents/opponents";

type FighterStats = {
  power: number;
  agility: number;
  stamina: number;
  speed: number;
  luck: number;
};

/** Фиксированные статы — без рандома, чтобы превью не прыгало. */
function applyStats(fighter: Fighter, stats: FighterStats): Fighter {
  fighter.power = stats.power;
  fighter.agility = stats.agility;
  fighter.stamina = stats.stamina;
  fighter.speed = stats.speed;
  fighter.luck = stats.luck;
  fighter.health = new Health(60 + stats.stamina * 4);
  return fighter;
}

const PREVIEW_PLAYER_STATS: FighterStats = {
  power: 7,
  agility: 6,
  stamina: 8,
  speed: 5,
  luck: 5,
};

const PREVIEW_ENEMY_STATS: FighterStats = {
  power: 6,
  agility: 5,
  stamina: 6,
  speed: 6,
  luck: 4,
};

export function createPreviewPlayer(): Fighter {
  const style = getFightingStyle("street");
  const fighter = new Fighter("Тестовый боец", getStyleAbilities(style));
  return applyStats(fighter, PREVIEW_PLAYER_STATS);
}

export function createPreviewEnemy(): Fighter {
  const fighter = createOpponentFighter(getOpponent("street_brawler"));
  return applyStats(fighter, PREVIEW_ENEMY_STATS);
}
