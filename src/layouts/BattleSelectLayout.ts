import { Scale } from "phaser";

export function getBattleSelectLayout(scale: Scale.ScaleManager) {
  const { width, height } = scale;
  const cx = width / 2;

  return {
    background: { x: cx, y: height / 2 },
    title: {
      x: cx,
      y: height * (70 / 720),
      fontSize: Math.round(height * (40 / 720)),
    },
    battles: {
      x: cx,
      startY: height * (200 / 720),
      gap: height * (18 / 720),
      descriptionFontSize: Math.round(height * (18 / 720)),
    },
    back: { x: cx, y: height * (650 / 720) },
  };
}
