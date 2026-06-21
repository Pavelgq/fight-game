import { attack } from "./factories";

export const attacks = [
  attack({
    id: "simple_punch",
    name: "Простой удар",
    damage: { base: [1, 2, 2, 1, 0], power: 0.5 },
  }),
  attack({
    id: "hard_punch",
    name: "Сложный удар",
    damage: { base: [0, 1, 2, 1, 0], power: 0.7 },
  }),
  attack({
    id: "kick",
    name: "Пинок",
    availableSector: [
      [false, false, false],
      [true, true, true],
      [true, true, true],
    ],
    damage: { base: [0, 0, 1, 2, 1], power: 0.4, agility: 0.3 },
  }),
];
