import { GameObjects, Scene } from "phaser";
import {
  RoundSimulation,
  Side,
  SimResult,
} from "../../model/Battle/simulateRound";
import { getRoundPlaybackLayout } from "../../layouts/RoundPlaybackLayout";
import { abilityColors, drawPanel, FONT, palette, textColors } from "../theme";

const STEP_COLOR = 0x6b7a93;

const RESULT_MARK: Record<SimResult, string> = {
  hit: "",
  blocked: "БЛОК",
  dodged: "УКЛОН",
  miss: "МИМО",
  interrupted: "СБИВ",
};

type Names = { left: string; right: string };

/**
 * Интерактивный попап проигрывания раунда: две шкалы (игрок сверху, соперник
 * снизу), бегунок времени, всплывающие события и анимация HP.
 * Это только визуализация — урон к моменту показа уже применён в модели.
 */
export class RoundPlayback extends GameObjects.Container {
  private readonly onClose: () => void;
  private readonly sim: RoundSimulation;
  private readonly names: Names;

  private readonly railLeft: number;
  private readonly railRight: number;
  private readonly rowY: Record<Side, number>;
  private readonly maxTime: number;

  private readonly playhead: GameObjects.Rectangle;
  private readonly hpFill: Record<Side, GameObjects.Rectangle>;
  private readonly hpText: Record<Side, GameObjects.Text>;
  private readonly hpWidth: number;
  private readonly playbackLayout: ReturnType<typeof getRoundPlaybackLayout>;

  private revealed = 0;
  private floaters: GameObjects.GameObject[] = [];
  private counter?: Phaser.Tweens.Tween;

  constructor(
    scene: Scene,
    sim: RoundSimulation,
    names: Names,
    onClose: () => void
  ) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.sim = sim;
    this.names = names;
    this.onClose = onClose;

    const layout = getRoundPlaybackLayout();
    this.playbackLayout = layout;
    const w = layout.panel.width;

    const veil = scene.add
      .rectangle(0, 0, width, height, 0x05080f, layout.veilAlpha)
      .setInteractive();
    this.add(veil);
    this.add(
      drawPanel(scene, 0, 0, w, layout.panel.height, {
        radius: layout.panel.radius,
        alpha: layout.panel.alpha,
      })
    );

    const title = scene.add
      .text(0, layout.title.y, "Раунд", {
        font: `${layout.title.fontSize}px ${FONT}`,
        color: textColors.light,
      })
      .setOrigin(0.5);
    this.add(title);

    this.railLeft = layout.rail.left;
    this.railRight = layout.rail.right;
    this.rowY = { left: layout.rail.rowLeftY, right: layout.rail.rowRightY };
    this.maxTime = Math.max(
      1,
      ...sim.intervals.map((i) => i.end),
      ...sim.events.map((e) => e.time)
    );

    // HP-бары обоих бойцов (соперник сверху, игрок снизу).
    this.hpWidth = layout.hp.width;
    this.hpFill = {} as Record<Side, GameObjects.Rectangle>;
    this.hpText = {} as Record<Side, GameObjects.Text>;
    this.buildHp("right", layout.hp.enemyY, layout.hp);
    this.buildHp("left", layout.hp.playerY, layout.hp);

    // Подписи и рельсы двух шкал.
    this.buildRail("right", names.right, palette.enemy, layout);
    this.buildRail("left", names.left, palette.player, layout);

    // Блоки действий на шкалах.
    for (const interval of sim.intervals) {
      this.buildInterval(interval);
    }

    // Бегунок времени.
    this.playhead = scene.add
      .rectangle(
        this.timeToX(0),
        (this.rowY.left + this.rowY.right) / 2,
        2,
        layout.playhead.height,
        palette.accent
      )
      .setOrigin(0.5);
    this.add(this.playhead);

    this.buildButtons(layout);

