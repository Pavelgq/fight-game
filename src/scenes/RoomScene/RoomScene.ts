import { Scene } from "phaser";
import { Point } from "../../model/Point";
import { getRoomLayout, ROOM_MENU } from "../../layouts/RoomLayout";
import { Button } from "../../views/Button/Button";
import { GameSession } from "../../session/GameSession";

export class RoomScene extends Scene {
  constructor() {
    super("RoomScene");
  }

  create() {
    const layout = getRoomLayout();

    this.add.image(layout.background.x, layout.background.y, "background");

    this.add
      .text(layout.title.x, layout.title.y, "Комната персонажа", {
        font: `${layout.title.fontSize}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const player = GameSession.get().getPlayerProfile();
    this.add
      .text(layout.subtitle.x, layout.subtitle.y, player?.name ?? "Безымянный боец", {
        font: `${layout.subtitle.fontSize}px Arial`,
        color: "#ffd700",
      })
      .setOrigin(0.5);

    this.createMenu(layout);
  }

  private createMenu(layout: ReturnType<typeof getRoomLayout>) {
    let offsetY = 0;

    ROOM_MENU.forEach((item) => {
      const y = layout.buttons.startY + offsetY;
      const button = new Button(this, new Point(layout.buttons.x, y), item.label, {
        designWidth: layout.buttons.designWidth,
        fontSize: layout.buttons.fontSize,
      });
      offsetY += button.layoutHeight + layout.buttons.gap;

      button.on("pointerup", () => this.scene.start(item.target));
    });
  }
}
