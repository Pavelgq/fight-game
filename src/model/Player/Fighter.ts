import { Defense } from "./Defense";
import { Health } from "./Health";
import { Staff } from "./Staff";
import { Technique } from "./Technique";

export class Fighter {
  health: Health = new Health(30);
  defense: Defense = new Defense({ head: 1, body: 1, foot: 1 });
  power: number = 5;
  agility: number = 5;
  stamina: number = 5;
  luck: number = 5;

  inventory: Staff[] = [];
  techniques: Technique[] = [];

  constructor() {}
}
