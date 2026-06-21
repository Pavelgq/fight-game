import { AvailableSectionState } from "../../Field/Field";
import { constant } from "./checkers";
import { defence } from "./factories";

const upperBodySector: AvailableSectionState = [
  [true, true, true],
  [true, true, true],
  [false, false, false],
];

export const defences = [
  defence({
    id: "one_hand_block",
    name: "Блок одной рукой",
    availableSector: upperBodySector,
    checker: constant(0.2),
  }),
  defence({
    id: "two_hands_block",
    name: "Блок двумя руками",
    availableSector: upperBodySector,
    checker: constant(0.1),
  }),
];
