import { GameObjects, Scene } from "phaser";
import { Point } from "../../model/Point";
import { Ability } from "../../model/Player/Ability";
import { TimelineAction } from "../../model/Battle/TimelineAction";
import { BattleLayout } from "../../layouts/BattleLayout";
import { BattleGrid } from "../../views/BattleGrid/BattleGrid";
import { Button } from "../../views/Button/Button";
import { AbilityCard } from "../../views/AbilityCard/AbilityCard";
import { HealthBar } from "../../views/HealthBar/HealthBar";
import { StanceBar } from "../../views/StanceBar/StanceBar";
import { TimelineStrip } from "../../views/TimelineStrip/TimelineStrip";
import { createBattleArena } from "../../views/BattleArena/BattleArena";
import { createIconButton } from "../../views/IconButton/IconButton";
import { createPanelLabel } from "../../views/PanelLabel/PanelLabel";
import { applyTextResolution } from "../../ui/displayScale";
import { drawPanel, FONT, FONT_DISPLAY, palette, textColors } from "../../views/theme";
import { drawBattleLayoutDebug } from "../../ui/layoutDebug";
import { isLayoutDebug } from "../../ui/scenePreview";

export type BattleScreenHandlers = {
  onStance: (target: number) => void;
  onTimelineSelect: (index: number) => void;
  onMoveTimeline: (offset: number) => void;
  onRemoveTimeline: () => void;
  onFight: () => void;
  onBackToRoom: () => void;
  onHandCardSelect: (index: number) => void;
};

export type BattleScreenRefreshState = {
  roundNumber: number;
  playerName: string;
  enemyName: string;
  playerHp: { current: number; max: number };
  enemyHp: { current: number; max: number };
  playerStance: number;
  playerProjectedStance: number;
  enemyLastStance: number;
  timeline: TimelineAction[];
  selectedTimelineIndex: number;
  timelineBudget: number;
  hand: Ability[];
  pendingHandIndex: number;
  finished: boolean;
  playing: boolean;
  remainingTime: number;
};

type EndState = {
  message: string;
  color: string;
};

export type BattleScreenFields = {
  playerField: BattleGrid;
  enemyField: BattleGrid;
};

/**
 * Визуальный слой боя. Поля отдаёт наружу для BattleFieldController.
 */
export class BattleScreen {
  private readonly scene: Scene;
  private readonly handlers: BattleScreenHandlers;

  private layout!: BattleLayout;
  private playerField!: BattleGrid;
  private enemyField!: BattleGrid;
  private playerHp!: HealthBar;
  private enemyHp!: HealthBar;
  private playerStance!: StanceBar;
  private enemyStance!: StanceBar;
  private timeline!: TimelineStrip;
  private roundText!: GameObjects.Text;
  private hintText!: GameObjects.Text;
  private handCards: AbilityCard[] = [];
  private debugOverlay?: GameObjects.Container;

  constructor(scene: Scene, handlers: BattleScreenHandlers) {
    this.scene = scene;
    this.handlers = handlers;
  }

