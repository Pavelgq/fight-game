import { Scene } from "phaser";
import { Fighter } from "../../model/Player/Fighter";

type GameSceneData = {
  fighter?: Fighter;
};

export class GameScene extends Scene {

  constructor() {
    super('GameScene')
  }

  create(data: GameSceneData) {
    const { width, height } = this.scale;
    const fighter = data.fighter ?? (this.registry.get("player") as Fighter | undefined);

    this.add.image(width / 2, height / 2, "background");

    const name = fighter?.name ?? "Боец";
    this.add
      .text(width / 2, height * 0.1, `В бой: ${name}`, {
        font: `${Math.round(height * (40 / 720))}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
