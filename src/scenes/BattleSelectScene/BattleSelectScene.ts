import { Scene } from "phaser";
import { Point } from "../../model/Point";
import { getBattleSelectLayout } from "../../layouts/BattleSelectLayout";
import { Button } from "../../views/Button/Button";
import {
  Opponent,
  OPPONENTS,
} from "../../model/Opponents/opponents";
import { GameSession } from "../../session/GameSession";

export class BattleSelectScene extends Scene {
  constructor() {
    super("BattleSelectScene");
  }

  create() {
    const layout = getBattleSelectLayout();

    this.add.image(layout.background.x, layout.background.y, "background");

    this.add
      .text(layout.title.x, layout.title.y, "Выбор боя", {
        font: `${layout.title.fontSize}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.createBattleList(layout);

    const back = new Button(this, new Point(layout.back.x, layout.back.y), "Назад", {
      designWidth: layout.back.designWidth,
      fontSize: layout.back.fontSize,
    });
    back.on("pointerup", () => this.scene.start("RoomScene"));
  }

  private createBattleList(layout: ReturnType<typeof getBattleSelectLayout>) {
    let offsetY = 0;

    OPPONENTS.forEach((opponent) => {
      const y = layout.battles.startY + offsetY;
      const button = new Button(
        this,
        new Point(layout.battles.x, y),
        opponent.title,
        {
          designWidth: layout.battles.designWidth,
          fontSize: layout.battles.fontSize,
        }
      );

      const description = this.add
        .text(
          layout.battles.x,
          y + button.height / 2,
          opponent.description,
          {
            font: `${layout.battles.descriptionFontSize}px Arial`,
            color: "#cccccc",
          }
        )
        .setOrigin(0.5, 0);

      offsetY +=
        button.layoutHeight + description.height + layout.battles.gap;

      button.on("pointerup", () => this.startBattle(opponent));
    });
  }

  private startBattle(opponent: Opponent) {
    GameSession.get().setOpponent(opponent);
    this.scene.start("BattleScene");
  }
}
