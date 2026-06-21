import { GameObjects, Scene } from "phaser";
import { actionLabel, TimelineAction } from "../../model/Battle/TimelineAction";
import { ABILITY_COLORS } from "../AbilityCard/AbilityCard";

const STEP_COLOR = 0x7f8c8d;
const EMPTY_COLOR = 0x2c3e50;

/** Полоса таймлайна раунда: блоки приёмов по порядку, ширина = длительность. */
export class TimelineStrip extends GameObjects.Container {
  private readonly stripWidth: number;
  private readonly stripHeight: number;
  private readonly roundTime: number;
  private readonly bg: GameObjects.Rectangle;
  private blocks: GameObjects.GameObject[] = [];
  private readonly budgetText: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    roundTime: number
  ) {
    super(scene, x, y);
    this.stripWidth = width;
    this.stripHeight = height;
    this.roundTime = roundTime;

    this.bg = scene.add
      .rectangle(0, 0, width, height, EMPTY_COLOR)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x000000);
    this.add(this.bg);

    this.budgetText = scene.add
      .text(0, -height * 0.85, "", {
        font: `${Math.round(height * 0.4)}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0, 1);
    this.add(this.budgetText);

    scene.add.existing(this);
  }

  render(actions: TimelineAction[], selectedIndex: number) {
    this.blocks.forEach((b) => b.destroy());
    this.blocks = [];

    const used = actions.reduce((s, a) => s + a.duration, 0);
    this.budgetText.setText(`Время: ${used} / ${this.roundTime}`);

    let cursor = 0;
    actions.forEach((action, index) => {
      const blockWidth = (action.duration / this.roundTime) * this.stripWidth;
      const color =
        action.kind === "step" ? STEP_COLOR : ABILITY_COLORS[action.ability.type];

      const rect = this.scene.add
        .rectangle(cursor, 0, blockWidth - 3, this.stripHeight - 6, color)
        .setOrigin(0, 0.5)
        .setStrokeStyle(index === selectedIndex ? 4 : 2, index === selectedIndex ? 0xffe066 : 0x000000)
        .setInteractive({ useHandCursor: true });
      rect.on("pointerup", () => this.emit("select", index));

      const label = this.scene.add
        .text(cursor + blockWidth / 2, 0, actionLabel(action), {
          font: `${Math.round(this.stripHeight * 0.22)}px Arial`,
          color: "#ffffff",
          align: "center",
          wordWrap: { width: blockWidth - 6 },
        })
        .setOrigin(0.5);

      this.add([rect, label]);
      this.blocks.push(rect, label);
      cursor += blockWidth;
    });
  }
}
