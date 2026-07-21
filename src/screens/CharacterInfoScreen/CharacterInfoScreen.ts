import { GameObjects, Scene } from "phaser";
import type { CharacterInfoLayout } from "../../layouts/CharacterInfoLayout";
import { createPanelLabel } from "../../views/PanelLabel/PanelLabel";
import { textColors } from "../../views/theme";

export type CharacterInfoViewState = {
  name: string;
  style: string;
  maxHealth: number;
  stats: {
    power: number;
    agility: number;
    stamina: number;
    speed: number;
    luck: number;
  };
  abilities: string[];
};

export class CharacterInfoScreen {
  private name!: GameObjects.Text;
  private style!: GameObjects.Text;
  private stats!: GameObjects.Text;
  private health!: GameObjects.Text;
  private abilities!: GameObjects.Text;

  constructor(private readonly scene: Scene) {}

  mount(layout: CharacterInfoLayout, initialState: CharacterInfoViewState) {
    this.name = createPanelLabel(
      this.scene,
      layout.name.x,
      layout.name.y,
      initialState.name,
      layout.name.fontSize,
      textColors.light
    );
    this.style = this.addText(
      layout.style.x,
      layout.style.y,
      layout.style.fontSize,
      textColors.accent
    );
    this.stats = this.addText(
      layout.stats.x,
      layout.stats.y,
      layout.stats.fontSize,
      textColors.light
    );
    this.health = this.addText(
      layout.health.x,
      layout.health.y,
      layout.health.fontSize,
      textColors.light
    );
    this.abilities = this.addText(
      layout.abilities.x,
      layout.abilities.y,
      layout.abilities.fontSize,
      textColors.light,
      layout.abilities.width
    );

    this.refresh(initialState);
  }

  refresh(state: CharacterInfoViewState) {
    this.name.setText(state.name);
    this.style.setText(`Стиль боя: ${state.style}`);
    this.stats.setText(
      `Сила: ${state.stats.power}  •  Ловкость: ${state.stats.agility}  •  ` +
        `Выносливость: ${state.stats.stamina}\n` +
        `Скорость: ${state.stats.speed}  •  Удача: ${state.stats.luck}`
    );
    this.health.setText(`Максимальное здоровье: ${state.maxHealth}`);
    this.abilities.setText(
      state.abilities.length > 0
        ? state.abilities.join("  •  ")
        : "Нет экипированных приёмов"
    );
  }

  private addText(
    x: number,
    y: number,
    fontSize: number,
    color: string,
    wordWrapWidth?: number
  ): GameObjects.Text {
    return this.scene.add
      .text(x, y, "", {
        font: `${fontSize}px Arial`,
        color,
        align: "center",
        wordWrap: wordWrapWidth ? { width: wordWrapWidth } : undefined,
      })
      .setOrigin(0.5);
  }
}
