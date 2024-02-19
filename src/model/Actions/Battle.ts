import { Fighter } from "../Player/Fighter";
import { Round } from "./Round";

export class Battle {
  firstFighter: Fighter;
  secondFighter: Fighter;
  round: Round;

  constructor(fighter1: Fighter, fighter2: Fighter, totalRound = 3) {
    this.firstFighter = fighter1;
    this.secondFighter = fighter2;
    this.round = new Round(totalRound);
  }

  start() {
    //Выставить удары и защиты для каждого бойца
    //
  }
}
