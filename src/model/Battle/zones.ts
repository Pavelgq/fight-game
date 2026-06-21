export const ZONE_ROWS = 3;
export const ZONE_COLS = 3;

export type AvailableSectionState = [
  [boolean, boolean, boolean],
  [boolean, boolean, boolean],
  [boolean, boolean, boolean]
];

export const ZONE_TITLES: string[][] = [
  ["голова слева", "голова", "голова справа"],
  ["корпус слева", "корпус", "корпус справа"],
  ["ноги слева", "ноги", "ноги справа"],
];

export const ROW_LABELS = ["голова", "корпус", "ноги"];
