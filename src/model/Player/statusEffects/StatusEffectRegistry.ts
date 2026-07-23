import { StatusEffect, StatusEffectId } from "../StatusEffect";
import { statusEffects } from "./content";

/** Реестр контента: определения статус-эффектов по стабильному id (нужен для рехидратации из DTO). */
export const STATUS_EFFECTS: StatusEffect[] = statusEffects;

const byId = new Map<StatusEffectId, StatusEffect>(STATUS_EFFECTS.map((e) => [e.id, e]));

export function getStatusEffect(id: StatusEffectId): StatusEffect {
  const effect = byId.get(id);
  if (!effect) {
    throw new Error(`Нет статус-эффекта с id: ${id}`);
  }
  return effect;
}

export const statusEffectRegistry = {
  all(): StatusEffect[] {
    return STATUS_EFFECTS;
  },

  get: getStatusEffect,

  has(id: StatusEffectId): boolean {
    return STATUS_EFFECTS.some((e) => e.id === id);
  },
};
