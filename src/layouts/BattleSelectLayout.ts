import { cx, cy, menuButton, type, y } from "../ui/designSystem";

const TITLE_Y = 70;
const BATTLES_START_Y = 200;
const BATTLES_GAP = 18;
const BACK_Y = 650;

export function getBattleSelectLayout() {
  return {
    background: { x: cx, y: cy },
    title: {
      x: cx,
      y: y(TITLE_Y),
      fontSize: type("h1"),
    },
    battles: {
      x: cx,
      startY: y(BATTLES_START_Y),
      gap: y(BATTLES_GAP),
      descriptionFontSize: type("label"),
      designWidth: menuButton.designWidth,
      fontSize: menuButton.fontSize,
    },
    back: {
      x: cx,
      y: y(BACK_Y),
      designWidth: menuButton.designWidth,
      fontSize: menuButton.fontSize,
    },
  };
}

export type BattleSelectLayout = ReturnType<typeof getBattleSelectLayout>;
