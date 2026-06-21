import { Ability } from "../Player/Ability";
import { getRandom } from "../../utils/common";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandom(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Колода с добором: при опустошении пересобирается и тасуется заново. */
export class Deck {
  private readonly all: Ability[];
  private drawPile: Ability[];

  constructor(cards: Ability[]) {
    this.all = [...cards];
    this.drawPile = shuffle(this.all);
  }

  draw(count: number): Ability[] {
    const hand: Ability[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        this.drawPile = shuffle(this.all);
      }
      const card = this.drawPile.pop();
      if (card) hand.push(card);
    }
    return hand;
  }
}

/** Собирает колоду заданного размера из доступных приёмов (с повторами). */
export function buildDeck(abilities: Ability[], size: number): Ability[] {
  if (abilities.length === 0) return [];
  const deck: Ability[] = [];
  for (let i = 0; i < size; i++) {
    deck.push(abilities[i % abilities.length]);
  }
  return deck;
}
