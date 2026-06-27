import { battleButton, cx, cy, menuButton, type, y } from "../ui/designSystem";

export const MAIN_MENU_ITEMS = ["Начать игру", "Настройки"] as const;

export type MainMenuItem = (typeof MAIN_MENU_ITEMS)[number];

export function getMainMenuLayout() {
  return {
    background: { x: cx, y: cy },
    buttons: {
      x: cx,
      startY: y(300),
      gap: y(menuButton.gap),
      designWidth: menuButton.designWidth,
      fontSize: menuButton.fontSize,
    },
  };
}

export type MainMenuLayout = ReturnType<typeof getMainMenuLayout>;
