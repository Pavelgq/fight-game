import { Logger } from "../Logger";
import { Ability, AttackAbility } from "../Player/Ability";
import { Fighter } from "../Player/Fighter";

export type SectionParams = {
  title: string;
  ability?: AttackAbility | Ability;
};

const disableField = [
  [
    {
      title: "голова слева",
    },
    {
      title: "голова",
    },
    {
      title: "голова справа",
    },
  ],
  [
    {
      title: "корпус слева",
    },
    {
      title: "корпус",
    },
    {
      title: "корпус справа",
    },
  ],
  [
    {
      title: "ноги слева",
    },
    {
      title: "ноги",
    },
    {
      title: "ноги справа",
    },
  ],
];

export type FieldAction = {};

export type AvailableSectionState = [
  [boolean, boolean, boolean],
  [boolean, boolean, boolean],
  [boolean, boolean, boolean]
];

export class Field {
  defenseSections: SectionParams[][] = JSON.parse(JSON.stringify(disableField));
  attackSections: SectionParams[][] = JSON.parse(JSON.stringify(disableField));
  position: number = 0;
  fighter: Fighter;

  constructor(fighter: Fighter) {
    this.fighter = fighter;

    this.requestDefense.bind(this);
    this.requestAttack.bind(this);
  }

  requestDefense() {
    const x = Math.floor(Math.random() * 2);
    const y = Math.floor(Math.random() * 2);
    const ability = this.fighter.getAbility(["defence", "dodge"]);

    Logger.info("Боец ", this.fighter.name, "Планирует");
    Logger.info("Защитить ", this.defenseSections[x][y].title);

    if (!ability) {
      Logger.info("Но не знает подходящей способности");
      return;
    }

    this.defenseSections[x][y].ability = ability;
    console.log(this.defenseSections[x][y]);

    Logger.info("Используя ", ability.name);
  }

  requestAttack() {
    const x = Math.floor(Math.random() * 2);
    const y = Math.floor(Math.random() * 2);
    const ability = this.fighter.getAbility(["attack"]);
    Logger.info("Боец ", this.fighter.name, "Планирует");
    Logger.info("Атаковать ", this.attackSections[x][y].title);

    if (!ability) {
      Logger.info("Но не знает подходящей способности");
      return;
    }

    this.attackSections[x][y].ability = ability;

    Logger.info("Используя ", ability.name);
  }
}
