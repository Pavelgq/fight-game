import { dodgeOnAxis } from "./checkers";
import { dodge } from "./factories";

export const dodges = [
  dodge({ id: "jump", name: "Подпрыгнуть", checker: dodgeOnAxis("y", 2) }),
  dodge({ id: "duck", name: "Пригнуться", checker: dodgeOnAxis("y", 0) }),
  dodge({
    id: "step_right",
    name: "Сместиться вправо",
    checker: dodgeOnAxis("x", 2),
  }),
  dodge({
    id: "step_left",
    name: "Сместиться влево",
    checker: dodgeOnAxis("x", 0),
  }),
];
