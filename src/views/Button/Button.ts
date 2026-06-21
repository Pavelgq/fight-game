import { GameObjects, Scene } from "phaser";
import { Point } from "../../model/Point";

const CONSTANTS =  {
  BASE_SCALE: 1,
  HOVER_SCALE: 0.9,
  BASE_FONT_SIZE: 28
}

export class Button extends GameObjects.Sprite {

  textContent?: GameObjects.Text;

  constructor(scene: Scene, point: Point, text: string) {
    super(scene, point.x, point.y, 'button');
    
    this.scene.add.existing(this);
    this.addTest(text);
    this.setScale(CONSTANTS.BASE_SCALE)
    this.setInteractive()
    this.on('pointerdown', this.pointerDown, this)
    this.on('pointerup', this.pointerUp, this)
  }

  private addTest(text: string) {
    const width = this.width * CONSTANTS.BASE_SCALE;
    const height = this.height * CONSTANTS.BASE_SCALE;
    this.textContent = this.scene.add.text(this.x, this.y, text, {
                font: `${CONSTANTS.BASE_FONT_SIZE}px Arial`,
                color: '#ffffff'
            });
            
    this.textContent.setOrigin(0.5,0.5);
  }

  pointerDown() {
    this.animatedScale(this, CONSTANTS.HOVER_SCALE);
    this.textContent && this.animatedFontSize(this.textContent, CONSTANTS.BASE_FONT_SIZE, CONSTANTS.BASE_FONT_SIZE - 3);
  }

  pointerUp() {
    this.animatedScale(this, CONSTANTS.BASE_SCALE);
    this.textContent && this.animatedFontSize(this.textContent, CONSTANTS.BASE_FONT_SIZE - 3, CONSTANTS.BASE_FONT_SIZE);
  }

  animatedScale(target: unknown, param: number) {
    return new Promise((animationResolve) => {
      this.scene.tweens.add({
        targets: target,
        ease: 'Linear',
        duration: 100,
        scale: param,
        onComplete: animationResolve,
      })
    })
  }

  animatedFontSize(target: unknown, currentFontSize: number, targetFontSize: number) {
    return new Promise((animationResolve) => {
      this.scene.tweens.addCounter({
        duration: 100,
        ease: 'Linear',
        from: currentFontSize,
        to: targetFontSize,
        onUpdate: (tween) => {
            this.textContent?.setFontSize(tween.getValue());
        },
        onComplete: () => animationResolve(undefined),
      })
    })
  }
}