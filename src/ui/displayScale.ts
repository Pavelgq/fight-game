import { gameConfig } from "../config";

/** DPR для HiDPI-рендера, с потолком чтобы не раздувать буфер на 3x-экранах. */
export function getDisplayPixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, gameConfig.maxDpr);
}

/** Делает Phaser Text чётче на Retina (отдельная текстура с большим разрешением). */
export function applyTextResolution(text: { setResolution: (value: number) => unknown }): void {
  const ratio = getDisplayPixelRatio();
  if (ratio > 1) {
    text.setResolution(ratio);
  }
}
