import { getRandom } from "../../utils/common";
import { Ability } from "../Player/Ability";
import { Combatant } from "./Combatant";
import { ZONE_COLS, ZONE_ROWS } from "./zones";

function randomValidCell(ability: Ability): { row: number; col: number } {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < ZONE_ROWS; row++) {
    for (let col = 0; col < ZONE_COLS; col++) {
      if (ability.checkAvailableSector(row, col)) cells.push({ row, col });
    }
  }
  return cells[getRandom(0, cells.length - 1)] ?? { row: 1, col: 1 };
}

/** Простейший ИИ: случайно набивает таймлайн картами из руки в рамках бюджета. */
export function planEnemyTimeline(enemy: Combatant) {
  enemy.timeline = [];

  if (getRandom(0, 1) === 0) {
    enemy.addStep(getRandom(0, 1) === 0 ? 1 : -1);
  }

  const cards = [...enemy.hand];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = getRandom(0, i);
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  for (const card of cards) {
    if (!enemy.canAdd(card.speed)) continue;
    if (card.type === "dodge") {
      enemy.addAbility(card);
    } else {
      const { row, col } = randomValidCell(card);
      enemy.addAbility(card, row, col);
    }
  }
}
