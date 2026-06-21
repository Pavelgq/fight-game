import { AvailableSectionState } from "../../Battle/zones";
import { defence } from "./factories";

const upperBodySector: AvailableSectionState = [
  [true, true, true],
  [true, true, true],
  [false, false, false],
];

const legsSector: AvailableSectionState = [
  [false, false, false],
  [false, false, false],
  [true, true, true],
];

export const defences = [
  defence({
    id: "one_hand_block",
    name: "Блок одной рукой",
    speed: 2,
    block: 0.5,
    availableSector: upperBodySector,
  }),
  defence({
    id: "two_hands_block",
    name: "Блок двумя руками",
    speed: 3,
    block: 0.2,
    availableSector: upperBodySector,
  }),
  defence({
    id: "low_block",
    name: "Блок ног",
    speed: 2,
    block: 0.4,
    availableSector: legsSector,
  }),
];
