import { Point } from "../../Point";
import { Fighter } from "../Fighter";

/** Постоянный коэффициент, не зависит от ситуации. */
export const constant = (value: number) => () => value;

/**
 * Уклонение по оси: если боец в "мёртвой" клетке оси — приём бесполезен (0),
 * иначе даёт коэффициент koef.
 */
export const dodgeOnAxis =
  (axis: "x" | "y", deadValue: number, koef = 1.2) =>
  (_fighter: Fighter, _distance: number, point: Point) =>
    point[axis] === deadValue ? 0 : koef;
