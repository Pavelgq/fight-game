import { GameObjects, Scene } from "phaser";
import { Point } from "../../model/Point";

const CardShiftByType = {
  attack: 'cardShiftAttack',
  defense: 'cardShiftDefense'
}

type CardProps = { 
  id: number, 
  point: Point, 
  type: 'attack' | 'defense',
  name: GameObjects.Text,
  descriprion: GameObjects.Text,
}

export class Card extends GameObjects.Sprite {
  readonly id: number

  readonly backTexture: string;
  readonly frontTexture: string;

  private _isOpen = false

  constructor(scene: Scene, props: CardProps) {
    const { point, id, type, name, descriprion } = props 
    super(scene, point.x, point.y, CardShiftByType[type])

    this.backTexture = CardShiftByType[type];
    this.frontTexture = CardShiftByType[type];

    this.id = id

    this.scene.add.existing(this)

    this.setInteractive()
  }

  get isOpen() {
    return this._isOpen
  }

  move(x: number, y: number) {
    return new Promise((animationResolve) => {
      this.scene.tweens.add({
        targets: this,
        ease: 'Linear',
        x,
        y,
        duration: 200,
        onComplete: animationResolve
      })
    })
  }

  flip() {
    return new Promise((animationReslover) => {
      const show = () => {
        const texture = this._isOpen
          ? 'card' + this.id
          : 'card' 
  
        this.setTexture(texture)
  
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          ease: 'Linear',
          duration: 150,
          onComplete: animationReslover
        })
      }
  
      this.scene.tweens.add({
        targets: this,
        scaleX: 0,
        ease: 'Linear',
        duration: 150,
        onComplete: show
      })
    })
  }

  async open() {
    this._isOpen = true
    await this.flip()
  }

  async close() {
    this._isOpen = false
    await this.flip()
  }
}
}