  mount(layout: BattleLayout, initialState: BattleScreenRefreshState): BattleScreenFields {
    this.layout = layout;
    this.debugOverlay?.destroy();
    this.handCards = [];

    createBattleArena(this.scene, layout.background);

    drawPanel(
      this.scene,
      layout.sidebar.x + layout.sidebar.width / 2,
      layout.sidebar.y + layout.sidebar.height / 2,
      layout.sidebar.width,
      layout.sidebar.height,
      { radius: 12, fill: palette.panelDeep, alpha: 0.55 }
    );

    const plan = this.scene.add
      .text(layout.planLabel.x, layout.planLabel.y, "План", {
        font: `${layout.planLabel.fontSize}px ${FONT}`,
        color: textColors.muted,
      })
      .setOrigin(0.5);
    applyTextResolution(plan);

    this.roundText = createPanelLabel(
      this.scene,
      layout.round.x,
      layout.round.y,
      `Раунд ${initialState.roundNumber}`,
      layout.round.fontSize,
      textColors.light
    );

    this.enemyHp = new HealthBar(
      this.scene,
      layout.enemyHp.x,
      layout.enemyHp.y,
      layout.enemyHp.width,
      layout.enemyHp.height,
      initialState.enemyName
    );
    this.playerHp = new HealthBar(
      this.scene,
      layout.playerHp.x,
      layout.playerHp.y,
      layout.playerHp.width,
      layout.playerHp.height,
      initialState.playerName
    );

    createPanelLabel(
      this.scene,
      layout.playerField.labelX,
      layout.playerField.labelY,
      "Своя защита",
      layout.labelFontSize,
      textColors.player
    );
    createPanelLabel(
      this.scene,
      layout.enemyField.labelX,
      layout.enemyField.labelY,
      "Атака по сопернику",
      layout.labelFontSize,
      textColors.enemy
    );

    this.playerField = new BattleGrid(
      this.scene,
      layout.playerField.x,
      layout.playerField.y,
      {
        facing: "toward-right",
        cellWidth: layout.cellWidth,
        cellHeight: layout.cellHeight,
      }
    );
    this.enemyField = new BattleGrid(
      this.scene,
      layout.enemyField.x,
      layout.enemyField.y,
      {
        facing: "toward-left",
        cellWidth: layout.cellWidth,
        cellHeight: layout.cellHeight,
      }
    );

    this.playerStance = new StanceBar(
      this.scene,
      layout.playerStance.x,
      layout.playerStance.y,
      layout.playerStance.width,
      layout.playerStance.height,
      { interactive: true, accent: palette.player, facing: "toward-right" }
    );
    this.enemyStance = new StanceBar(
      this.scene,
      layout.enemyStance.x,
      layout.enemyStance.y,
      layout.enemyStance.width,
      layout.enemyStance.height,
      { interactive: false, accent: palette.enemy, facing: "toward-left" }
    );
    this.playerStance.on("stance", (target: number) => this.handlers.onStance(target));

    this.timeline = new TimelineStrip(
      this.scene,
      layout.timeline.x,
      layout.timeline.y,
      layout.timeline.width,
      layout.timeline.height,
      layout.timeline.nominalBudget,
      layout.timeline.orientation
    );
    this.timeline.on("select", (index: number) => this.handlers.onTimelineSelect(index));

    const { x: ctrlX, y: ctrlY, stepX, fontSize, btnSize } = layout.timelineControls;
    createIconButton(this.scene, ctrlX, ctrlY, fontSize, "◀", () =>
      this.handlers.onMoveTimeline(-1),
      btnSize
    );
    createIconButton(this.scene, ctrlX + stepX, ctrlY, fontSize, "✕", () =>
      this.handlers.onRemoveTimeline(),
      btnSize
    );
    createIconButton(this.scene, ctrlX + stepX * 2, ctrlY, fontSize, "▶", () =>
      this.handlers.onMoveTimeline(1),
      btnSize
    );

    const fight = new Button(
      this.scene,
      new Point(layout.fight.x, layout.fight.y),
      "Готово",
      {
        designWidth: layout.fight.designWidth,
        fontSize: layout.fight.fontSize,
      }
    );
    fight.on("pointerup", () => this.handlers.onFight());

    this.hintText = this.scene.add
      .text(layout.log.x, layout.log.y, "", {
        font: `${Math.round(layout.log.fontSize * 1.3)}px ${FONT}`,
        color: textColors.accent,
        align: "center",
      })
      .setOrigin(0.5, 0);
    this.hintText.setShadow(0, 2, "#000000", 4);

    if (isLayoutDebug()) {
      this.debugOverlay = drawBattleLayoutDebug(this.scene, layout);
    }

    this.refresh(initialState);

    return { playerField: this.playerField, enemyField: this.enemyField };
  }

  setHint(message: string): void {
    this.hintText.setText(message);
  }

  clearHint(): void {
    this.hintText.setText("");
  }

  refresh(state: BattleScreenRefreshState): void {
    this.roundText.setText(`Раунд ${state.roundNumber}`);
    this.playerStance.setStance(state.playerStance, state.playerProjectedStance);
    this.enemyStance.setStance(state.enemyLastStance);
    this.timeline.render(state.timeline, state.selectedTimelineIndex, state.timelineBudget);
    this.renderHand(state);
    this.enemyHp.setValue(state.enemyHp.current, state.enemyHp.max);
    this.playerHp.setValue(state.playerHp.current, state.playerHp.max);
  }

  showResult(message: string, color: string): void {
    const { x, y, fontSize } = this.layout.result;
    const banner = this.scene.add
      .text(x, y, message, { font: `${fontSize}px ${FONT_DISPLAY}`, color })
      .setOrigin(0.5);
    drawPanel(this.scene, x, y, banner.width + fontSize, banner.height + fontSize * 0.6, {
      radius: 14,
      fill: palette.panelDeep,
      alpha: 0.85,
    });
    this.scene.children.bringToTop(banner);

    const back = new Button(
      this.scene,
      new Point(this.layout.back.x, this.layout.back.y),
      "В комнату",
      { designWidth: 280, fontSize: 24 }
    );
    back.on("pointerup", () => this.handlers.onBackToRoom());
  }

  private renderHand(state: BattleScreenRefreshState): void {
    this.handCards.forEach((card) => card.destroy());
    this.handCards = [];

    const { cardWidth, cardHeight, gap, centerX, y: handY } = this.layout.hand;
    const count = state.hand.length;
    const overlap = Math.round(cardWidth * 0.06);
    const step = cardWidth + gap - overlap;
    const totalWidth = count * cardWidth + Math.max(0, count - 1) * (gap - overlap);
    const startX = centerX - totalWidth / 2 + cardWidth / 2;
    const remaining = state.remainingTime;

    state.hand.forEach((ability, index) => {
      const cardX = startX + index * step;
      const card = new AbilityCard(
        this.scene,
        cardX,
        handY,
        ability,
        cardWidth,
        cardHeight
      );

      const fitsTime = ability.speed <= remaining;
      card.setEnabled(!state.finished && !state.playing && fitsTime);
      card.setSelected(index === state.pendingHandIndex);
      card.on("selected", () => this.handlers.onHandCardSelect(index));
      this.handCards.push(card);
    });
  }
}
