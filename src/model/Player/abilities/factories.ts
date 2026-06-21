import { AvailableSectionState } from "../../Battle/zones";
import { Ability, AttackAbility, DamageConfig, ZoneGuard } from "../Ability";

type AttackInput = {
  id: string;
  name: string;
  speed: number;
  damage: DamageConfig;
  availableSector?: AvailableSectionState;
};

type DefenceInput = {
  id: string;
  name: string;
  speed: number;
  block: number;
  availableSector?: AvailableSectionState;
};

type DodgeInput = {
  id: string;
  name: string;
  speed: number;
  guard: ZoneGuard;
};

/** Атака: наносит урон по зоне соперника, если достаёт по дистанции. */
export const attack = (props: AttackInput) => new AttackAbility(props);

/** Защита (блок): гасит урон по защищаемой клетке коэффициентом block. */
export const defence = (props: DefenceInput) =>
  new Ability({ type: "defence", ...props });

/** Уклонение: делает зоны guard неуязвимыми, пока приём активен. */
export const dodge = (props: DodgeInput) =>
  new Ability({ type: "dodge", ...props });
