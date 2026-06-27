import { Rng } from "../Rng";
import { Ability, AttackAbility } from "../Player/Ability";
import { Combatant } from "./Combatant";
import { battleConfig } from "./constants";
import { ZONE_COLS, ZONE_ROWS } from "./zones";

/** Случайная допустимая для приёма строка в заданном столбце (или любая клетка). */
function pickRowForCol(ability: Ability, col: number, rng: Rng): number {
  const rows: number[] = [];
  for (let row = 0; row < ZONE_ROWS; row++) {
    if (ability.checkAvailableSector(row, col)) rows.push(row);
  }
  return rows[rng.nextInt(0, rows.length - 1)] ?? 1;
}

function randomValidCell(ability: Ability, rng: Rng): { row: number; col: number } {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < ZONE_ROWS; row++) {
    for (let col = 0; col < ZONE_COLS; col++) {
      if (ability.checkAvailableSector(row, col)) cells.push({ row, col });
    }
  }
  return cells[rng.nextInt(0, cells.length - 1)] ?? { row: 1, col: 1 };
}

/**
 * Эвристический ИИ. Предполагает, что игрок останется около центра, и
 * подводит свою стойку под достающие атаки, иногда подстраховываясь защитой.
 */
export function planEnemyTimeline(enemy: Combatant, rng: Rng) {
  enemy.timeline = [];

  const assumedDefenderStance = battleConfig.startStance;

  const hand = [...enemy.hand];
  const attacks = hand.filter((a): a is AttackAbility => a instanceof AttackAbility);
  const guards = hand.filter((a) => a.type === "dodge" || a.type === "defence");

  if (guards.length > 0 && rng.nextInt(0, 1) === 0) {
    const guard = guards[rng.nextInt(0, guards.length - 1)];
    if (enemy.canAdd(guard.speed)) {
      if (guard.type === "dodge") {
        enemy.addAbility(guard);
      } else {
        const { row, col } = randomValidCell(guard, rng);
        enemy.addAbility(guard, row, col);
      }
    }
  }

  attacks
    .sort((a, b) => b.baseDamage - a.baseDamage)
    .forEach((atk) => {
      if (!enemy.canAdd(atk.speed)) return;

      let stance = enemy.projectedStance();
      const targetCol = assumedDefenderStance;
      const row = pickRowForCol(atk, targetCol, rng);

      while (!atk.canReachColumn(stance, targetCol) && enemy.canAdd(battleConfig.stepTime)) {
        const dir = targetCol > stance ? 1 : -1;
        enemy.addStep(dir as 1 | -1);
        stance = enemy.projectedStance();
      }

      if (atk.canReachColumn(stance, targetCol)) {
        enemy.addAbility(atk, row, targetCol);
      }
    });
}
