import { battleConfig } from "../model/Battle/constants";
import { battleButton, CANVAS, cx, cy, DESIGN, u, x, y } from "../ui/designSystem";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

const WIDTH = DESIGN.width;
const HEIGHT = DESIGN.height;

/** Левая колонка: таймлайн, контролы, «Готово». */
const SIDEBAR_W = 196;
const PAD = 16;
const ARENA_PAD = 20;
const HEADER_H = 54;
const HAND_ZONE_H = 164;
const FIGHT_ZONE_H = 58;

/** Портретные прямоугольники 3:4 (ширина : высота). */
export const CARD_ASPECT = { width: 3, height: 4 } as const;

export function portraitHeight(width: number): number {
  return Math.round((width * CARD_ASPECT.height) / CARD_ASPECT.width);
}

function computeFieldSize(
  availW: number,
  availH: number
): { cellWidth: number; cellHeight: number } {
  const stanceBarH = 34;
  const labelOffset = 18;
  const stanceGap = 8;
  const gridAvailH = availH - stanceBarH - labelOffset - stanceGap;

  let cellWidth = Math.min(128, Math.floor((availW * 0.96) / 3));
  let cellHeight = portraitHeight(cellWidth);

  if (cellHeight * 3 > gridAvailH) {
    cellHeight = Math.max(44, Math.floor(gridAvailH / 3));
    cellWidth = Math.max(
      44,
      Math.round((cellHeight * CARD_ASPECT.width) / CARD_ASPECT.height)
    );
    cellHeight = portraitHeight(cellWidth);
  }

  cellWidth = clamp(cellWidth, 48, 128);
  cellHeight = portraitHeight(cellWidth);

  return { cellWidth, cellHeight };
}

/**
 * Слева — сайдбар с вертикальным таймлайном; в центре две арены рядом
 * (игрок слева, соперник справа); рука карт — полоса внизу.
 */
