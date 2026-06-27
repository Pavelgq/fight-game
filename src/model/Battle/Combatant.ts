import { Ability } from "../Player/Ability";
import { Fighter } from "../Player/Fighter";
import { Rng, defaultRng } from "../Rng";
import { battleConfig, clampStance, roundBudget } from "./constants";
import { buildDeck, Deck } from "./Deck";
import { StepDirection, TimelineAction } from "./TimelineAction";

/** Боец в контексте боя: стойка, колода, рука и таймлайн раунда. */
export class Combatant {
  readonly fighter: Fighter;
  readonly deck: Deck;

  hand: Ability[] = [];
  timeline: TimelineAction[] = [];

  /** Текущая стойка 0..2 (в начале раунда — центр). */
  stance: number;
  /** Стойка на конец прошлого раунда (для read-only показа врага). */
  lastStance: number;
  /** Индекс раунда (с 0) — нужен для расчёта усталости и бюджета. */
  roundIndex = 0;

  constructor(fighter: Fighter, rng: Rng = defaultRng) {
    this.fighter = fighter;
    this.stance = battleConfig.startStance;
    this.lastStance = battleConfig.startStance;
    this.deck = new Deck(buildDeck(fighter.abilities, battleConfig.deckSize), rng);
  }

  /** Берёт новую руку на раунд: сбрасывает стойку в центр и чистит таймлайн. */
  drawHand(roundIndex: number) {
    this.roundIndex = roundIndex;
    this.hand = this.deck.draw(battleConfig.handSize);
    this.timeline = [];
    this.stance = battleConfig.startStance;
  }

  /** Бюджет времени таймлайна на текущем раунде (с учётом стамины и усталости). */
  budget(): number {
    return roundBudget(this.fighter.stamina, this.roundIndex);
  }

  usedTime(): number {
    return this.timeline.reduce((sum, action) => sum + action.duration, 0);
  }

  remainingTime(): number {
    return this.budget() - this.usedTime();
  }

  canAdd(duration: number): boolean {
    return this.remainingTime() >= duration;
  }

  /** Прогноз стойки на конец раунда по уже разложенным шагам (от центра). */
  projectedStance(): number {
    const delta = this.timeline.reduce(
      (d, action) => (action.kind === "step" ? d + action.direction : d),
      0
    );
    return clampStance(battleConfig.startStance + delta);
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
