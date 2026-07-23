import { damageOverTime } from "./factories";

/**
 * Минимальный пример контента для примитива статус-эффектов (A2).
 * Полноценный набор — по роадмапу (E2: кровотечение, E3: расходники).
 */
export const statusEffects = [
  damageOverTime({
    id: "bleeding",
    name: "Кровотечение",
    polarity: "negative",
    durationRounds: 2,
    hpPerRound: 4,
  }),
];
