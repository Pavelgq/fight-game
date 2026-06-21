import { calculateDamage } from "../Actions/DamageCalculator";
import { AttackAbility } from "../Player/Ability";
import { Combatant } from "./Combatant";
import { battleConfig } from "./constants";
import { TimelineAction } from "./TimelineAction";
import { ZONE_TITLES } from "./zones";

export type SimResult = "hit" | "blocked" | "dodged" | "miss";

export type SimEvent = {
  time: number;
  attacker: string;
  defender: string;
  ability: string;
  zone: string;
  damage: number;
  result: SimResult;
};

type Scheduled = {
  action: TimelineAction;
  start: number;
  end: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function schedule(timeline: TimelineAction[]): Scheduled[] {
  let time = 0;
  return timeline.map((action) => {
    const start = time;
    time += action.duration;
    return { action, start, end: time };
  });
}

/** Позиция бойца к моменту времени t (с учётом завершённых шагов). */
function positionAt(combatant: Combatant, scheduled: Scheduled[], t: number): number {
  let pos = combatant.position;
  for (const item of scheduled) {
    if (item.action.kind === "step" && item.end <= t) {
      pos += combatant.facing * item.action.direction;
    }
  }
  return pos;
}

/**
 * Проигрывает раунд по двум таймлайнам: считает дистанцию и состояния на момент
 * каждого удара, применяет урон и возвращает события для лога/анимации.
 * left — игрок (смотрит вправо), right — соперник.
 */
export function simulateRound(left: Combatant, right: Combatant): SimEvent[] {
  const leftSched = schedule(left.timeline);
  const rightSched = schedule(right.timeline);

  const distanceAt = (t: number) => {
    const raw = positionAt(right, rightSched, t) - positionAt(left, leftSched, t);
    return clamp(raw, battleConfig.minDistance, battleConfig.maxDistance);
  };

  type Strike = {
    time: number;
    attacker: Combatant;
    defender: Combatant;
    ability: AttackAbility;
    row: number;
    col: number;
  };

  const strikes: Strike[] = [];
  const collectStrikes = (attacker: Combatant, defender: Combatant, sched: Scheduled[]) => {
    for (const item of sched) {
      if (item.action.kind !== "ability") continue;
      const { ability, row, col } = item.action;
      if (!(ability instanceof AttackAbility)) continue;
      strikes.push({
        time: item.end,
        attacker,
        defender,
        ability,
        row: row ?? 1,
        col: col ?? 1,
      });
    }
  };
  collectStrikes(left, right, leftSched);
  collectStrikes(right, left, rightSched);

  strikes.sort((a, b) => a.time - b.time);

  const defenderSched = (defender: Combatant) =>
    defender === left ? leftSched : rightSched;

  const isDodged = (defender: Combatant, time: number, row: number, col: number) =>
    defenderSched(defender).some(
      (item) =>
        item.action.kind === "ability" &&
        item.action.ability.guard !== undefined &&
        item.start <= time &&
        time <= item.end &&
        item.action.ability.guard(row, col)
    );

  const blockKoef = (defender: Combatant, time: number, row: number, col: number) => {
    for (const item of defenderSched(defender)) {
      if (
        item.action.kind === "ability" &&
        item.action.ability.block !== undefined &&
        item.action.row === row &&
        item.action.col === col &&
        item.start <= time &&
        time <= item.end
      ) {
        return item.action.ability.block;
      }
    }
    return 1;
  };

  const events: SimEvent[] = [];

  for (const strike of strikes) {
    const distance = distanceAt(strike.time);
    const base = {
      time: strike.time,
      attacker: strike.attacker.fighter.name,
      defender: strike.defender.fighter.name,
      ability: strike.ability.name,
      zone: ZONE_TITLES[strike.row][strike.col],
    };

    if (!strike.ability.reaches(distance)) {
      events.push({ ...base, damage: 0, result: "miss" });
      continue;
    }

    if (isDodged(strike.defender, strike.time, strike.row, strike.col)) {
      events.push({ ...base, damage: 0, result: "dodged" });
      continue;
    }

    const koef = blockKoef(strike.defender, strike.time, strike.row, strike.col);
    const raw = calculateDamage(strike.ability, strike.attacker.fighter, distance);
    const damage = Math.max(0, Math.round(raw * koef));

    if (damage > 0) {
      strike.defender.fighter.health.makeDamage(damage, "point");
    }

    events.push({ ...base, damage, result: koef < 1 ? "blocked" : "hit" });
  }

  left.position = positionAt(left, leftSched, Infinity);
  right.position = positionAt(right, rightSched, Infinity);
  recenter(left, right);

  return events;
}

/** Возвращает бойцов к симметричным позициям, сохраняя дистанцию между ними. */
export function recenter(left: Combatant, right: Combatant) {
  const distance = clamp(
    right.position - left.position,
    battleConfig.minDistance,
    battleConfig.maxDistance
  );
  const leftPos = Math.floor((battleConfig.maxDistance - distance) / 2);
  left.position = leftPos;
  right.position = leftPos + distance;
}

export function currentDistance(left: Combatant, right: Combatant): number {
  return clamp(
    right.position - left.position,
    battleConfig.minDistance,
    battleConfig.maxDistance
  );
}
