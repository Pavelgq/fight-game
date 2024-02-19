import { Battle } from "./model/Actions/Battle";
import { Fighter } from "./model/Player/Fighter";

const fighter1 = new Fighter('Иван');
const fighter2 = new Fighter('Аркадий');

const battle = new Battle(fighter1, fighter2);

battle.start();
