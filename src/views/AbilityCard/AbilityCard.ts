import { GameObjects, Scene } from "phaser";
import { Ability, AbilityType } from "../../model/Player/Ability";

export const ABILITY_COLORS: Record<AbilityType, number> = {
  attack: 0xc0392b,
  defence: 0x2980b9,
  dodge: 0x27ae60,
};

const TYPE_LABEL: Record<AbilityType, string> = {
  attack: "Атака",
  defence: "Защита",
  dodge: "Уклон",
};

export class AbilityCard extends GameObjects.Container {
  readonly ability: Ability;
  private bg: GameObjects.Rectangle;
  private enabled = true;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    ability: Ability,
    width: number,
    height: number
  ) {
    super(scene, x, y);
    this.ability = ability;

    this.bg = scene.add
      .rectangle(0, 0, width, height, ABILITY_COLORS[ability.type])
      .setStrokeStyle(2, 0x000000);

    const name = scene.add
      .text(0, -height * 0.12, ability.name, {
        font: `${Math.round(height * 0.16)}px Arial`,
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 12 },
      })
      .setOrigin(0.5);

    const type = scene.add
      .text(0, height * 0.32, `${TYPE_LABEL[ability.type]} · ⏱${ability.speed}`, {
        font: `${Math.round(height * 0.13)}px Arial`,
        color: "#eeeeee",
      })
      .setOrigin(0.5);

    this.add([this.bg, name, type]);

    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on("pointerup", () => {
      if (this.enabled) this.emit("selected", this);
    });

    scene.add.existing(this);
  }

  setSelected(selected: boolean) {
    this.bg.setStrokeStyle(selected ? 4 : 2, selected ? 0xffe066 : 0x000000);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.4);
  }
}
