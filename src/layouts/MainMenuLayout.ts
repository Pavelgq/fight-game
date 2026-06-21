import { Scale } from "phaser";

export const MAIN_MENU_ITEMS = ["Начать игру", "Настройки"] as const;

export type MainMenuItem = (typeof MAIN_MENU_ITEMS)[number];

export function getMainMenuLayout(scale: Scale.ScaleManager) {
  const { width, height } = scale;

  return {
    background: {
      x: width / 2,
      y: height / 2,
    },
    buttons: {
      x: width / 2,
      startY: height * (300 / 720),
      gap: height * (20 / 720),
    },
  };
}
