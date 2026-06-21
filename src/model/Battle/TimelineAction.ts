import { Ability } from "../Player/Ability";

export type StepDirection = 1 | -1; // +1 — вперёд (к сопернику), -1 — назад

export type TimelineAction =
  | {
      kind: "ability";
      ability: Ability;
      row?: number;
      col?: number;
      duration: number;
    }
  | {
      kind: "step";
      direction: StepDirection;
      duration: number;
    };

export function actionLabel(action: TimelineAction): string {
  if (action.kind === "step") {
    return action.direction === 1 ? "Шаг вперёд" : "Шаг назад";
  }
  return action.ability.name;
}
