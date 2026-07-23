import { describe, expect, it } from "vitest";
import { SeededRng } from "../Rng";
import { buildDeck, Deck } from "./Deck";
import { getStyleAbilities, getFightingStyle } from "../Player/FightingStyle";

describe("buildDeck", () => {
  it("returns an empty deck for no abilities", () => {
    expect(buildDeck([], 5)).toEqual([]);
  });

  it("repeats abilities to fill the requested size", () => {
    const abilities = getStyleAbilities(getFightingStyle("boxer"));
    const deck = buildDeck(abilities, abilities.length * 2 + 1);
    expect(deck).toHaveLength(abilities.length * 2 + 1);
    expect(deck[0]).toBe(abilities[0]);
    expect(deck[abilities.length]).toBe(abilities[0]);
  });
});

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

  it("round-trips a restored draw pile via ids", () => {
    const abilities = getStyleAbilities(getFightingStyle("boxer"));
    const cards = buildDeck(abilities, 4);
    const deck = new Deck(cards, new SeededRng(3));
    const ids = deck.getDrawPileIds();

    const restored = new Deck(cards, new SeededRng(3));
    restored.restoreDrawPile(ids);
    expect(restored.getDrawPileIds()).toEqual(ids);
  });

  it("throws when restoring an id that isn't in the deck", () => {
    const abilities = getStyleAbilities(getFightingStyle("boxer"));
    const cards = buildDeck(abilities, 4);
    const deck = new Deck(cards, new SeededRng(3));
    expect(() => deck.restoreDrawPile(["not-a-real-id"])).toThrow();
  });
});
