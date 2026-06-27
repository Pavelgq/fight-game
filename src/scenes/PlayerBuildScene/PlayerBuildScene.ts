import { GameObjects, Scene } from "phaser";
import { getPlayerBuildLayout } from "../../layouts/PlayerBuildLayout";
import { Point } from "../../model/Point";
import { Button } from "../../views/Button/Button";
import {
  FIGHTING_STYLES,
  FightingStyle,
  getStyleAbilities,
} from "../../model/Player/FightingStyle";
import { FighterProfile } from "../../model/Player/FighterProfile";
import { GameSession } from "../../session/GameSession";

const MAX_NAME_LENGTH = 14;
const SELECTED_TINT = 0xffe066;

export class PlayerBuildScene extends Scene {
  private playerName = "";
  private selectedStyle?: FightingStyle;

  private nameValue!: GameObjects.Text;
  private description!: GameObjects.Text;
  private hint!: GameObjects.Text;
  private styleButtons: Button[] = [];

  constructor() {
    super("PlayerBuildScene");
  }

  create() {
    this.playerName = "";
    this.selectedStyle = undefined;
    this.styleButtons = [];

    const layout = getPlayerBuildLayout();

    this.add.image(layout.background.x, layout.background.y, "background");

    this.add
      .text(layout.title.x, layout.title.y, "Создание персонажа", {
        font: `${layout.title.fontSize}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(layout.nameLabel.x, layout.nameLabel.y, "Имя (введите с клавиатуры):", {
        font: `${layout.nameLabel.fontSize}px Arial`,
        color: "#dddddd",
      })
      .setOrigin(0.5);

    this.nameValue = this.add
      .text(layout.nameValue.x, layout.nameValue.y, "", {
        font: `${layout.nameValue.fontSize}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.description = this.add
      .text(layout.background.x, layout.styles.descriptionY, "", {
        font: `${layout.styles.descriptionFontSize}px Arial`,
        color: "#ffd700",
        align: "center",
      })
      .setOrigin(0.5);

    this.hint = this.add
      .text(layout.hint.x, layout.hint.y, "", {
        font: `${layout.hint.fontSize}px Arial`,
        color: "#ff6666",
      })
      .setOrigin(0.5);

    this.createStyleButtons(layout);
    this.createConfirmButton(layout);
    this.bindNameInput();

    this.renderName();
  }

  private createStyleButtons(layout: ReturnType<typeof getPlayerBuildLayout>) {
    FIGHTING_STYLES.forEach((style, index) => {
      const point = layout.styles.points[index];
      const button = new Button(this, point, style.name, layout.styles.button);
      button.on("pointerup", () => this.selectStyle(style));
      this.styleButtons.push(button);
    });
  }

  private createConfirmButton(layout: ReturnType<typeof getPlayerBuildLayout>) {
    const point = new Point(layout.confirm.x, layout.confirm.y);
    const button = new Button(this, point, "Создать бойца", {
      designWidth: layout.confirm.designWidth,
      fontSize: layout.confirm.fontSize,
    });
    button.on("pointerup", () => this.confirm());
  }

  private selectStyle(style: FightingStyle) {
    this.selectedStyle = style;
    this.hint.setText("");

    this.styleButtons.forEach((button, index) => {
      if (FIGHTING_STYLES[index].id === style.id) {
        button.setTint(SELECTED_TINT);
      } else {
        button.clearTint();
      }
    });

    const cards = getStyleAbilities(style)
      .map((ability) => ability.name)
      .join(", ");
    this.description.setText(`${style.description}\nКарты: ${cards}`);
  }

  private bindNameInput() {
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "Backspace") {
        this.playerName = this.playerName.slice(0, -1);
      } else if (
        event.key.length === 1 &&
        this.playerName.length < MAX_NAME_LENGTH
      ) {
        this.playerName += event.key;
      }
      this.renderName();
    });
  }

  private renderName() {
    this.nameValue.setText(this.playerName || "_");
  }

  private confirm() {
    if (!this.playerName.trim()) {
      this.hint.setText("Введите имя");
      return;
    }
    if (!this.selectedStyle) {
      this.hint.setText("Выберите стиль боя");
      return;
    }

    const profile = new FighterProfile(
      this.playerName.trim(),
      this.selectedStyle.abilityIds,
      undefined,
      this.selectedStyle.id
    );

    GameSession.get().setPlayer(profile);
    this.scene.start("RoomScene");
  }
}
