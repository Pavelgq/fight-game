import { Ability } from "../Player/Ability";
import { Rng, defaultRng } from "../Rng";

function shuffle<T>(items: T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Колода с добором: при опустошении пересобирается и тасуется заново. */
export class Deck {
  private readonly all: Ability[];
  private drawPile: Ability[];
  private readonly rng: Rng;

  constructor(cards: Ability[], rng: Rng = defaultRng) {
    this.all = [...cards];
    this.rng = rng;
    this.drawPile = shuffle(this.all, rng);
  }

  draw(count: number): Ability[] {
    const hand: Ability[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        this.drawPile = shuffle(this.all, this.rng);
      }
      const card = this.drawPile.pop();
      if (card) hand.push(card);
    }
    return hand;
  }

  getDrawPileIds(): string[] {
    return this.drawPile.map((card) => card.id);
  }

  restoreDrawPile(ids: string[], rng?: Rng): void {
    this.drawPile = ids.map((id) => {
      const card = this.all.find((a) => a.id === id);
      if (!card) throw new Error(`Карта не в колоде: ${id}`);
      return card;
    });
    if (rng) {
      this.drawPile = shuffle(this.drawPile, rng);
    }
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
