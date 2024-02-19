import { AvailableSectionState } from "../Field/Field";
import { Point } from "../Point";
import { Fighter } from "./Fighter";

export type AbilityType = "attack" | "defence" | "dodge";

type AbilityCheckerFunc = (
  fighter: Fighter,
  distance: number,
  point: Point
) => number;

type AbilityConstructorProps = {
  type: AbilityType;
  name: string;
  availableSector?: AvailableSectionState;
  checker: AbilityCheckerFunc;
};

const DefultAvailableSector: AvailableSectionState = [
  [true, true, true],
  [true, true, true],
  [true, true, true],
];
export class Ability {
  type: AbilityType;
  name: string;

  availableSector: AvailableSectionState;
  checker: AbilityCheckerFunc;

  constructor({
    type,
    name,
    availableSector = DefultAvailableSector,
    checker,
  }: AbilityConstructorProps) {
    this.type = type;
    this.name = name;
    this.availableSector = availableSector;
    this.checker = checker;
  }

  checkAvailableSector(x: number, y: number) {
    return this.availableSector[x][y];
  }
}

type AttackAbilityConstructorProps = {
  damage: number[];
} & AbilityConstructorProps;

export class AttackAbility extends Ability {
  damage: number[]; //Массив где индекс - расстояние до противника а значение - сила удара

  constructor({
    type,
    name,
    availableSector = DefultAvailableSector,
    checker,
    damage,
  }: AttackAbilityConstructorProps) {
    super({ type: "attack", name, availableSector, checker });
    this.damage = damage;
  }
}
