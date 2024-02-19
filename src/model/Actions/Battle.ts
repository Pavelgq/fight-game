import { Field } from "../Field/Field";
import { Logger } from "../Logger";
import { Fighter } from "../Player/Fighter";
import { Point } from "../Point";
import { Round } from "./Round";

export class Battle {
  firstFighter: Fighter;
  secondFighter: Fighter;
  fields: [Field, Field];
  round: Round;

  constructor(fighter1: Fighter, fighter2: Fighter, totalRound = 3) {
    this.fields = [new Field(fighter1), new Field(fighter2)];
    this.firstFighter = fighter1;
    this.secondFighter = fighter2;
    this.round = new Round(totalRound);
  }

  start() {
    while (
      this.firstFighter.health.currentValue > 0 &&
      this.secondFighter.health.currentValue > 0
    ) {
      //Выставить удары и защиты для каждого бойца
      this.fields[0].requestAttack();
      this.fields[0].requestDefense();

      this.fields[1].requestAttack();
      this.fields[1].requestDefense();

      //Установим верный порядок хода
      this.setRightOrder();
      //Запускаем бой
      Logger.info("Запускаем бой");
      this.checkHit(this.fields[0], this.fields[1]);
      this.checkHit(this.fields[1], this.fields[0]);

      Logger.info(
        this.firstFighter.name,
        "осталось",
        this.firstFighter.health.currentValue,
        "здоровья"
      );
      Logger.info(
        this.secondFighter.name,
        "осталось",
        this.secondFighter.health.currentValue,
        "здоровья"
      );
    }
  }

  setRightOrder() {
    return this.fields.sort((a, b) => {
      return a.fighter.speed - b.fighter.speed; //FIXME: условие будет сложнее
    });
  }

  checkHit(attacking: Field, defending: Field) {
    const attackField = attacking.attackSections;
    const defenseField = defending.defenseSections;
    for (let i = 0; i < attackField.length; i++) {
      for (let j = 0; j < defenseField[i].length; j++) {
        const attackItem = attackField[i][j];
        const defenceItem = defenseField[i][j];

        if (!attackItem?.ability) continue;

        const koefAttack = attackItem.ability.checker(
          attacking.fighter,
          1,
          new Point(i, j)
        );
        const koefDef = defenceItem?.ability
          ? defenceItem?.ability.checker(defending.fighter, 1, new Point(i, j))
          : 1;

        Logger.info(attacking.fighter.name, "аттакует!");
        //@ts-ignore
        const damageArray = attackItem.ability.damage;
        const damage = damageArray[1] * koefAttack * koefDef;

        defending.fighter.health.makeDamage(damage, "point");
      }
    }
  }

  // calculate(attack: Ability, defence: Ability,) {}
}
