import { Ability } from "../Player/Ability";

export type StepDirection = 1 | -1; // +1 — шаг вправо, -1 — шаг влево (смена стойки)

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
    return action.direction === 1 ? "Шаг вправо" : "Шаг влево";
  }
  return action.ability.name;
}
