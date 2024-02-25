import { Scene } from "phaser";
import { Button } from "../../views/Button/Button";
import { Point } from "../../model/Point";


export class GameScene extends Scene {

  constructor() {
    super('GameScene')
  }

  create() {
    // const button = new Button(this, new Point(150, 150), "Начать игру");
    this.scene.start('MainMenuScene')
  }
}