import { Defense } from "./Defense";
import { Health } from "./Health";
import { Staff } from "./Staff";
import { Ability, AbilityType } from "./Ability";
import { getRandom } from "../../utils/common";
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

  constructor(name: string, abilities: Ability[]) {
    this.name = name;
    this.power = getRandom(1, 10);
    this.agility = getRandom(1, 10);
    this.stamina = getRandom(1, 10);
    this.speed = getRandom(1, 10);
    this.luck = getRandom(1, 10);
    this.health = new Health(getRandom(1, 40));
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
    return availableAbilities[getRandom(0, amount - 1)];
  }

  addAbilities(abilities: Ability[]) {
    this.abilities.push(...abilities);
  }
}
