import { AvailableSectionState } from "../Battle/zones";
import { Fighter } from "./Fighter";

export type AbilityType = "attack" | "defence" | "dodge";

/** Какие зоны (row, col) защищены во время уклонения (например, прыжок → ноги). */
export type ZoneGuard = (row: number, col: number) => boolean;

/**
 * Конфиг урона приёма. Только данные — формула в DamageCalculator.
 * base — скалярный базовый урон приёма (дальнобойность задаётся отдельно `reach`).
 */
export type DamageConfig = {
  base: number;
  power?: number;
  agility?: number;
  custom?: (attacker: Fighter) => number;
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
  /**
   * Дальнобойность в столбцах от собственной стойки атакующего:
   * 0 — только свой столбец, 1 — свой и соседний, 2 — любой столбец.
   */
  reach: number;
} & Omit<AbilityConstructorProps, "type" | "guard" | "block">;

export class AttackAbility extends Ability {
  damage: DamageConfig;
  /** Сколько столбцов от своей стойки достаёт атака (0/1/2). */
  reach: number;

  constructor({ damage, reach, ...rest }: AttackAbilityConstructorProps) {
    super({ type: "attack", ...rest });
    this.damage = damage;
    this.reach = reach;
  }

  /** Базовый урон без учёта характеристик (для отображения на карте). */
  get baseDamage(): number {
    return this.damage.base;
  }

  /**
   * Достаёт ли атака столбец `targetCol`, стоя в стойке `attackerStance`.
   * Зависит только от разницы столбцов и `reach`.
   */
  canReachColumn(attackerStance: number, targetCol: number): boolean {
    return Math.abs(targetCol - attackerStance) <= this.reach;
  }
}
