import { AvailableSectionState } from "../Field/Field";
import { Point } from "../Point";
import { Fighter } from "./Fighter";

export type AbilityType = "attack" | "defence" | "dodge";

export type AbilityCheckerFunc = (
  fighter: Fighter,
  distance: number,
  point: Point
) => number;

type AbilityConstructorProps = {
  id: string;
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
  id: string;
  type: AbilityType;
  name: string;

  availableSector: AvailableSectionState;
  checker: AbilityCheckerFunc;

  constructor({
    id,
    type,
    name,
    availableSector = DefultAvailableSector,
    checker,
  }: AbilityConstructorProps) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.availableSector = availableSector;
    this.checker = checker;
  }

  checkAvailableSector(x: number, y: number) {
    return this.availableSector[x][y];
  }
}

/**
 * Конфиг урона приёма. Только данные — сама формула живёт в DamageCalculator.
 * base[distance] — базовый урон на дистанции, power/agility — вклад характеристик.
 * custom — необязательный override для редких уникальных приёмов.
 */
export type DamageConfig = {
  base: number[];
  power?: number;
  agility?: number;
  custom?: (attacker: Fighter, distance: number) => number;
};

type AttackAbilityConstructorProps = {
  damage: DamageConfig;
} & Omit<AbilityConstructorProps, "type">;

export class AttackAbility extends Ability {
  damage: DamageConfig;

  constructor({
    id,
    name,
    availableSector = DefultAvailableSector,
    checker,
    damage,
  }: AttackAbilityConstructorProps) {
    super({ id, type: "attack", name, availableSector, checker });
    this.damage = damage;
  }
}
