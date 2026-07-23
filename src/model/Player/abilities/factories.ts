import { AvailableSectionState } from "../../Battle/zones";
import { Ability, AttackAbility, DamageConfig, ZoneGuard } from "../Ability";
import { StatusEffect } from "../StatusEffect";

type AttackInput = {
  id: string;
  name: string;
  speed: number;
  damage: DamageConfig;
  /** Дальнобойность в столбцах от своей стойки: 0 — свой, 1 — соседний, 2 — любой. */
  reach: number;
  availableSector?: AvailableSectionState;
  /** Статус-эффект, гарантированно накладываемый на защищающегося при чистом попадании. */
  inflicts?: StatusEffect;
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

/** Атака: наносит урон по столбцу соперника, если достаёт по стойке (reach). */
export const attack = (props: AttackInput) => new AttackAbility(props);

/** Защита (блок): гасит урон по защищаемой клетке коэффициентом block. */
export const defence = (props: DefenceInput) =>
  new Ability({ type: "defence", ...props });

/** Уклонение: делает зоны guard неуязвимыми, пока приём активен. */
export const dodge = (props: DodgeInput) =>
  new Ability({ type: "dodge", ...props });
