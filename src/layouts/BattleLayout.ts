import { Scale } from "phaser";
import { battleConfig } from "../model/Battle/constants";

export function getBattleLayout(scale: Scale.ScaleManager) {
  const { width, height } = scale;
  const cx = width / 2;

  const cellSize = Math.round(height * 0.07);
  const gridHalf = (cellSize * 3) / 2;
  const gridCenterY = height * 0.4;
  const attackCenterX = width * 0.28;
  const defenseCenterX = width * 0.72;

  return {
    background: { x: cx, y: height / 2 },
    round: { x: cx, y: height * 0.045, fontSize: Math.round(height * 0.04) },
    labelFontSize: Math.round(height * 0.024),

    track: {
      x: cx,
      y: height * 0.16,
      width: width * 0.46,
      height: height * 0.07,
      maxDistance: battleConfig.maxDistance,
    },
    stepBack: { x: cx - width * 0.33, y: height * 0.16 },
    stepForward: { x: cx + width * 0.33, y: height * 0.16 },

    cellSize,
    attackGrid: {
      x: attackCenterX - gridHalf,
      y: gridCenterY - gridHalf,
      labelX: attackCenterX,
      labelY: gridCenterY - gridHalf - height * 0.045,
    },
    defenseGrid: {
      x: defenseCenterX - gridHalf,
      y: gridCenterY - gridHalf,
      labelX: defenseCenterX,
      labelY: gridCenterY - gridHalf - height * 0.045,
    },

    log: { x: cx, y: height * 0.5, fontSize: Math.round(height * 0.02) },

    hand: {
      centerX: cx,
      y: height * 0.66,
      labelY: height * 0.565,
      cardWidth: width * 0.15,
      cardHeight: height * 0.13,
      gap: width * 0.012,
    },

    timeline: {
      x: width * 0.05,
      y: height * 0.87,
      width: width * 0.6,
      height: height * 0.07,
      roundTime: battleConfig.roundTime,
    },
    timelineControls: {
      x: width * 0.69,
      y: height * 0.87,
      gap: width * 0.05,
      fontSize: Math.round(height * 0.05),
    },

    fight: { x: width * 0.88, y: height * 0.66 },
    back: { x: width * 0.88, y: height * 0.06 },

    enemyHp: {
      x: width * 0.04,
      y: height * 0.09,
      width: width * 0.32,
      height: Math.round(height * 0.03),
    },
    playerHp: {
      x: width * 0.04,
      y: height * 0.95,
      width: width * 0.32,
      height: Math.round(height * 0.03),
    },

    result: { x: cx, y: height * 0.4, fontSize: Math.round(height * 0.07) },
  };
}
