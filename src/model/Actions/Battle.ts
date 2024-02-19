import { Field } from "../Field/Field";
import { Fighter } from "../Player/Fighter";
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

    //Показываем поле для выставления навыков
    const field1 = new Field(this.firstFighter)
    const field2 = new Field(this.secondFighter)

    //Выставить удары и защиты для каждого бойца
    field1.requestAttack();
    field1.requestDefense();

    field2.requestAttack();
    field2.requestDefense();

    //Установим верный порядок хода
    this.setRightOrder()
    //Запускаем бой

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

        // const health = calculate(attackItem.ability.

        
      }
      
    }
  
  }

  // calculate(attack: Ability, defence: Ability,) {}
}
