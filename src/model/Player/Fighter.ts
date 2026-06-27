import { Defense } from "./Defense";
import { Health } from "./Health";
import { Staff } from "./Staff";
import { Ability, AbilityType } from "./Ability";
import { FighterStatsDTO } from "../Battle/matchTypes";
import { Rng, defaultRng } from "../Rng";
import { Logger } from "../Logger";

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
}
