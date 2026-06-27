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

// Архетипы по «цене» времени:
//  быстрые (speed 2): малый урон, ближняя дальность (reach 0–1);
//  обычные (speed 3): средний урон, reach 1;
//  тяжёлые (speed 4–5): высокий урон, дальнобойные (reach 2).
export const attacks = [
  attack({
    id: "jab",
    name: "Джеб",
    speed: 2,
    reach: 1,
    damage: { base: 4, power: 0.3 },
  }),
  attack({
    id: "knee",
    name: "Колено",
    speed: 2,
    reach: 0,
    availableSector: noHead,
    damage: { base: 5, power: 0.6 },
  }),
  attack({
    id: "simple_punch",
    name: "Простой удар",
    speed: 3,
    reach: 1,
    damage: { base: 7, power: 0.5 },
  }),
  attack({
    id: "uppercut",
    name: "Апперкот",
    speed: 3,
    reach: 0,
    availableSector: upperOnly,
    damage: { base: 8, power: 0.8 },
  }),
  attack({
    id: "hard_punch",
    name: "Сложный удар",
    speed: 4,
    reach: 2,
    damage: { base: 10, power: 0.7 },
  }),
  attack({
    id: "kick",
    name: "Пинок",
    speed: 5,
    reach: 2,
    availableSector: noHead,
    damage: { base: 12, power: 0.4, agility: 0.3 },
  }),
];
