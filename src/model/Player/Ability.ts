import { AvailableSectionState } from "../Battle/zones";
import { Fighter } from "./Fighter";

export type AbilityType = "attack" | "defence" | "dodge";

/** Какие зоны (row, col) защищены во время уклонения (например, прыжок → ноги). */
export type ZoneGuard = (row: number, col: number) => boolean;

/**
 * Конфиг урона приёма. Только данные — формула в DamageCalculator.
 * base[distance] — урон на дистанции; 0 означает «не достаёт» на этой дистанции.
 */
export type DamageConfig = {
  base: number[];
  power?: number;
  agility?: number;
  custom?: (attacker: Fighter, distance: number) => number;
};

type AbilityConstructorProps = {
  id: string;
  type: AbilityType;
  name: string;
  speed: number;
  availableSector?: AvailableSectionState;
  guard?: ZoneGuard;
  block?: number;
};

const DefaultAvailableSector: AvailableSectionState = [
  [true, true, true],
  [true, true, true],
  [true, true, true],
];

export class Ability {
  id: string;
  type: AbilityType;
  name: string;
  /** Время, которое приём занимает на таймлайне раунда (он же «цена»). */
  speed: number;
  availableSector: AvailableSectionState;
  /** Уклонение: какие зоны неуязвимы, пока приём активен. */
  guard?: ZoneGuard;
  /** Защита: коэффициент урона по защищаемой клетке (меньше — лучше блок). */
  block?: number;

  constructor({
    id,
    type,
    name,
    speed,
    availableSector = DefaultAvailableSector,
    guard,
    block,
  }: AbilityConstructorProps) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.speed = speed;
    this.availableSector = availableSector;
    this.guard = guard;
    this.block = block;
  }

  checkAvailableSector(row: number, col: number) {
    return this.availableSector[row][col];
  }
}

type AttackAbilityConstructorProps = {
  damage: DamageConfig;
} & Omit<AbilityConstructorProps, "type" | "guard" | "block">;

export class AttackAbility extends Ability {
  damage: DamageConfig;

  constructor({ damage, ...rest }: AttackAbilityConstructorProps) {
    super({ type: "attack", ...rest });
    this.damage = damage;
  }

  /** Достаёт ли приём соперника на данной дистанции. */
  reaches(distance: number) {
    return (this.damage.base[distance] ?? 0) > 0;
  }
}
