/** Настройки боя. Пока константы — позже вынесем в баланс/характеристики. */
export const battleConfig = {
  handSize: 6, // сколько карт берём в руку каждый раунд (хватает на связку)
  deckSize: 12, // размер колоды

  // --- Стойки (left/center/right) ---
  stanceCount: 3, // 0 = слева, 1 = центр, 2 = справа
  startStance: 1, // в начале раунда оба бойца — в центре
  stepTime: 1, // во сколько времени обходится один шаг (смена стойки на 1)

  // --- Экономика выносливости (бюджет таймлайна) ---
  // Бюджет времени раунда у каждого бойца = baseRoundTime + (stamina - 5) - усталость.
  baseRoundTime: 10, // базовый бюджет при стамине 5 и без усталости
  fatiguePerRound: 1, // на сколько падает бюджет за каждый прошедший раунд
  maxFatigue: 4, // потолок накопленной усталости
  minRoundBudget: 4, // нижняя граница бюджета (чтобы всегда было что разложить)

  // Максимум урона за раунд как доля от макс. HP защищающегося.
  // Гарантирует, что бой длится несколько раундов (нет убийства с первого).
  maxRoundDamageRatio: 0.35,
};

/**
 * Бюджет времени таймлайна для бойца на конкретном раунде.
 * roundIndex стартует с 0 (первый раунд — без усталости).
 *
 * Хук на будущее: карты восстановления/баффы смогут уменьшать `fatigue`
 * (или увеличивать базовый бюджет) — достаточно прокинуть модификатор сюда.
 */
export function roundBudget(stamina: number, roundIndex: number, fatigueRelief = 0): number {
  const fatigue = Math.max(
    0,
    Math.min(battleConfig.maxFatigue, battleConfig.fatiguePerRound * roundIndex) - fatigueRelief
  );
  const budget = battleConfig.baseRoundTime + (stamina - 5) - fatigue;
  return Math.max(battleConfig.minRoundBudget, budget);
}

/** Ограничивает стойку диапазоном [0, stanceCount - 1]. */
export function clampStance(stance: number): number {
  return Math.max(0, Math.min(battleConfig.stanceCount - 1, stance));
}
