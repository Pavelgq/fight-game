import { Battle } from "./model/Actions/Battle";
import { Ability, AttackAbility } from "./model/Player/Ability";
import { Fighter } from "./model/Player/Fighter";

const cards = [
  new AttackAbility({
    type: "attack",
    name: "Простой удар",
    checker: (fighter, distance) => {
      return 1;
    },
    damage: [1, 2, 2, 1, 0],
  }),
  new AttackAbility({
    type: "attack",
    name: "Сложный удар",
    checker: (fighter, distance) => {
      return 1;
    },
    damage: [0, 1, 2, 1, 0],
  }),
  new AttackAbility({
    type: "attack",
    name: "Пинок",
    availableSector: [
      [false, false, false],
      [true, true, true],
      [true, true, true],
    ],
    checker: (fighter, distance) => {
      return 1;
    },
    damage: [0, 0, 1, 2, 1],
  }),
  new Ability({
    type: "defence",
    name: "Блок одной рукой",
    availableSector: [
      [true, true, true],
      [true, true, true],
      [false, false, false],
    ],
    checker: (fighter, distance) => {
      return 0.2;
    },
  }),
  new Ability({
    type: "defence",
    name: "Блок двумя руками",
    availableSector: [
      [true, true, true],
      [true, true, true],
      [false, false, false],
    ],
    checker: (fighter, distance) => {
      return 0.1;
    },
  }),
  new Ability({
    type: "dodge",
    name: "Подпрыгнуть",
    checker: (fighter, distance, point) => {
      if (point.y === 2) return 0;
      return 1.2;
    },
  }),
  new Ability({
    type: "dodge",
    name: "Пригнуться",
    checker: (fighter, distance, point) => {
      if (point.y === 0) return 0;
      return 1.2;
    },
  }),
  new Ability({
    type: "dodge",
    name: "Сместиться вправо",
    checker: (fighter, distance, point) => {
      if (point.x === 2) return 0;
      return 1.2;
    },
  }),
  new Ability({
    type: "dodge",
    name: "Сместиться влево",
    checker: (fighter, distance, point) => {
      if (point.x === 0) return 0;
      return 1.2;
    },
  }),
];

const fighter1 = new Fighter("Иван", cards);
const fighter2 = new Fighter("Аркадий", cards);

const battle = new Battle(fighter1, fighter2);

battle.start();
