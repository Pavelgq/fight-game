import { Battle } from "./model/Actions/Battle";
import { Fighter } from "./model/Player/Fighter";

const fighter1 = new Fighter();
const fighter2 = new Fighter();

const battle = new Battle(fighter1, fighter2);

battle.start();
