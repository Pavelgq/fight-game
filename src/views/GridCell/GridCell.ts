import { GameObjects, Scene } from "phaser";
import { FONT, palette, textColors } from "../theme";
import { CellVisualState } from "./gridCellTypes";

const CELL_INSET = 3;
const CORNER_RADIUS = 8;
const LABEL_FONT_RATIO = 0.14;
const LABEL_WRAP_INSET = 6;

const FILL_ALPHA = {
  idle: 0.72,
  disabled: 0.4,
  tagged: 0.92,
} as const;

const STROKE_WIDTH = {
  default: 2,
  selectable: 3,
} as const;

const STYLES = {
  idle: {
    fill: palette.surface,
    fillAlpha: FILL_ALPHA.idle,
    stroke: palette.panelStroke,
    strokeWidth: STROKE_WIDTH.default,
  },
  selectable: {
    fill: palette.surfaceHi,
    fillAlpha: FILL_ALPHA.idle,
    stroke: palette.accent,
    strokeWidth: STROKE_WIDTH.selectable,
  },
  disabled: {
    fill: palette.panelDeep,
    fillAlpha: FILL_ALPHA.disabled,
    stroke: palette.panelStroke,
    strokeWidth: STROKE_WIDTH.default,
  },
  tagged: {
    fillAlpha: FILL_ALPHA.tagged,
    stroke: palette.ink,
    strokeWidth: STROKE_WIDTH.default,
  },
} as const;

/**
 * Одна клетка поля — портретный прямоугольник 3:4.
 */
export class GridCell extends GameObjects.Container {
  private readonly frame: GameObjects.Graphics;
  private readonly label: GameObjects.Text;
  private readonly hit: GameObjects.Rectangle;
  private readonly cellWidth: number;
  private readonly cellHeight: number;
  private interactiveEnabled = false;
  private onClick?: () => void;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);
    this.cellWidth = width;
    this.cellHeight = height;
    const innerW = width - CELL_INSET * 2;
    const innerH = height - CELL_INSET * 2;

    this.frame = scene.add.graphics();
    this.drawFrame(STYLES.idle.fill, STYLES.idle.fillAlpha, STYLES.idle.stroke, STYLES.idle.strokeWidth);

    this.label = scene.add
      .text(0, 0, "", {
        font: `${Math.round(width * LABEL_FONT_RATIO)}px ${FONT}`,
        color: textColors.light,
        align: "center",
        wordWrap: { width: innerW - LABEL_WRAP_INSET },
      })
      .setOrigin(0.5);

    const hit = scene.add
      .rectangle(0, 0, innerW, innerH, 0x000000, 0);
    hit.on("pointerup", () => {
      if (this.interactiveEnabled) this.onClick?.();
    });
    this.hit = hit;

    this.add([this.frame, this.label, hit]);
    scene.add.existing(this);
    this.applyVisualState({ kind: "idle" });
  }

  applyVisualState(state: CellVisualState): void {
    switch (state.kind) {
      case "idle":
        this.drawFrame(STYLES.idle.fill, STYLES.idle.fillAlpha, STYLES.idle.stroke, STYLES.idle.strokeWidth);
        this.label.setText("");
        this.setHitEnabled(false);
        break;
      case "selectable":
        this.drawFrame(
          STYLES.selectable.fill,
          STYLES.selectable.fillAlpha,
          STYLES.selectable.stroke,
          STYLES.selectable.strokeWidth
        );
        this.label.setText("");
        this.setHitEnabled(true);
        break;
      case "disabled":
        this.drawFrame(
          STYLES.disabled.fill,
          STYLES.disabled.fillAlpha,
          STYLES.disabled.stroke,
          STYLES.disabled.strokeWidth
        );
        this.label.setText("");
        this.setHitEnabled(false);
        break;
      case "tagged":
        this.drawFrame(state.fill, STYLES.tagged.fillAlpha, STYLES.tagged.stroke, STYLES.tagged.strokeWidth);
        this.label.setText(state.label);
        this.setHitEnabled(false);
        break;
    }
  }

  setClickHandler(handler: () => void): void {
    this.onClick = handler;
  }

  private drawFrame(fill: number, fillAlpha: number, stroke: number, strokeWidth: number) {
    const w = this.cellWidth - CELL_INSET * 2;
    const h = this.cellHeight - CELL_INSET * 2;
    const left = -w / 2;
    const top = -h / 2;
    this.frame.clear();
    this.frame.fillStyle(fill, fillAlpha);
    this.frame.fillRoundedRect(left, top, w, h, CORNER_RADIUS);
    this.frame.lineStyle(strokeWidth, stroke, 1);
    this.frame.strokeRoundedRect(left, top, w, h, CORNER_RADIUS);
  }

  private setHitEnabled(enabled: boolean) {
    this.interactiveEnabled = enabled;
    if (enabled) {
      this.hit.setInteractive({ useHandCursor: true });
    } else {
      this.hit.disableInteractive();
    }
  }
}
