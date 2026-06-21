import { GameObjects, Scene } from "phaser";

const BG_COLOR = 0x333333;
const FILL_COLOR = 0xe74c3c;

export class HealthBar extends GameObjects.Container {
  private fill: GameObjects.Rectangle;
  private text: GameObjects.Text;
  private barWidth: number;
  private label: string;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ) {
    super(scene, x, y);
    this.barWidth = width;
    this.label = label;

    const bg = scene.add
      .rectangle(0, 0, width, height, BG_COLOR)
      .setOrigin(0, 0.5);

    this.fill = scene.add
      .rectangle(0, 0, width, height, FILL_COLOR)
      .setOrigin(0, 0.5);

    this.text = scene.add
      .text(width / 2, 0, label, {
        font: `${Math.round(height * 0.7)}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add([bg, this.fill, this.text]);
    scene.add.existing(this);
  }

  setValue(current: number, max: number) {
    const ratio = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
    this.fill.width = this.barWidth * ratio;
    this.text.setText(`${this.label}: ${Math.max(0, current)} / ${max}`);
  }
}
