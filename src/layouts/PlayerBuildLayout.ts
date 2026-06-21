import { Scale } from "phaser";
import { Point } from "../model/Point";

export function getPlayerBuildLayout(scale: Scale.ScaleManager) {
  const { width, height } = scale;
  const cx = width / 2;

  const styleXs = [width * 0.22, width * 0.5, width * 0.78];
  const stylesY = height * (380 / 720);

  return {
    background: { x: cx, y: height / 2 },
    title: {
      x: cx,
      y: height * (70 / 720),
      fontSize: Math.round(height * (40 / 720)),
    },
    nameLabel: {
      x: cx,
      y: height * (170 / 720),
      fontSize: Math.round(height * (24 / 720)),
    },
    nameValue: {
      x: cx,
      y: height * (215 / 720),
      fontSize: Math.round(height * (34 / 720)),
    },
    styles: {
      points: styleXs.map((x) => new Point(x, stylesY)),
      descriptionY: height * (470 / 720),
      descriptionFontSize: Math.round(height * (22 / 720)),
    },
    confirm: { x: cx, y: height * (620 / 720) },
    hint: {
      x: cx,
      y: height * (560 / 720),
      fontSize: Math.round(height * (22 / 720)),
    },
  };
}