export function getBattleLayout() {
  const mainTop = HEADER_H + PAD;
  const handTop = HEIGHT - HAND_ZONE_H;
  const mainBottom = handTop - PAD;
  const mainHeight = mainBottom - mainTop;

  const centerLeft = SIDEBAR_W + PAD + ARENA_PAD;
  const centerWidth = WIDTH - centerLeft - PAD;

  const arenaGap = 24;
  const halfW = (centerWidth - arenaGap) / 2;
  const playerCenterX = centerLeft + halfW / 2;
  const enemyCenterX = centerLeft + halfW + arenaGap + halfW / 2;

  const handCount = battleConfig.handSize;
  const handPad = PAD;
  const handAvailW = WIDTH - handPad * 2;
  const cardGap = 8;
  const maxCardW = (handAvailW - (handCount - 1) * (cardGap - 6)) / handCount;
  const cardWidth = Math.round(clamp(maxCardW, 88, 128));
  const cardHeight = portraitHeight(cardWidth);
  const handCenterY = handTop + (HAND_ZONE_H - cardHeight) / 2 + cardHeight / 2;

  const { cellWidth, cellHeight } = computeFieldSize(halfW - 12, mainHeight);
  const gridWidth = cellWidth * 3;
  const gridHeight = cellHeight * 3;

  const stanceBarH = 34;
  const labelOffset = 18;
  const stanceGap = 8;

  const labelY = mainTop;
  const stanceY = labelY + labelOffset;
  const gridY = stanceY + stanceBarH + stanceGap;

  const playerGridLeft = playerCenterX - gridWidth / 2;
  const enemyGridLeft = enemyCenterX - gridWidth / 2;

  const planHeaderH = 28;
  const controlsRowH = 36;
  const sidebarInnerTop = mainTop + 6;
  const sidebarContentH = mainHeight - FIGHT_ZONE_H - PAD - 6;
  const timelineW = 104;
  const timelineX = PAD + (SIDEBAR_W - PAD * 2 - timelineW) / 2;
  const timelineY = sidebarInnerTop + planHeaderH + 8;
  const timelineH = sidebarContentH - planHeaderH - controlsRowH - 44;

  const iconDesign = 20;
  const iconBtnDesign = 30;
  const iconGap = 8;
  const controlsRowY = timelineY + timelineH + 14;
  const controlsRowW = iconBtnDesign * 3 + iconGap * 2;
  const controlsStartX = (SIDEBAR_W - controlsRowW) / 2 + iconBtnDesign / 2;

  const fightY = mainBottom - FIGHT_ZONE_H / 2;
  const fightX = SIDEBAR_W / 2;

  const hpHeight = 22;
  const hpY = PAD + hpHeight / 2;
  const hpWidth = Math.min(252, halfW - 40);

  return {
    background: { x: cx, y: cy, width: CANVAS.width, height: CANVAS.height },

    sidebar: {
      x: x(PAD / 2),
      y: y(sidebarInnerTop),
      width: u(SIDEBAR_W - PAD),
      height: u(sidebarContentH + planHeaderH + controlsRowH + 20),
    },

    planLabel: {
      x: x(SIDEBAR_W / 2),
      y: y(sidebarInnerTop + 12),
      fontSize: u(13),
    },

    round: {
      x: x((playerCenterX + enemyCenterX) / 2),
      y: y(hpY),
      fontSize: u(20),
    },
    labelFontSize: u(16),

    cellWidth: u(cellWidth),
    cellHeight: u(cellHeight),
    gridWidth: u(gridWidth),
    gridHeight: u(gridHeight),

    playerStance: {
      x: x(playerGridLeft),
      y: y(stanceY),
      width: u(gridWidth),
      height: u(stanceBarH),
    },
    enemyStance: {
      x: x(enemyGridLeft),
      y: y(stanceY),
      width: u(gridWidth),
      height: u(stanceBarH),
    },

    playerField: {
      x: x(playerGridLeft),
      y: y(gridY),
      labelX: x(playerCenterX),
      labelY: y(labelY),
    },
    enemyField: {
      x: x(enemyGridLeft),
      y: y(gridY),
      labelX: x(enemyCenterX),
      labelY: y(labelY),
    },

    log: { x: cx, y: y(handTop - 8), fontSize: u(14) },

    hand: {
      centerX: cx,
      y: y(handCenterY),
      cardWidth: u(cardWidth),
      cardHeight: u(cardHeight),
      gap: u(cardGap),
    },

    timeline: {
      x: x(timelineX),
      y: y(timelineY),
      width: u(timelineW),
      height: u(timelineH),
      nominalBudget: battleConfig.baseRoundTime,
      orientation: "vertical" as const,
    },
    timelineControls: {
      x: x(controlsStartX),
      y: y(controlsRowY),
      stepX: u(iconBtnDesign + iconGap),
      fontSize: u(iconDesign),
      btnSize: u(iconBtnDesign),
    },

    fight: {
      x: x(fightX),
      y: y(fightY),
      designWidth: Math.min(battleButton.designWidth, SIDEBAR_W - PAD * 2),
      fontSize: battleButton.fontSize,
    },
    back: { x: cx, y: y(mainTop + mainHeight / 2) },
    result: { x: cx, y: y(mainTop + mainHeight / 2), fontSize: u(48) },

    enemyHp: {
      x: x(enemyCenterX - hpWidth / 2),
      y: y(hpY),
      width: u(hpWidth),
      height: u(hpHeight),
    },
    playerHp: {
      x: x(playerCenterX - hpWidth / 2),
      y: y(hpY),
      width: u(hpWidth),
      height: u(hpHeight),
    },
  };
}

export type BattleLayout = ReturnType<typeof getBattleLayout>;

export type BattleLayoutDebugRegion =
  | "enemyHp"
  | "playerHp"
  | "playerField"
  | "enemyField"
  | "enemyStance"
  | "playerStance"
  | "hand"
  | "timeline"
  | "timelineControls"
  | "fight"
  | "back"
  | "result"
  | "round"
  | "sidebar";
