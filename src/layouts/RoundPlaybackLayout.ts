import { w, h, u } from "../ui/designSystem";

const PANEL_WIDTH = 1050;
const PANEL_HEIGHT = 533;
const VEIL_ALPHA = 0.72;

const TITLE_OFFSET_Y = 32;
const ENEMY_HP_OFFSET_Y = 85;
const PLAYER_HP_OFFSET_Y = 107;
const RAIL_LEFT = -410;
const RAIL_RIGHT = 590;
const ROW_LEFT_Y = 32;
const ROW_RIGHT_Y = 64;
const PLAYHEAD_HEIGHT = 197;
const BUTTONS_OFFSET_Y = 40;
const BUTTON_SPREAD = 205;

export function getRoundPlaybackLayout() {
  const panelW = w(PANEL_WIDTH);
  const panelH = h(PANEL_HEIGHT);

  return {
    veilAlpha: VEIL_ALPHA,
    panel: { width: panelW, height: panelH, radius: 18, alpha: 0.97 },
    title: {
      y: -panelH / 2 + h(TITLE_OFFSET_Y),
      fontSize: u(32),
    },
    rail: {
      left: xLocal(RAIL_LEFT, panelW),
      right: xLocal(RAIL_RIGHT, panelW),
      height: h(36),
      labelFontSize: u(17),
      rowLeftY: h(ROW_LEFT_Y),
      rowRightY: -h(ROW_RIGHT_Y),
    },
    hp: {
      width: panelW * 0.78,
      barHeight: panelW * 0.02,
      nameFontSize: u(13),
      enemyY: -panelH / 2 + h(ENEMY_HP_OFFSET_Y),
      playerY: panelH / 2 - h(PLAYER_HP_OFFSET_Y),
    },
    playhead: { height: h(PLAYHEAD_HEIGHT) },
    buttons: {
      y: panelH / 2 - h(BUTTONS_OFFSET_Y),
      spread: w(BUTTON_SPREAD),
      fontSize: u(20),
    },
    floater: {
      offsetY: h(36),
      fontSize: u(22),
      floatDelta: h(29),
    },
  };
}

function xLocal(designOffset: number, panelW: number): number {
  return (designOffset / PANEL_WIDTH) * panelW;
}

export type RoundPlaybackLayout = ReturnType<typeof getRoundPlaybackLayout>;
