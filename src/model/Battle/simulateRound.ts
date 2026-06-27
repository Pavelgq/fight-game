import { calculateDamage } from "../Actions/DamageCalculator";
import { AttackAbility, AbilityType } from "../Player/Ability";
import { Combatant } from "./Combatant";
import { battleConfig, clampStance } from "./constants";
import { actionLabel, TimelineAction } from "./TimelineAction";
import { ZONE_TITLES } from "./zones";

export type Side = "left" | "right";

export type SimResult = "hit" | "blocked" | "dodged" | "miss" | "interrupted";

export type SimEvent = {
  time: number;
  attacker: string;
  defender: string;
  attackerSide: Side;
  defenderSide: Side;
  ability: string;
  zone: string;
  damage: number;
  result: SimResult;
};

/** Тип блока на шкале — для раскраски в попапе проигрывания. */
export type IntervalType = AbilityType | "step";

/** Интервал действия на шкале раунда (для попапа проигрывания). */
export type ActionInterval = {
  side: Side;
  start: number;
  end: number;
  label: string;
  type: IntervalType;
  /** Атака была сбита (interrupt) до удара. */
  cancelled: boolean;
};

/** Полный результат симуляции раунда — данные для лога и попапа. */
export type RoundSimulation = {
  events: SimEvent[];
  intervals: ActionInterval[];
  budgets: { left: number; right: number };
  startHp: { left: number; right: number };
  maxHp: { left: number; right: number };
  endHp: { left: number; right: number };
  endStance: { left: number; right: number };
};

type Scheduled = {
  action: TimelineAction;
  start: number;
  end: number;
};

function schedule(timeline: TimelineAction[]): Scheduled[] {
  let time = 0;
  return timeline.map((action) => {
    const start = time;
    time += action.duration;
    return { action, start, end: time };
  });
}

/** Стойка бойца к моменту времени t: центр + завершённые к t шаги. */
function stanceAt(scheduled: Scheduled[], t: number): number {
  let delta = 0;
  for (const item of scheduled) {
    if (item.action.kind === "step" && item.end <= t) {
      delta += item.action.direction;
    }
  }
  return clampStance(battleConfig.startStance + delta);
}

function intervalType(action: TimelineAction): IntervalType {
  return action.kind === "step" ? "step" : action.ability.type;
}

/**
 * Чистая симуляция раунда: не мутирует бойцов, возвращает события и итоговые HP/стойки.
 */
