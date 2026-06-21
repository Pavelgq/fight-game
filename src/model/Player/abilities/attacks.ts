import { AvailableSectionState } from "../../Battle/zones";
import { attack } from "./factories";

const noHead: AvailableSectionState = [
  [false, false, false],
  [true, true, true],
  [true, true, true],
];

const upperOnly: AvailableSectionState = [
  [true, true, true],
  [true, true, true],
  [false, false, false],
];

export const attacks = [
  attack({
    id: "jab",
    name: "Джеб",
    speed: 1,
    damage: { base: [3, 1, 0, 0, 0], power: 0.3 },
  }),
  attack({
    id: "simple_punch",
    name: "Простой удар",
    speed: 2,
    damage: { base: [2, 3, 2, 0, 0], power: 0.5 },
  }),
  attack({
    id: "hard_punch",
    name: "Сложный удар",
    speed: 3,
    damage: { base: [0, 2, 3, 1, 0], power: 0.7 },
  }),
  attack({
    id: "uppercut",
    name: "Апперкот",
    speed: 3,
    availableSector: upperOnly,
    damage: { base: [0, 3, 2, 0, 0], power: 0.8 },
  }),
  attack({
    id: "knee",
    name: "Колено",
    speed: 2,
    availableSector: noHead,
    damage: { base: [3, 2, 0, 0, 0], power: 0.6 },
  }),
  attack({
    id: "kick",
    name: "Пинок",
    speed: 3,
    availableSector: noHead,
    damage: { base: [0, 1, 2, 3, 2], power: 0.4, agility: 0.3 },
  }),
];
