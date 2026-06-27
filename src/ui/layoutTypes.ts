/** Якорь прямоугольника: 0 = левый/верхний край, 0.5 = центр, 1 = правый/нижний. */
export type Anchor = { x: number; y: number };

export type LayoutRect = {
  /** Позиция якоря в design-пикселях. */
  x: number;
  y: number;
  width: number;
  height: number;
  anchor?: Anchor;
};

export type ResolvedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CENTER: Anchor = { x: 0.5, y: 0.5 };
const TOP_LEFT: Anchor = { x: 0, y: 0 };
const LEFT_CENTER: Anchor = { x: 0, y: 0.5 };

/** Преобразует design-rect в canvas-координаты с учётом якоря. */
export function resolveRect(rect: LayoutRect): ResolvedRect {
  const anchor = rect.anchor ?? CENTER;

  return {
    x: rect.x - rect.width * anchor.x,
    y: rect.y - rect.height * anchor.y,
    width: rect.width,
    height: rect.height,
  };
}

/** Точка в design-пикселях → canvas. */
export function resolvePoint(
  designX: number,
  designY: number,
  anchor: Anchor = CENTER
): { x: number; y: number } {
  return {
    x: designX,
    y: designY,
  };
}

export const anchors = {
  center: CENTER,
  topLeft: TOP_LEFT,
  leftCenter: LEFT_CENTER,
} as const;
