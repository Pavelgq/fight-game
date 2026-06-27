import { gameConfig } from "../config";
import { getDisplayPixelRatio } from "./displayScale";

const DPR = getDisplayPixelRatio();

/**
 * Логическое design-разрешение — в нём думаем при вёрстке (1280×720).
 * Координаты на canvas = design × DPR.
 */
export const DESIGN = {
  width: gameConfig.viewportWidth,
  height: gameConfig.viewportHeight,
} as const;

/** Размер внутреннего буфера Phaser (с учётом Retina). */
export const CANVAS = {
  width: DESIGN.width * DPR,
  height: DESIGN.height * DPR,
} as const;

export const dpr = DPR;

/** Отступы в design-пикселях. */
export const space = {
  screen: 16,
  sm: 12,
  md: 24,
  lg: 40,
  xl: 64,
} as const;

/** Именованные вертикальные зоны экрана (design px). */
export const regions = {
  header: 56,
  footer: 88,
} as const;

/** Типографика в design-пикселях. */
export const typeScale = {
  h1: 40,
  h2: 29,
  body: 17,
  label: 15,
  caption: 13,
} as const;

export type TypeRole = keyof typeof typeScale;

/** Центр design-канваса в canvas-пикселях. */
export const cx = (DESIGN.width / 2) * DPR;
export const cy = (DESIGN.height / 2) * DPR;

/** Design px → canvas px. */
export function x(designPx: number): number {
  return designPx * DPR;
}

export function y(designPx: number): number {
  return designPx * DPR;
}

export function w(designPx: number): number {
  return designPx * DPR;
}

export function h(designPx: number): number {
  return designPx * DPR;
}

export function u(designPx: number): number {
  return Math.round(designPx * DPR);
}

export function type(role: TypeRole): number {
  return u(typeScale[role]);
}

export const menuButton = {
  designWidth: 320,
  fontSize: 28,
  gap: 14,
} as const;

export const battleButton = {
  designWidth: 132,
  fontSize: 22,
} as const;
