import { GameObjects, Scene } from "phaser";
import { actionLabel, TimelineAction } from "../../model/Battle/TimelineAction";
import { ABILITY_COLORS } from "../AbilityCard/AbilityCard";
import { FONT, palette, textColors } from "../theme";

const STEP_COLOR = 0x6b7a93;
const EMPTY_COLOR = palette.panelDeep;

export type TimelineOrientation = "horizontal" | "vertical";

/** Полоса таймлайна: блоки приёмов, длина пропорциональна длительности. */
export class TimelineStrip extends GameObjects.Container {
  private readonly trackWidth: number;
  private readonly trackHeight: number;
  private readonly orientation: TimelineOrientation;
  private nominalBudget: number;
  private readonly bg: GameObjects.Rectangle;
  private blocks: GameObjects.GameObject[] = [];
  private readonly budgetText: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    nominalBudget: number,
    orientation: TimelineOrientation = "horizontal"
  ) {
    super(scene, x, y);
    this.trackWidth = width;
    this.trackHeight = height;
    this.orientation = orientation;
    this.nominalBudget = nominalBudget;

    const vertical = orientation === "vertical";

    this.bg = scene.add
      .rectangle(0, 0, width, height, EMPTY_COLOR, 0.85)
      .setOrigin(0, vertical ? 0 : 0.5)
      .setStrokeStyle(2, palette.panelStroke);
    this.add(this.bg);

    this.budgetText = scene.add
      .text(vertical ? width / 2 : 0, vertical ? -6 : -height * 0.85, "", {
        font: `${Math.round(height * (vertical ? 0.075 : 0.4))}px ${FONT}`,
        color: textColors.light,
        align: "center",
        wordWrap: vertical ? { width } : undefined,
      })
      .setOrigin(vertical ? 0.5 : 0, 1);
    this.add(this.budgetText);

    scene.add.existing(this);
  }

  render(actions: TimelineAction[], selectedIndex: number, budget = this.nominalBudget) {
    this.blocks.forEach((b) => b.destroy());
    this.blocks = [];

    const used = actions.reduce((s, a) => s + a.duration, 0);
    const scaleMax = Math.max(budget, used, 1);
    this.budgetText.setText(used > 0 ? `${used}/${budget}` : `0/${budget}`);

    if (this.orientation === "vertical") {
      this.renderVertical(actions, selectedIndex, scaleMax);
    } else {
      this.renderHorizontal(actions, selectedIndex, scaleMax);
    }
  }

  private renderHorizontal(actions: TimelineAction[], selectedIndex: number, scaleMax: number) {
    let cursor = 0;
    actions.forEach((action, index) => {
      const blockWidth = (action.duration / scaleMax) * this.trackWidth;
      this.addBlock(
        cursor + 1.5,
        0,
        blockWidth - 3,
        this.trackHeight - 6,
        action,
        index === selectedIndex,
        index,
        "horizontal"
      );
      cursor += blockWidth;
    });
  }

  private renderVertical(actions: TimelineAction[], selectedIndex: number, scaleMax: number) {
    let cursor = 0;
    actions.forEach((action, index) => {
      const blockHeight = (action.duration / scaleMax) * this.trackHeight;
      this.addBlock(
        0,
        cursor + 1.5,
        this.trackWidth - 6,
        blockHeight - 3,
        action,
        index === selectedIndex,
        index,
        "vertical"
      );
      cursor += blockHeight;
    });
  }

  private addBlock(
    bx: number,
    by: number,
    bw: number,
    bh: number,
    action: TimelineAction,
    selected: boolean,
    index: number,
    mode: TimelineOrientation
  ) {
    const color =
      action.kind === "step" ? STEP_COLOR : ABILITY_COLORS[action.ability.type];

    const rect = this.scene.add
      .rectangle(bx, by, bw, bh, color)
      .setOrigin(0, mode === "vertical" ? 0 : 0.5)
      .setStrokeStyle(selected ? 4 : 2, selected ? palette.accent : 0x10131c)
      .setInteractive({ useHandCursor: true });
    rect.on("pointerup", () => this.emit("select", index));

    const labelSize = Math.round(
      Math.min(bw, bh) * (mode === "vertical" ? 0.28 : 0.22)
    );
    const label = this.scene.add
      .text(
        bx + bw / 2,
        mode === "vertical" ? by + bh / 2 : by,
        actionLabel(action),
        {
          font: `${Math.max(9, labelSize)}px ${FONT}`,
          color: "#ffffff",
          align: "center",
          wordWrap: { width: bw - 4 },
        }
      )
      .setOrigin(0.5);

    this.add([rect, label]);
    this.blocks.push(rect, label);
  }
}
