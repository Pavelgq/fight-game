import { cx, cy, menuButton, type, u, y } from "../ui/designSystem";

const TITLE_Y = 65;
const NAME_Y = 140;
const STYLE_Y = 195;
const STATS_TITLE_Y = 275;
const STATS_Y = 325;
const HEALTH_Y = 385;
const ABILITIES_TITLE_Y = 470;
const ABILITIES_Y = 525;
const BACK_Y = 650;

export function getCharacterInfoLayout() {
  return {
    background: { x: cx, y: cy },
    title: { x: cx, y: y(TITLE_Y), fontSize: type("h1") },
    name: { x: cx, y: y(NAME_Y), fontSize: type("h2") },
    style: { x: cx, y: y(STYLE_Y), fontSize: type("body") },
    statsTitle: { x: cx, y: y(STATS_TITLE_Y), fontSize: type("h2") },
    stats: { x: cx, y: y(STATS_Y), fontSize: type("body") },
    health: { x: cx, y: y(HEALTH_Y), fontSize: type("body") },
    abilitiesTitle: {
      x: cx,
      y: y(ABILITIES_TITLE_Y),
      fontSize: type("h2"),
    },
    abilities: {
      x: cx,
      y: y(ABILITIES_Y),
      fontSize: type("body"),
      width: u(760),
    },
    back: { x: cx, y: y(BACK_Y), ...menuButton },
  };
}

export type CharacterInfoLayout = ReturnType<typeof getCharacterInfoLayout>;
