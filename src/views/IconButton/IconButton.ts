import { GameObjects, Scene } from "phaser";
import { drawPanel, FONT_DISPLAY, textColors } from "../theme";

/** Квадратная кнопка-иконка с подложкой (◀ ✕ ▶ и т.п.). */
export function createIconButton(
  scene: Scene,
  x: number,
  y: number,
  fontSize: number,
  label: string,
  onClick: () => void,
  panelSize = fontSize * 1.4
): GameObjects.Text {
  drawPanel(scene, x, y, panelSize, panelSize, { radius: 8, alpha: 0.7 });
  return scene.add
    .text(x, y, label, { font: `${fontSize}px ${FONT_DISPLAY}`, color: textColors.accent })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerup", onClick);
}
