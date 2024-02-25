import { Scene } from "phaser";
import button from '../../../assets/button.png';
import background from '../../../assets/background.jpg';

export class PreloadScene extends Scene {

  constructor() {
    super('PreloadScene')
  }

  preload() {
    this.load.image('button', button);
    this.load.image('background', background);
  }

  create() {
    this.scene.start('GameScene');
  }
}