import { Ability } from "../Player/Ability";
import { Fighter } from "../Player/Fighter";
import { battleConfig } from "./constants";
import { buildDeck, Deck } from "./Deck";
import { StepDirection, TimelineAction } from "./TimelineAction";

/** Боец в контексте боя: позиция, колода, рука и таймлайн раунда. */
export class Combatant {
  readonly fighter: Fighter;
  /** +1 — смотрит вправо (игрок), -1 — влево (соперник). */
  readonly facing: StepDirection;
  readonly deck: Deck;

  hand: Ability[] = [];
  timeline: TimelineAction[] = [];
  position: number;

  constructor(fighter: Fighter, facing: StepDirection, startPosition: number) {
    this.fighter = fighter;
    this.facing = facing;
    this.position = startPosition;
    this.deck = new Deck(buildDeck(fighter.abilities, battleConfig.deckSize));
  }

  drawHand() {
    this.hand = this.deck.draw(battleConfig.handSize);
    this.timeline = [];
  }

  usedTime(): number {
    return this.timeline.reduce((sum, action) => sum + action.duration, 0);
  }

  remainingTime(): number {
    return battleConfig.roundTime - this.usedTime();
  }

  canAdd(duration: number): boolean {
    return this.remainingTime() >= duration;
  }

  addAbility(ability: Ability, row?: number, col?: number): boolean {
    if (!this.canAdd(ability.speed)) return false;
    this.timeline.push({
      kind: "ability",
      ability,
      row,
      col,
      duration: ability.speed,
    });
    return true;
  }

  addStep(direction: StepDirection): boolean {
    if (!this.canAdd(battleConfig.stepTime)) return false;
    this.timeline.push({
      kind: "step",
      direction,
      duration: battleConfig.stepTime,
    });
    return true;
  }

  removeAt(index: number) {
    this.timeline.splice(index, 1);
  }

  moveAction(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= this.timeline.length) return;
    const [item] = this.timeline.splice(index, 1);
    this.timeline.splice(target, 0, item);
  }
}
