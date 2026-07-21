import { Scene } from "phaser";
import { getCharacterInfoLayout } from "../../layouts/CharacterInfoLayout";
import { Point } from "../../model/Point";
import { GameSession } from "../../session/GameSession";
import { CharacterInfoScreen } from "../../screens/CharacterInfoScreen/CharacterInfoScreen";
import { Button } from "../../views/Button/Button";
import { buildCharacterInfoState } from "./characterInfoState";

export class CharacterInfoScene extends Scene {
  constructor() {
    super("CharacterInfoScene");
  }

  create() {
    const layout = getCharacterInfoLayout();
    const state = buildCharacterInfoState(
      GameSession.get().getPlayerProfile()
    );

    this.add.image(layout.background.x, layout.background.y, "background");
    this.add
      .text(layout.title.x, layout.title.y, "Информация о персонаже", {
        font: `${layout.title.fontSize}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(
        layout.statsTitle.x,
        layout.statsTitle.y,
        "Характеристики",
        {
          font: `${layout.statsTitle.fontSize}px Arial`,
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        layout.abilitiesTitle.x,
        layout.abilitiesTitle.y,
        "Экипированные приёмы",
        {
          font: `${layout.abilitiesTitle.fontSize}px Arial`,
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);

    new CharacterInfoScreen(this).mount(layout, state);

    const back = new Button(
      this,
      new Point(layout.back.x, layout.back.y),
      "Назад",
      {
        designWidth: layout.back.designWidth,
        fontSize: layout.back.fontSize,
      }
    );
    back.on("pointerup", () => this.scene.start("RoomScene"));
  }
}
