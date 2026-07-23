import { Defense } from "./Defense";
import { Health } from "./Health";
import { Staff } from "./Staff";
import { Ability, AbilityType } from "./Ability";
import { FighterStatsDTO } from "../Battle/matchTypes";
import { Rng, defaultRng } from "../Rng";
import { Logger } from "../Logger";
import { ActiveStatusEffect, StatusEffect, StatusEffectFlags } from "./StatusEffect";

export class Fighter {
  name: string;
  health: Health = new Health(30);
  defense: Defense = new Defense({ head: 1, body: 1, foot: 1 });
  power: number = 5;
  agility: number = 5;
  stamina: number = 5;
  speed: number = 5;
  luck: number = 5;

  inventory: Staff[] = [];
  abilities: Ability[] = [];
  activeEffects: ActiveStatusEffect[] = [];

  constructor(
    name: string,
    abilities: Ability[],
    stats?: Partial<FighterStatsDTO>,
    private readonly rng: Rng = defaultRng
  ) {
    this.name = name;
    this.power = stats?.power ?? rng.nextInt(1, 10);
    this.agility = stats?.agility ?? rng.nextInt(1, 10);
    this.stamina = stats?.stamina ?? rng.nextInt(1, 10);
    this.speed = stats?.speed ?? rng.nextInt(1, 10);
    this.luck = stats?.luck ?? rng.nextInt(1, 10);
    // Стабильное здоровье, привязанное к стамине: без рандома 1–40,
    // чтобы не было нокаутов с первого раунда (диапазон ~64–100).
    this.health = new Health(60 + this.stamina * 4);
    this.abilities = abilities;

    Logger.info("Создан новый боец ", name);
    Logger.info("Характеристики: ");
    Logger.info("Здоровье: ", this.health.maxValue);
    Logger.info("Сила: ", this.power);
    Logger.info("Ловкость: ", this.agility);
    Logger.info("Скорость: ", this.speed);
    Logger.info("Удача: ", this.luck);
  }

  getAbility(types: AbilityType[]) {
    const availableAbilities = this.abilities.filter((ability) =>
      types.includes(ability.type)
    );
    const amount = availableAbilities.length;
    if (amount <= 0) return;
    return availableAbilities[this.rng.nextInt(0, amount - 1)];
  }

  addAbilities(abilities: Ability[]) {
    this.abilities.push(...abilities);
  }

  /** Применяет эффект: повторное наложение с тем же id перезаписывает (сбрасывает длительность). */
  addEffect(effect: StatusEffect): void {
    this.activeEffects = this.activeEffects.filter((a) => a.effect.id !== effect.id);
    this.activeEffects.push({ effect, roundsRemaining: effect.durationRounds });
  }

  removeEffect(effectId: string): void {
    this.activeEffects = this.activeEffects.filter((a) => a.effect.id !== effectId);
  }

  hasFlag(flag: keyof StatusEffectFlags): boolean {
    return this.activeEffects.some((a) => a.effect.flags?.[flag]);
  }

  /** Сумма числовых модификаторов всех активных эффектов (нейтральные значения, если эффектов нет). */
  effectModifiers() {
    return this.activeEffects.reduce(
      (acc, a) => ({
        powerDelta: acc.powerDelta + (a.effect.modifiers?.powerDelta ?? 0),
        agilityDelta: acc.agilityDelta + (a.effect.modifiers?.agilityDelta ?? 0),
        budgetDelta: acc.budgetDelta + (a.effect.modifiers?.budgetDelta ?? 0),
        damageTakenMultiplier:
          acc.damageTakenMultiplier * (a.effect.modifiers?.damageTakenMultiplier ?? 1),
      }),
      { powerDelta: 0, agilityDelta: 0, budgetDelta: 0, damageTakenMultiplier: 1 }
    );
  }

  /** Шаг «Завершение»: прогоняет разовые действия эффектов, тикает длительность, чистит истёкшие. */
  tickEffects(): void {
    for (const active of this.activeEffects) {
      active.effect.onRoundEnd?.(this);
      active.effect.custom?.(this);
      active.roundsRemaining -= 1;
    }
    this.activeEffects = this.activeEffects.filter((a) => a.roundsRemaining > 0);
  }
}
