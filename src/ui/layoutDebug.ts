import { GameObjects, Scene } from "phaser";
import { BattleLayout } from "../layouts/BattleLayout";
import { u } from "./designSystem";
import { FONT_BODY } from "../views/theme";

const REGION_COLORS: Record<string, number> = {
  enemyHp: 0xff4d5e,
  playerHp: 0x3fa9ff,
  playerField: 0x8cc6ff,
  enemyField: 0xff8f8f,
  enemyStance: 0xff5436,
  playerStance: 0x3d8bff,
  hand: 0x2fd27a,
  timeline: 0xffc53d,
  sidebar: 0x6b4fa0,
  timelineControls: 0xc9a227,
  fight: 0xffffff,
  back: 0xaaaaaa,
  result: 0x7cfc00,
  round: 0xf2f6ff,
};

type RectSource = {
  x: number;
  y: number;
  width: number;
  height: number;
  anchor?: "center" | "leftCenter" | "topCenter";
};

function toRect(
  scene: Scene,
  source: RectSource,
  label: string
): { x: number; y: number; w: number; h: number; label: string; color: number } {
  const color = REGION_COLORS[label] ?? 0xffffff;
  let { x, y, width, height } = source;
  const anchor = source.anchor ?? "center";

  if (anchor === "leftCenter") {
    return { x, y: y - height / 2, w: width, h: height, label, color };
  }
  if (anchor === "topCenter") {
    return { x: x - width / 2, y, w: width, h: height, label, color };
  }
  return { x: x - width / 2, y: y - height / 2, w: width, h: height, label, color };
}

/** Рисует полупрозрачные прямоугольники по ключам BattleLayout (?debug=layout). */
export function drawBattleLayoutDebug(
  scene: Scene,
  layout: BattleLayout
): GameObjects.Container {
  const container = scene.add.container(0, 0);
  container.setDepth(9999);

  const handCount = 6;
  const handTotalW =
    handCount * layout.hand.cardWidth + (handCount - 1) * layout.hand.gap;

  const regions: RectSource[] = [
    { ...layout.sidebar, anchor: "topCenter" as const },
    { ...layout.enemyHp, anchor: "leftCenter" },
    { ...layout.playerHp, anchor: "leftCenter" },
    {
      x: layout.playerField.x,
      y: layout.playerField.y,
      width: layout.gridWidth,
      height: layout.gridHeight,
      anchor: "topCenter",
    },
    {
      x: layout.enemyField.x,
      y: layout.enemyField.y,
      width: layout.gridWidth,
      height: layout.gridHeight,
      anchor: "topCenter",
    },
    { ...layout.playerStance, anchor: "topCenter" },
    { ...layout.enemyStance, anchor: "topCenter" },
    {
      x: layout.hand.centerX,
      y: layout.hand.y,
      width: handTotalW,
      height: layout.hand.cardHeight,
      anchor: "center",
    },
    { ...layout.timeline, anchor: "topCenter" as const },
    {
      x: layout.timelineControls.x + layout.timelineControls.stepX,
      y: layout.timelineControls.y,
      width:
        layout.timelineControls.btnSize * 3 + layout.timelineControls.stepX * 2,
      height: layout.timelineControls.btnSize,
      anchor: "center" as const,
    },
    {
      x: layout.fight.x,
      y: layout.fight.y,
      width: u(168),
      height: u(48),
    },
    { x: layout.back.x, y: layout.back.y, width: 160, height: 48 },
    { x: layout.result.x, y: layout.result.y, width: 400, height: 80 },
    { x: layout.round.x, y: layout.round.y, width: 200, height: 48 },
  ];

  const labels = [
    "sidebar",
    "enemyHp",
    "playerHp",
    "playerField",
    "enemyField",
    "playerStance",
    "enemyStance",
    "hand",
    "timeline",
    "timelineControls",
    "fight",
    "back",
    "result",
    "round",
  ];

  regions.forEach((region, i) => {
    const { x, y, w, h, label, color } = toRect(scene, region, labels[i]);
    const g = scene.add.graphics();
    g.fillStyle(color, 0.25);
    g.lineStyle(2, color, 0.9);
    g.fillRect(x, y, w, h);
    g.strokeRect(x, y, w, h);
    container.add(g);

    const text = scene.add.text(x + 4, y + 4, label, {
      font: `11px ${FONT_BODY}`,
      color: "#ffffff",
      backgroundColor: "#000000aa",
    });
    container.add(text);
  });

  return container;
}
