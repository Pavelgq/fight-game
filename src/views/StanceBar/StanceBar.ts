import { GameObjects, Scene } from "phaser";
import { FONT, palette, textColors } from "../theme";
import { FieldFacing } from "../GridCell/gridCellTypes";

const STANCE_LABELS = ["Назад", "Центр", "Вперед"];

type StanceBarOptions = {
  interactive: boolean;
  accent: number;
  /** Враг справа — подписи зеркалятся («Вперёд» к центру экрана). */
  facing: FieldFacing;
};

/**
 * Ряд из трёх стоек над полем бойца.
 * Игрок: клик по клетке → событие `stance` (индекс стойки в модели).
 */
export class StanceBar extends GameObjects.Container {
  private readonly barWidth: number;
  private readonly barHeight: number;
  private readonly accent: number;
  private readonly interactive: boolean;
  private readonly facing: FieldFacing;
  private readonly cells: GameObjects.Graphics[] = [];
  private readonly labels: GameObjects.Text[] = [];
  private current = 1;
  private projected = 1;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    options: StanceBarOptions
  ) {
    super(scene, x, y);
    this.barWidth = width;
    this.barHeight = height;
    this.accent = options.accent;
    this.interactive = options.interactive;
    this.facing = options.facing;

    const cellWidth = width / 3;
    for (let i = 0; i < 3; i++) {
      const cx = i * cellWidth;
      const g = scene.add.graphics();
      this.cells.push(g);
      this.add(g);

      const label = scene.add
        .text(cx + cellWidth / 2, height / 2, this.labelAt(i), {
          font: `${Math.round(height * 0.42)}px ${FONT}`,
          color: textColors.light,
        })
        .setOrigin(0.5);
      this.labels.push(label);
      this.add(label);

      if (options.interactive) {
        const hit = scene.add
          .rectangle(cx + cellWidth / 2, height / 2, cellWidth - 4, height - 4, 0x000000, 0)
          .setInteractive({ useHandCursor: true });
        hit.on("pointerup", () => this.emit("stance", i));
        this.add(hit);
      }
    }

    this.redraw();
    scene.add.existing(this);
  }

  setStance(current: number, projected = current) {
    this.current = current;
    this.projected = projected;
    this.redraw();
  }

  /** Подпись у визуальной позиции i (зеркало для врага, смотрящего в центр). */
  private labelAt(visualIndex: number): string {
    const modelIndex = this.facing === "toward-left" ? 2 - visualIndex : visualIndex;
    return STANCE_LABELS[modelIndex];
  }

  private redraw() {
    const cellWidth = this.barWidth / 3;
    const highlight = this.interactive ? this.projected : this.current;

    for (let i = 0; i < 3; i++) {
      const g = this.cells[i];
      const left = i * cellWidth;
      const active = i === highlight;

      g.clear();
      g.fillStyle(active ? this.accent : palette.panel, active ? 0.9 : 0.82);
      g.fillRoundedRect(left + 2, 2, cellWidth - 4, this.barHeight - 4, 8);
      g.lineStyle(active ? 3 : 2, active ? palette.accent : palette.panelStroke, 1);
      g.strokeRoundedRect(left + 2, 2, cellWidth - 4, this.barHeight - 4, 8);

      this.labels[i].setText(this.labelAt(i));
      this.labels[i].setColor(active ? "#0a1120" : textColors.muted);
    }
  }
}
