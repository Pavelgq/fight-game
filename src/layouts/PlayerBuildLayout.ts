import { Point } from "../model/Point";
import { cx, cy, menuButton, type, u, x, y } from "../ui/designSystem";

const TITLE_Y = 70;
const NAME_LABEL_Y = 170;
const NAME_VALUE_Y = 215;
const STYLES_Y = 380;
const STYLE_XS = [282, 640, 998] as const;
const DESCRIPTION_Y = 470;
const HINT_Y = 560;
const CONFIRM_Y = 620;

export function getPlayerBuildLayout() {
  return {
    background: { x: cx, y: cy },
    title: {
      x: cx,
      y: y(TITLE_Y),
      fontSize: type("h1"),
    },
    nameLabel: {
      x: cx,
      y: y(NAME_LABEL_Y),
      fontSize: type("body"),
    },
    nameValue: {
      x: cx,
      y: y(NAME_VALUE_Y),
      fontSize: u(34),
    },
    styles: {
      points: STYLE_XS.map((designX) => new Point(x(designX), y(STYLES_Y))),
      descriptionY: y(DESCRIPTION_Y),
      descriptionFontSize: type("body"),
      button: { designWidth: 200, fontSize: 22 },
    },
    confirm: { x: cx, y: y(CONFIRM_Y), ...menuButton },
    hint: {
      x: cx,
      y: y(HINT_Y),
      fontSize: type("body"),
    },
  };
}

export type PlayerBuildLayout = ReturnType<typeof getPlayerBuildLayout>;
