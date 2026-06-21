import { GameObjects, Scene, Time } from "phaser";
import { Point } from "../../model/Point";
import { getBattleLayout } from "../../layouts/BattleLayout";
import { Button } from "../../views/Button/Button";
import { BattleGrid } from "../../views/BattleGrid/BattleGrid";
import { AbilityCard, ABILITY_COLORS } from "../../views/AbilityCard/AbilityCard";
import { HealthBar } from "../../views/HealthBar/HealthBar";
import { PositionTrack } from "../../views/PositionTrack/PositionTrack";
import { TimelineStrip } from "../../views/TimelineStrip/TimelineStrip";
import { BattleLog } from "../../views/BattleLog/BattleLog";
import { Fighter } from "../../model/Player/Fighter";
import { AttackAbility } from "../../model/Player/Ability";
import { Combatant } from "../../model/Battle/Combatant";
import { battleConfig } from "../../model/Battle/constants";
import {
  currentDistance,
  recenter,
  simulateRound,
  SimEvent,
} from "../../model/Battle/simulateRound";
import { planEnemyTimeline } from "../../model/Battle/ai";

type BattleSceneData = {
  enemy?: Fighter;
};

type Layout = ReturnType<typeof getBattleLayout>;

const RESULT_TAIL: Record<SimEvent["result"], string> = {
  hit: "попадание",
  blocked: "блок",
  dodged: "уклон",
  miss: "не достал",
};

export class BattleScene extends Scene {
  private left!: Combatant;
  private right!: Combatant;

  private layout!: Layout;
  private attackGrid!: BattleGrid;
  private defenseGrid!: BattleGrid;
  private playerHp!: HealthBar;
  private enemyHp!: HealthBar;
  private track!: PositionTrack;
  private timeline!: TimelineStrip;
  private stepBackBtn!: Button;
  private stepForwardBtn!: Button;

  private battleLog = new BattleLog();
  private handCards: AbilityCard[] = [];
  private pendingHandIndex = -1;
  private selectedTimelineIndex = -1;

  private roundText!: GameObjects.Text;
  private hintText!: GameObjects.Text;
  private hintTimer?: Time.TimerEvent;
  private roundNumber = 1;
  private finished = false;

  constructor() {
    super("BattleScene");
  }

