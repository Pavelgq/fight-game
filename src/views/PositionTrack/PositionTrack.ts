import { GameObjects, Scene } from "phaser";

const PLAYER_COLOR = 0x2980b9;
const ENEMY_COLOR = 0xc0392b;

/** Дорожка позиций: показывает, кто где стоит и какая между бойцами дистанция. */
export class PositionTrack extends GameObjects.Container {
  private readonly trackWidth: number;
  private readonly maxDistance: number;
  private readonly playerToken: GameObjects.Arc;
  private readonly enemyToken: GameObjects.Arc;
  private readonly distanceText: GameObjects.Text;
  private readonly radius: number;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    maxDistance: number
  ) {
    super(scene, x, y);
    this.trackWidth = width;
    this.maxDistance = maxDistance;
    this.radius = height * 0.32;

    const baseline = scene.add
      .rectangle(0, 0, width, height * 0.12, 0x666666)
      .setOrigin(0.5);
    this.add(baseline);

    for (let i = 0; i <= maxDistance; i++) {
      const tick = scene.add
        .rectangle(this.slotX(i), 0, 3, height * 0.4, 0x888888)
        .setOrigin(0.5);
      this.add(tick);
    }

    this.playerToken = scene.add.circle(this.slotX(0), 0, this.radius, PLAYER_COLOR);
    this.enemyToken = scene.add.circle(this.slotX(maxDistance), 0, this.radius, ENEMY_COLOR);
    this.add([this.playerToken, this.enemyToken]);

    this.distanceText = scene.add
      .text(0, height * 0.75, "", {
        font: `${Math.round(height * 0.32)}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.add(this.distanceText);

    scene.add.existing(this);
  }

  private slotX(slot: number): number {
    const clamped = Math.max(0, Math.min(this.maxDistance, slot));
    return -this.trackWidth / 2 + (clamped / this.maxDistance) * this.trackWidth;
  }

  setPositions(playerPos: number, enemyPos: number, distance: number) {
    this.playerToken.x = this.slotX(playerPos);
    this.enemyToken.x = this.slotX(enemyPos);
    this.distanceText.setText(`Дистанция: ${distance}`);
  }
}
