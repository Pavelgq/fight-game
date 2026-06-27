import { Combatant } from "../model/Battle/Combatant";
import { Ability, AbilityType, AttackAbility } from "../model/Player/Ability";
import { ZONE_COLS, ZONE_ROWS } from "../model/Battle/zones";
import { BattleGrid } from "../views/BattleGrid/BattleGrid";
import { CellVisualState } from "../views/GridCell/gridCellTypes";

export type BattleFieldCallbacks = {
  onPlaced: () => void;
  onHint: (message: string) => void;
  tagFillForType: (type: AbilityType) => number;
};

/**
 * Связывает модель боя с полями игрока (защита) и врага (цель атаки).
 * Все координаты — model (row, col).
 */
export class BattleFieldController {
  private pendingHandIndex = -1;

  constructor(
    private readonly combatant: Combatant,
    private readonly playerField: BattleGrid,
    private readonly enemyField: BattleGrid,
    private readonly callbacks: BattleFieldCallbacks
  ) {
    playerField.on("cellclick", (row: number, col: number) => this.handleCellClick(row, col));
    enemyField.on("cellclick", (row: number, col: number) => this.handleCellClick(row, col));
  }

  get pendingIndex(): number {
    return this.pendingHandIndex;
  }

  /** Подписи приёмов из таймлайна на клетках. */
  syncFromTimeline(): void {
    const playerStates = idleStates();
    const enemyStates = idleStates();

    for (const action of this.combatant.timeline) {
      if (action.kind !== "ability") continue;
      if (action.row === undefined || action.col === undefined) continue;

      const tagged: CellVisualState = {
        kind: "tagged",
        label: action.ability.name,
        fill: this.callbacks.tagFillForType(action.ability.type),
      };

      if (action.ability.type === "attack") {
        enemyStates[action.row][action.col] = tagged;
      } else if (action.ability.type === "defence") {
        playerStates[action.row][action.col] = tagged;
      }
    }

    this.playerField.setCells(playerStates);
    this.enemyField.setCells(enemyStates);
  }

  beginPlacement(handIndex: number): void {
    const ability = this.combatant.hand[handIndex];
    if (!ability) return;

    this.pendingHandIndex = handIndex;
    this.applyPlacementHighlight(ability);
  }

  clearSelection(): void {
    this.pendingHandIndex = -1;
    this.syncFromTimeline();
  }

  setPendingIndex(index: number): void {
    this.pendingHandIndex = index;
  }

  handleCellClick(row: number, col: number): boolean {
    if (this.pendingHandIndex < 0) return false;

    const ability = this.combatant.hand[this.pendingHandIndex];
    if (!ability) return false;

    if (!this.combatant.addAbility(ability, row, col)) {
      this.callbacks.onHint("Не хватает времени на этот приём");
      return false;
    }

    this.combatant.hand.splice(this.pendingHandIndex, 1);
    this.pendingHandIndex = -1;
    this.callbacks.onPlaced();
    return true;
  }

  private applyPlacementHighlight(ability: Ability): void {
    const isAttack = ability.type === "attack";
    const activeGrid = isAttack ? this.enemyField : this.playerField;
    const idleGrid = isAttack ? this.playerField : this.enemyField;

    idleGrid.resetCells();

    const stance = this.combatant.projectedStance();
    const states = idleStates();

    for (let row = 0; row < ZONE_ROWS; row++) {
      for (let col = 0; col < ZONE_COLS; col++) {
        const valid =
          ability.checkAvailableSector(row, col) &&
          (ability instanceof AttackAbility
            ? ability.canReachColumn(stance, col)
            : true);
        states[row][col] = valid ? { kind: "selectable" } : { kind: "disabled" };
      }
    }

    activeGrid.setCells(states);
  }
}

function idleStates(): CellVisualState[][] {
  const row: CellVisualState[] = [
    { kind: "idle" },
    { kind: "idle" },
    { kind: "idle" },
  ];
  return [row.slice(), row.slice(), row.slice()];
}
