import { describe, expect, it } from "vitest";
import { SeededRng } from "../Rng";
import { buildDeck, Deck } from "./Deck";
import { getStyleAbilities, getFightingStyle } from "../Player/FightingStyle";

describe("Deck", () => {
  it("draws requested number of cards", () => {
    const abilities = getStyleAbilities(getFightingStyle("boxer"));
    const deck = new Deck(buildDeck(abilities, 6), new SeededRng(7));
    const hand = deck.draw(3);
    expect(hand).toHaveLength(3);
  });

  it("reshuffles deterministically when draw pile is empty", () => {
    const abilities = getStyleAbilities(getFightingStyle("boxer"));
    const cards = buildDeck(abilities, 3);
    const rng = new SeededRng(99);
    const deckA = new Deck(cards, rng);
    const deckB = new Deck(cards, new SeededRng(99));

    deckA.draw(10);
    deckB.draw(10);

    expect(deckA.getDrawPileIds()).toEqual(deckB.getDrawPileIds());
  });
});