export function resolveRound(left: Combatant, right: Combatant): RoundSimulation {
  const leftSched = schedule(left.timeline);
  const rightSched = schedule(right.timeline);
  const schedOf = (c: Combatant) => (c === left ? leftSched : rightSched);
  const sideOf = (c: Combatant): Side => (c === left ? "left" : "right");

  const startHp = {
    left: left.fighter.health.currentValue,
    right: right.fighter.health.currentValue,
  };

  type Strike = {
    time: number;
    item: Scheduled;
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
        item,
        attacker,
        defender,
        ability,
        row: row ?? 1,
        col: col ?? battleConfig.startStance,
      });
    }
  };
  collectStrikes(left, right, leftSched);
  collectStrikes(right, left, rightSched);

  strikes.sort((a, b) => a.time - b.time);

  const isDodged = (defender: Combatant, time: number, row: number, col: number) =>
    schedOf(defender).some(
      (item) =>
        item.action.kind === "ability" &&
        item.action.ability.guard !== undefined &&
        item.start <= time &&
        time <= item.end &&
        item.action.ability.guard(row, col)
    );

  const blockKoef = (defender: Combatant, time: number, row: number, col: number) => {
    for (const item of schedOf(defender)) {
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
  const cancelled = new Set<Scheduled>();

  const dealt = new Map<Combatant, number>();
  const damageCapFor = (c: Combatant) =>
    Math.floor(c.fighter.health.maxValue * battleConfig.maxRoundDamageRatio);

  const hpAfter = {
    left: startHp.left,
    right: startHp.right,
  };

  for (const strike of strikes) {
    const base = {
      time: strike.time,
      attacker: strike.attacker.fighter.name,
      defender: strike.defender.fighter.name,
      attackerSide: sideOf(strike.attacker),
      defenderSide: sideOf(strike.defender),
      ability: strike.ability.name,
      zone: ZONE_TITLES[strike.row][strike.col],
    };

    if (cancelled.has(strike.item)) {
      events.push({ ...base, damage: 0, result: "interrupted" });
      continue;
    }

    const attackerStance = stanceAt(schedOf(strike.attacker), strike.time);
    const defenderStance = stanceAt(schedOf(strike.defender), strike.time);

    const connects =
      defenderStance === strike.col &&
      strike.ability.canReachColumn(attackerStance, strike.col);

    if (!connects) {
      events.push({ ...base, damage: 0, result: "miss" });
      continue;
    }

    if (isDodged(strike.defender, strike.time, strike.row, strike.col)) {
      events.push({ ...base, damage: 0, result: "dodged" });
      continue;
    }

    for (const item of schedOf(strike.defender)) {
      if (
        item.action.kind === "ability" &&
        item.action.ability instanceof AttackAbility &&
        item.start <= strike.time &&
        strike.time < item.end &&
        !cancelled.has(item)
      ) {
        cancelled.add(item);
      }
    }

    const koef = blockKoef(strike.defender, strike.time, strike.row, strike.col);
    const raw = calculateDamage(strike.ability, strike.attacker.fighter);
    const rolled = Math.max(0, Math.round(raw * koef));

    const already = dealt.get(strike.defender) ?? 0;
    const allowed = Math.max(0, damageCapFor(strike.defender) - already);
    const damage = Math.min(rolled, allowed);

    if (damage > 0) {
      dealt.set(strike.defender, already + damage);
      if (strike.defender === left) {
        hpAfter.left = Math.max(0, hpAfter.left - damage);
      } else {
        hpAfter.right = Math.max(0, hpAfter.right - damage);
      }
    }

    events.push({ ...base, damage, result: koef < 1 ? "blocked" : "hit" });
  }

  const endStance = {
    left: stanceAt(leftSched, Infinity),
    right: stanceAt(rightSched, Infinity),
  };

  const intervals: ActionInterval[] = [
    ...leftSched.map((item) => toInterval(item, "left", cancelled)),
    ...rightSched.map((item) => toInterval(item, "right", cancelled)),
  ];

  return {
    events,
    intervals,
    budgets: { left: left.budget(), right: right.budget() },
    startHp,
    maxHp: {
      left: left.fighter.health.maxValue,
      right: right.fighter.health.maxValue,
    },
    endHp: hpAfter,
    endStance,
  };
}

/** Применяет результат симуляции к бойцам (HP и стойки). */
export function applyRoundResult(
  left: Combatant,
  right: Combatant,
  simulation: RoundSimulation
): void {
  left.fighter.health.currentValue = simulation.endHp.left;
  right.fighter.health.currentValue = simulation.endHp.right;
  left.lastStance = simulation.endStance.left;
  right.lastStance = simulation.endStance.right;
  left.stance = simulation.endStance.left;
  right.stance = simulation.endStance.right;
}

/**
 * Симулирует и применяет раунд. Обратная совместимость для существующего кода.
 */
export function simulateRound(left: Combatant, right: Combatant): RoundSimulation {
  const simulation = resolveRound(left, right);
  applyRoundResult(left, right, simulation);
  return simulation;
}

function toInterval(
  item: Scheduled,
  side: Side,
  cancelled: Set<Scheduled>
): ActionInterval {
  return {
    side,
    start: item.start,
    end: item.end,
    label: actionLabel(item.action),
    type: intervalType(item.action),
    cancelled: cancelled.has(item),
  };
}
