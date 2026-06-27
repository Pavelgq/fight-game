import { GameObjects, Scene } from "phaser";
import { ZONE_COLS, ZONE_ROWS } from "../../model/Battle/zones";
import { GridCell } from "../GridCell/GridCell";
import { CellVisualState, FieldFacing } from "../GridCell/gridCellTypes";

export type BattleGridOptions = {
  facing: FieldFacing;
  cellWidth: number;
  cellHeight: number;
};

/**
 * Поле 3×3 из портретных GridCell (3:4).
 */
export class BattleGrid extends GameObjects.Container {
  private readonly cells: GridCell[][] = [];
  private readonly cellWidth: number;
  private readonly cellHeight: number;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    options: BattleGridOptions
  ) {
    super(scene, x, y);
    this.cellWidth = options.cellWidth;
    this.cellHeight = options.cellHeight;

    for (let row = 0; row < ZONE_ROWS; row++) {
      this.cells[row] = [];
      for (let col = 0; col < ZONE_COLS; col++) {
        const cx = col * this.cellWidth + this.cellWidth / 2;
        const cy = row * this.cellHeight + this.cellHeight / 2;
        const cell = new GridCell(scene, cx, cy, this.cellWidth, this.cellHeight);
        cell.setClickHandler(() => this.emit("cellclick", row, col));
        this.cells[row][col] = cell;
        this.add(cell);
      }
    }

    scene.add.existing(this);
  }

  setCells(states: CellVisualState[][]): void {
    for (let row = 0; row < ZONE_ROWS; row++) {
      for (let col = 0; col < ZONE_COLS; col++) {
        this.cells[row][col].applyVisualState(states[row][col]);
      }
    }
  }

  setCell(row: number, col: number, state: CellVisualState): void {
    this.cells[row][col].applyVisualState(state);
  }

  resetCells(): void {
    this.setCells(idleGrid());
  }
}

function idleGrid(): CellVisualState[][] {
  const row: CellVisualState[] = [{ kind: "idle" }, { kind: "idle" }, { kind: "idle" }];
  return [row.slice(), row.slice(), row.slice()];
}
