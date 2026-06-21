import { GameObjects, Scene } from "phaser";

const ROWS = 3;
const COLS = 3;

const COLORS = {
  base: 0x222222,
  baseStroke: 0x555555,
  validStroke: 0xffe066,
};

type Cell = {
  rect: GameObjects.Rectangle;
  label: GameObjects.Text;
};

export class BattleGrid extends GameObjects.Container {
  private cells: Cell[][] = [];
  private cellSize: number;
  private interactiveCells = false;

  constructor(scene: Scene, x: number, y: number, cellSize: number) {
    super(scene, x, y);
    this.cellSize = cellSize;

    for (let i = 0; i < ROWS; i++) {
      this.cells[i] = [];
      for (let j = 0; j < COLS; j++) {
        const cx = j * cellSize + cellSize / 2;
        const cy = i * cellSize + cellSize / 2;

        const rect = scene.add
          .rectangle(cx, cy, cellSize - 4, cellSize - 4, COLORS.base, 0.6)
          .setStrokeStyle(2, COLORS.baseStroke);

        const label = scene.add
          .text(cx, cy, "", {
            font: `${Math.round(cellSize * 0.18)}px Arial`,
            color: "#ffffff",
            align: "center",
            wordWrap: { width: cellSize - 8 },
          })
          .setOrigin(0.5);

        rect.on("pointerup", () => {
          if (this.interactiveCells) {
            this.emit("cellclick", i, j);
          }
        });

        this.cells[i][j] = { rect, label };
        this.add([rect, label]);
      }
    }

    scene.add.existing(this);
  }

  setLabel(row: number, col: number, text: string, fill = COLORS.base) {
    const cell = this.cells[row][col];
    cell.label.setText(text);
    cell.rect.setFillStyle(fill, 0.85);
  }

  clearLabels() {
    this.forEachCell((cell) => {
      cell.label.setText("");
      cell.rect.setFillStyle(COLORS.base, 0.6);
    });
  }

  /** Подсветить клетки, доступные для текущего приёма. */
  highlightValid(predicate: (row: number, col: number) => boolean) {
    this.interactiveCells = true;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const valid = predicate(i, j);
        const cell = this.cells[i][j];
        cell.rect.setStrokeStyle(valid ? 4 : 2, valid ? COLORS.validStroke : COLORS.baseStroke);
        cell.rect.input && (cell.rect.input.enabled = true);
        if (valid) {
          cell.rect.setInteractive({ useHandCursor: true });
        } else {
          cell.rect.disableInteractive();
        }
      }
    }
  }

  clearHighlight() {
    this.interactiveCells = false;
    this.forEachCell((cell) => {
      cell.rect.setStrokeStyle(2, COLORS.baseStroke);
      cell.rect.disableInteractive();
    });
  }

  private forEachCell(fn: (cell: Cell) => void) {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        fn(this.cells[i][j]);
      }
    }
  }
}
