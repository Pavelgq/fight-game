import { GameObjects, Scene } from "phaser";
import { applyTextResolution } from "../../ui/displayScale";
import { drawPanel, FONT_DISPLAY } from "../theme";

export type PanelLabelOptions = {
  padX?: number;
  padY?: number;
  panelAlpha?: number;
  panelRadius?: number;
};

/** Текст со скруглённой подложкой для читаемости поверх фона. */
export function createPanelLabel(
  scene: Scene,
  x: number,
  y: number,
  text: string,
  fontSize: number,
  color: string,
  options: PanelLabelOptions = {}
): GameObjects.Text {
  const { padX = fontSize * 0.7, padY = fontSize * 0.4, panelAlpha = 0.62, panelRadius = 8 } =
    options;

  const label = scene.add
    .text(x, y, text, { font: `${fontSize}px ${FONT_DISPLAY}`, color })
    .setOrigin(0.5);
  applyTextResolution(label);

  drawPanel(scene, x, y, label.width + padX * 2, label.height + padY * 2, {
    radius: panelRadius,
    alpha: panelAlpha,
  });
  scene.children.bringToTop(label);
  return label;
}
