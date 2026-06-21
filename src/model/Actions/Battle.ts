import { Field } from "../Field/Field";
import { Logger } from "../Logger";
import { AttackAbility } from "../Player/Ability";
import { Fighter } from "../Player/Fighter";
import { Point } from "../Point";
import { calculateDamage } from "./DamageCalculator";
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

        const attackAbility = attackItem?.ability;
        if (!(attackAbility instanceof AttackAbility)) continue;

        const distance = 1; // TODO: брать реальную дистанцию между бойцами
        const point = new Point(i, j);

        const koefAttack = attackAbility.checker(
          attacking.fighter,
          distance,
          point
        );
        const koefDef = defenceItem?.ability
          ? defenceItem.ability.checker(defending.fighter, distance, point)
          : 1;

        Logger.info(attacking.fighter.name, "аттакует!");
        const rawDamage = calculateDamage(
          attackAbility,
          attacking.fighter,
          distance
        );
        const damage = rawDamage * koefAttack * koefDef;

        defending.fighter.health.makeDamage(damage, "point");
      }
    }
  }

  // calculate(attack: Ability, defence: Ability,) {}
}