    scene.add.existing(this);
    this.setDepth(1000);
    this.updateHp();
    this.play();
  }

  private buildHp(
    side: Side,
    y: number,
    hp: ReturnType<typeof getRoundPlaybackLayout>["hp"]
  ) {
    const scene = this.scene;
    const name = side === "left" ? this.names.left : this.names.right;
    const color = side === "left" ? palette.player : palette.enemy;
    const x = -this.hpWidth / 2;

    const bg = scene.add
      .rectangle(x, y, this.hpWidth, hp.barHeight, palette.panelDeep)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, palette.panelStroke);
    const fill = scene.add
      .rectangle(x, y, this.hpWidth, hp.barHeight, color)
      .setOrigin(0, 0.5);
    const text = scene.add
      .text(0, y, name, {
        font: `${hp.nameFontSize}px ${FONT}`,
        color: textColors.light,
      })
      .setOrigin(0.5);
    text.setShadow(0, 1, "#000000", 3);

    this.add([bg, fill, text]);
    this.hpFill[side] = fill;
    this.hpText[side] = text;
  }

  private buildRail(
    side: Side,
    name: string,
    color: number,
    layout: ReturnType<typeof getRoundPlaybackLayout>
  ) {
    const scene = this.scene;
    const y = this.rowY[side];
    const rail = scene.add
      .rectangle(
        this.railLeft,
        y,
        this.railRight - this.railLeft,
        layout.rail.height,
        palette.rail,
        0.8
      )
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, palette.panelStroke);
    const label = scene.add
      .text(this.railLeft - 12, y, name, {
        font: `${layout.rail.labelFontSize}px ${FONT}`,
        color: side === "left" ? textColors.player : textColors.enemy,
      })
      .setOrigin(1, 0.5);
    this.add([rail, label]);
  }

  private timeToX(t: number): number {
    return (
      this.railLeft + (t / this.maxTime) * (this.railRight - this.railLeft)
    );
  }

  private buildInterval(interval: RoundSimulation["intervals"][number]) {
    const scene = this.scene;
    const y = this.rowY[interval.side];
    const x = this.timeToX(interval.start);
    const blockW = Math.max(2, this.timeToX(interval.end) - x);
    const rowH = this.playbackLayout.rail.height;
    const color = interval.type === "step" ? STEP_COLOR : abilityColors[interval.type];

    const rect = scene.add
      .rectangle(x + 1, y, blockW - 2, rowH - 6, color, interval.cancelled ? 0.35 : 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, interval.cancelled ? palette.danger : 0x10131c);
    const label = scene.add
      .text(x + blockW / 2, y, interval.cancelled ? "СБИВ" : interval.label, {
        font: `${Math.round(rowH * 0.32)}px ${FONT}`,
        color: "#ffffff",
        align: "center",
        wordWrap: { width: blockW - 4 },
      })
      .setOrigin(0.5);
    this.add([rect, label]);
  }

  private buildButtons(layout: ReturnType<typeof getRoundPlaybackLayout>) {
    const { y, spread } = layout.buttons;
    this.makeButton(-spread, y, "▶ Заново", () => this.play(), layout.buttons.fontSize);
    this.makeButton(0, y, "⏭ Пропустить", () => this.skip(), layout.buttons.fontSize);
    this.makeButton(spread, y, "Продолжить", () => this.close(), layout.buttons.fontSize);
  }

  private makeButton(x: number, y: number, label: string, fn: () => void, fontSize: number) {
    const scene = this.scene;
    const text = scene.add
      .text(x, y, label, { font: `${fontSize}px ${FONT}`, color: textColors.accent })
      .setOrigin(0.5);
    const panel = drawPanel(scene, x, y, text.width + fontSize * 1.4, text.height + fontSize * 0.8, {
      radius: 8,
      alpha: 0.85,
    });
    this.add(panel);
    this.add(text);
    text.setInteractive({ useHandCursor: true }).on("pointerup", fn);
  }

  private play() {
    this.counter?.remove();
    this.clearFloaters();
    this.revealed = 0;
    this.updateHp();
    this.playhead.x = this.timeToX(0);

    this.counter = this.scene.tweens.addCounter({
      from: 0,
      to: this.maxTime,
      duration: Math.max(800, this.maxTime * 240),
      onUpdate: (tween) => {
        const t = tween.getValue();
        this.playhead.x = this.timeToX(t);
        this.revealUntil(t);
      },
      onComplete: () => this.revealUntil(this.maxTime),
    });
  }

  private skip() {
    this.counter?.remove();
    this.playhead.x = this.timeToX(this.maxTime);
    this.revealUntil(this.maxTime);
  }

  private revealUntil(t: number) {
    const events = this.sim.events;
    while (this.revealed < events.length && events[this.revealed].time <= t) {
      this.spawnFloater(this.revealed);
      this.revealed += 1;
    }
    this.updateHp();
  }

  private spawnFloater(index: number) {
    const scene = this.scene;
    const event = this.sim.events[index];
    const y = this.rowY[event.defenderSide];
    const x = this.timeToX(event.time);
    const mark = RESULT_MARK[event.result];
    const content = event.damage > 0 ? `−${event.damage}` : mark || "—";
    const color =
      event.damage > 0
        ? "#ff5d5d"
        : event.result === "interrupted"
        ? textColors.accent
        : textColors.muted;

    const { floater } = this.playbackLayout;
    const text = scene.add
      .text(x, y - floater.offsetY, content, {
        font: `${floater.fontSize}px ${FONT}`,
        color,
      })
      .setOrigin(0.5);
    text.setShadow(0, 2, "#000000", 4);
    this.add(text);
    this.floaters.push(text);
    scene.tweens.add({
      targets: text,
      y: text.y - floater.floatDelta,
      alpha: { from: 1, to: 0.85 },
      duration: 400,
    });
  }

  private updateHp() {
    (["left", "right"] as Side[]).forEach((side) => {
      const taken = this.sim.events
        .slice(0, this.revealed)
        .reduce((sum, e) => (e.defenderSide === side ? sum + e.damage : sum), 0);
      const max = this.sim.maxHp[side];
      const current = Math.max(0, this.sim.startHp[side] - taken);
      const ratio = max > 0 ? current / max : 0;
      this.hpFill[side].width = this.hpWidth * Math.max(0, Math.min(1, ratio));
      const name = side === "left" ? this.names.left : this.names.right;
      this.hpText[side].setText(`${name}: ${current} / ${max}`);
    });
  }

  private clearFloaters() {
    this.floaters.forEach((f) => f.destroy());
    this.floaters = [];
  }

  private close() {
    this.counter?.remove();
    this.onClose();
    this.destroy();
  }
}
