import { ZoneGuard } from "../Ability";

/** Защищает все клетки указанной строки (0 — голова, 1 — корпус, 2 — ноги). */
export const guardRow = (targetRow: number): ZoneGuard => (row) => row === targetRow;