  create(data: BattleSceneData) {
    const player = this.registry.get("player") as Fighter | undefined;
    const enemy = data.enemy ?? (this.registry.get("enemy") as Fighter | undefined);

    if (!player || !enemy) {
      this.scene.start("RoomScene");
      return;
    }

    this.left = new Combatant(player, 1, 0);
    this.right = new Combatant(enemy, -1, battleConfig.startDistance);
    recenter(this.left, this.right);
    this.left.drawHand();
    this.right.drawHand();

    this.handCards = [];
    this.pendingHandIndex = -1;
    this.selectedTimelineIndex = -1;
    this.roundNumber = 1;
    this.finished = false;

    this.battleLog.clear();
    this.battleLog.addRound(`${player.name} против ${enemy.name}`);

    this.layout = getBattleLayout(this.scale);
    const layout = this.layout;

    this.add.image(layout.background.x, layout.background.y, "background");

    this.roundText = this.add
      .text(layout.round.x, layout.round.y, "Раунд 1", {
        font: `${layout.round.fontSize}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.createHealthBars(layout);
    this.createTrack(layout);
    this.createGrids(layout);
    this.createTimeline(layout);
    this.createControls(layout);
    this.createHint(layout);

    this.refresh();
  }

  private createHealthBars(layout: Layout) {
    this.enemyHp = new HealthBar(
      this,
      layout.enemyHp.x,
      layout.enemyHp.y,
      layout.enemyHp.width,
      layout.enemyHp.height,
      this.right.fighter.name
    );
    this.playerHp = new HealthBar(
      this,
      layout.playerHp.x,
      layout.playerHp.y,
      layout.playerHp.width,
      layout.playerHp.height,
      this.left.fighter.name
    );
  }

  private createTrack(layout: Layout) {
    this.track = new PositionTrack(
      this,
      layout.track.x,
      layout.track.y,
      layout.track.width,
      layout.track.height,
      layout.track.maxDistance
    );

    this.stepBackBtn = new Button(
      this,
      new Point(layout.stepBack.x, layout.stepBack.y),
      "Шаг назад"
    );
    this.stepBackBtn.on("pointerup", () => this.addStep(-1));

    this.stepForwardBtn = new Button(
      this,
      new Point(layout.stepForward.x, layout.stepForward.y),
      "Шаг вперёд"
    );
    this.stepForwardBtn.on("pointerup", () => this.addStep(1));
  }

  private createGrids(layout: Layout) {
    this.add
      .text(layout.attackGrid.labelX, layout.attackGrid.labelY, "Атака по сопернику", {
        font: `${layout.labelFontSize}px Arial`,
        color: "#ffaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(layout.defenseGrid.labelX, layout.defenseGrid.labelY, "Своя защита", {
        font: `${layout.labelFontSize}px Arial`,
        color: "#aaccff",
      })
      .setOrigin(0.5);

    this.attackGrid = new BattleGrid(
      this,
      layout.attackGrid.x,
      layout.attackGrid.y,
      layout.cellSize
    );
    this.defenseGrid = new BattleGrid(
      this,
      layout.defenseGrid.x,
      layout.defenseGrid.y,
      layout.cellSize
    );

    this.attackGrid.on("cellclick", (row: number, col: number) =>
      this.onCellClick(row, col)
    );
    this.defenseGrid.on("cellclick", (row: number, col: number) =>
      this.onCellClick(row, col)
    );
  }

  private createTimeline(layout: Layout) {
    this.timeline = new TimelineStrip(
      this,
      layout.timeline.x,
      layout.timeline.y,
      layout.timeline.width,
      layout.timeline.height,
      layout.timeline.roundTime
    );
    this.timeline.on("select", (index: number) => {
      this.selectedTimelineIndex = index;
      this.timeline.render(this.left.timeline, this.selectedTimelineIndex);
    });
  }

  private createControls(layout: Layout) {
    const { x, y, gap, fontSize } = layout.timelineControls;
    this.makeControl(x, y, fontSize, "◀", () => this.moveSelected(-1));
    this.makeControl(x + gap, y, fontSize, "✕", () => this.removeSelected());
    this.makeControl(x + gap * 2, y, fontSize, "▶", () => this.moveSelected(1));

    const fight = new Button(this, new Point(layout.fight.x, layout.fight.y), "Готово");
    fight.on("pointerup", () => this.resolveRound());

    const back = new Button(this, new Point(layout.back.x, layout.back.y), "В комнату");
    back.on("pointerup", () => this.scene.start("RoomScene"));
  }

  private makeControl(x: number, y: number, fontSize: number, label: string, fn: () => void) {
    this.add
      .text(x, y, label, { font: `${fontSize}px Arial`, color: "#ffe066" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", fn);
  }

  private createHint(layout: Layout) {
    this.hintText = this.add
      .text(layout.log.x, layout.log.y, "", {
        font: `${Math.round(layout.log.fontSize * 1.2)}px Arial`,
        color: "#ffd54f",
        align: "center",
      })
      .setOrigin(0.5, 0);
  }

  /** Дистанция с учётом уже запланированных шагов игрока. */
  private plannedDistance(): number {
    const start = currentDistance(this.left, this.right);
    const delta = this.left.timeline.reduce(
      (d, a) => (a.kind === "step" ? d - a.direction : d),
      0
    );
    return Math.max(
      battleConfig.minDistance,
      Math.min(battleConfig.maxDistance, start + delta)
    );
  }

  /** Проекция координаты игрока на дорожке с учётом запланированных шагов. */
  private projectedPlayerPos(): number {
    const delta = this.left.timeline.reduce(
      (d, a) => (a.kind === "step" ? d + a.direction : d),
      0
    );
    return this.left.position + delta;
  }

  private renderHand() {
    this.handCards.forEach((card) => card.destroy());
    this.handCards = [];

    const { cardWidth, cardHeight, gap, centerX, y } = this.layout.hand;
    const count = this.left.hand.length;
    const totalWidth = count * cardWidth + Math.max(0, count - 1) * gap;
    const startX = centerX - totalWidth / 2 + cardWidth / 2;
    const remaining = this.left.remainingTime();
    const distance = this.plannedDistance();

    this.left.hand.forEach((ability, index) => {
      const x = startX + index * (cardWidth + gap);
      const card = new AbilityCard(this, x, y, ability, cardWidth, cardHeight);

      const fitsTime = ability.speed <= remaining;
      const reaches =
        !(ability instanceof AttackAbility) || ability.reaches(distance);
      card.setEnabled(!this.finished && fitsTime && reaches);
      card.setSelected(index === this.pendingHandIndex);
      card.on("selected", () => this.selectHandCard(index));
      this.handCards.push(card);
    });
  }

  private selectHandCard(index: number) {
    if (this.finished) return;
    const ability = this.left.hand[index];
    if (!ability) return;

    if (ability.speed > this.left.remainingTime()) {
      this.flashHint("Не хватает времени на этот приём");
      return;
    }

    if (
      ability instanceof AttackAbility &&
      !ability.reaches(this.plannedDistance())
    ) {
      this.flashHint("Приём не достаёт на текущей дистанции");
      return;
    }

    // Уклонение не требует выбора зоны — ставим сразу.
    if (ability.type === "dodge") {
      this.placeFromHand(index);
      return;
    }

    this.pendingHandIndex = index;
    this.handCards.forEach((card, i) => card.setSelected(i === index));

    this.attackGrid.clearHighlight();
    this.defenseGrid.clearHighlight();
    const grid = ability.type === "attack" ? this.attackGrid : this.defenseGrid;
    grid.highlightValid((row, col) => ability.checkAvailableSector(row, col));
  }

  private onCellClick(row: number, col: number) {
    if (this.pendingHandIndex < 0) return;
    this.placeFromHand(this.pendingHandIndex, row, col);
  }

  private placeFromHand(index: number, row?: number, col?: number) {
    const ability = this.left.hand[index];
    if (!ability) return;

    if (!this.left.addAbility(ability, row, col)) {
      this.flashHint("Не хватает времени на этот приём");
      return;
    }

    this.left.hand.splice(index, 1);
    this.clearPending();
    this.refresh();
  }

  private addStep(direction: 1 | -1) {
    if (this.finished) return;
    if (!this.left.addStep(direction)) {
      this.flashHint("Не хватает времени на шаг");
      return;
    }
    this.clearPending();
    this.refresh();
  }

  private moveSelected(offset: number) {
    if (this.selectedTimelineIndex < 0) return;
    this.left.moveAction(this.selectedTimelineIndex, offset);
    this.selectedTimelineIndex = Math.max(
      0,
      Math.min(this.left.timeline.length - 1, this.selectedTimelineIndex + offset)
    );
    this.refresh();
  }

  private removeSelected() {
    const index = this.selectedTimelineIndex;
    if (index < 0) return;
    const action = this.left.timeline[index];
    if (action?.kind === "ability") {
      this.left.hand.push(action.ability);
    }
    this.left.removeAt(index);
    this.selectedTimelineIndex = -1;
    this.refresh();
  }

  private clearPending() {
    this.pendingHandIndex = -1;
    this.attackGrid.clearHighlight();
    this.defenseGrid.clearHighlight();
  }

  private syncGridLabels() {
    this.attackGrid.clearLabels();
    this.defenseGrid.clearLabels();
    for (const action of this.left.timeline) {
      if (action.kind !== "ability") continue;
      if (action.row === undefined || action.col === undefined) continue;
      if (action.ability.type === "attack") {
        this.attackGrid.setLabel(action.row, action.col, action.ability.name, ABILITY_COLORS.attack);
      } else if (action.ability.type === "defence") {
        this.defenseGrid.setLabel(action.row, action.col, action.ability.name, ABILITY_COLORS.defence);
      }
    }
  }

  private updateStepButtons() {
    const distance = this.plannedDistance();
    const hasTime = this.left.canAdd(battleConfig.stepTime) && !this.finished;
    this.stepBackBtn.setEnabled(hasTime && distance < battleConfig.maxDistance);
    this.stepForwardBtn.setEnabled(hasTime && distance > battleConfig.minDistance);
  }

  private refresh() {
    this.track.setPositions(
      this.projectedPlayerPos(),
      this.right.position,
      this.plannedDistance()
    );
    this.timeline.render(this.left.timeline, this.selectedTimelineIndex);
    this.syncGridLabels();
    this.renderHand();
    this.updateStepButtons();
    this.enemyHp.setValue(
      this.right.fighter.health.currentValue,
      this.right.fighter.health.maxValue
    );
    this.playerHp.setValue(
      this.left.fighter.health.currentValue,
      this.left.fighter.health.maxValue
    );
  }

  private flashHint(message: string) {
    this.hintText.setText(message);
    this.hintTimer?.remove();
    this.hintTimer = this.time.delayedCall(1800, () => this.hintText.setText(""));
  }

  private resolveRound() {
    if (this.finished) return;

    planEnemyTimeline(this.right);
    const events = simulateRound(this.left, this.right);

    this.battleLog.addRound(`Раунд ${this.roundNumber}`);
    if (events.length === 0) {
      this.battleLog.addLine("Никто не дотянулся до соперника");
    }
    for (const event of events) {
      const tail =
        event.damage > 0
          ? `${RESULT_TAIL[event.result]} −${event.damage}`
          : RESULT_TAIL[event.result];
      this.battleLog.addLine(`${event.attacker}: ${event.ability} → ${event.zone} (${tail})`);
    }

    const playerDead = this.left.fighter.health.isDeath();
    const enemyDead = this.right.fighter.health.isDeath();
    if (playerDead || enemyDead) {
      this.selectedTimelineIndex = -1;
      this.refresh();
      this.endBattle(playerDead, enemyDead);
      return;
    }

    this.roundNumber += 1;
    this.roundText.setText(`Раунд ${this.roundNumber}`);
    this.selectedTimelineIndex = -1;
    this.left.drawHand();
    this.right.drawHand();
    this.refresh();
  }

  private endBattle(playerDead: boolean, enemyDead: boolean) {
    this.finished = true;
    this.clearPending();
    this.updateStepButtons();

    let message = "Победа!";
    let color = "#7CFC00";
    if (playerDead && enemyDead) {
      message = "Ничья";
      color = "#ffffff";
    } else if (playerDead) {
      message = "Поражение";
      color = "#ff5555";
    }

    this.battleLog.addLine(`Итог: ${message}`);

    this.add
      .text(this.layout.result.x, this.layout.result.y, message, {
        font: `${this.layout.result.fontSize}px Arial`,
        color,
      })
      .setOrigin(0.5);
  }
}
