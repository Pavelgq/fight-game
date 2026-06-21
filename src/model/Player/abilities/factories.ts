import { AvailableSectionState } from "../../Field/Field";
import {
  Ability,
  AbilityCheckerFunc,
  AttackAbility,
  DamageConfig,
} from "../Ability";
import { constant } from "./checkers";

type AttackInput = {
  id: string;
  name: string;
  damage: DamageConfig;
  availableSector?: AvailableSectionState;
  checker?: AbilityCheckerFunc;
};

type DefenceInput = {
  id: string;
  name: string;
  checker: AbilityCheckerFunc;
  availableSector?: AvailableSectionState;
};

/** Атака. checker по умолчанию = 1 (приём всегда применим). */
export const attack = ({ checker = constant(1), ...props }: AttackInput) =>
  new AttackAbility({ ...props, checker });

/** Защита (блок) — гасит часть урона через checker. */
export const defence = (props: DefenceInput) =>
  new Ability({ type: "defence", ...props });

/** Уклонение — уводит с линии атаки через checker. */
export const dodge = (props: DefenceInput) =>
  new Ability({ type: "dodge", ...props });
