import { guardRow } from "./guards";
import { dodge } from "./factories";

export const dodges = [
  dodge({ id: "jump", name: "Прыжок", speed: 2, guard: guardRow(2) }),
  dodge({ id: "duck", name: "Присед", speed: 2, guard: guardRow(0) }),
  dodge({ id: "weave", name: "Уклон корпусом", speed: 3, guard: guardRow(1) }),
];
