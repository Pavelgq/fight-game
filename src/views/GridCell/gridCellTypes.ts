export type FieldFacing = "toward-right" | "toward-left";

export type CellVisualState =
  | { kind: "idle" }
  | { kind: "selectable" }
  | { kind: "disabled" }
  | { kind: "tagged"; label: string; fill: number };
