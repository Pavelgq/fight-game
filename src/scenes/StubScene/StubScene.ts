import { Scene } from "phaser";
import { Point } from "../../model/Point";
import { Button } from "../../views/Button/Button";

export class StubScene extends Scene {
  private readonly title: string;
  private readonly backTo: string;

  constructor(key: string, title: string, backTo = "RoomScene") {
    super(key);
    this.title = title;
    this.backTo = backTo;
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, "background");

    this.add
      .text(width / 2, height * 0.32, this.title, {
        font: `${Math.round(height * (44 / 720))}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.43, "(заглушка)", {
        font: `${Math.round(height * (24 / 720))}px Arial`,
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const back = new Button(this, new Point(width / 2, height * 0.72), "Назад");
    back.on("pointerup", () => this.scene.start(this.backTo));
  }
}
