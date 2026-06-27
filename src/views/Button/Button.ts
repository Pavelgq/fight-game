import { GameObjects, Scene } from "phaser";
import { Point } from "../../model/Point";
import { applyTextResolution } from "../../ui/displayScale";
import { u } from "../../ui/designSystem";
import { FONT_DISPLAY } from "../theme";

export type ButtonOptions = {
  /** Ширина кнопки в design-пикселях (1280×720). */
  designWidth?: number;
  /** Размер шрифта в design-пикселях. */
  fontSize?: number;
};

const DEFAULT_DESIGN_WIDTH = 300;
const DEFAULT_FONT_SIZE = 28;

export class Button extends GameObjects.Sprite {
  textContent?: GameObjects.Text;
  private isEnabled = true;
  private readonly baseScale: number;
  private readonly baseFontSize: number;
  private readonly pressScale: number;

  constructor(scene: Scene, point: Point, text: string, options: ButtonOptions = {}) {
    super(scene, point.x, point.y, "button");

    const designWidth = options.designWidth ?? DEFAULT_DESIGN_WIDTH;
    this.baseFontSize = u(options.fontSize ?? DEFAULT_FONT_SIZE);
    this.baseScale = u(designWidth) / this.width;
    this.pressScale = this.baseScale * 0.94;

    this.scene.add.existing(this);
    this.addLabel(text, designWidth);
    this.setScale(this.baseScale);
    this.setInteractive();
    this.on("pointerdown", this.pointerDown, this);
    this.on("pointerup", this.pointerUp, this);
  }

  /** Высота кнопки с учётом масштаба (для расчёта gap в меню). */
  get layoutHeight(): number {
    return this.displayHeight;
  }

  private addLabel(text: string, designWidth: number) {
    this.textContent = this.scene.add.text(this.x, this.y, text, {
      font: `${this.baseFontSize}px ${FONT_DISPLAY}`,
      color: "#ffffff",
      align: "center",
      wordWrap: { width: u(designWidth) - u(24) },
    });
    this.textContent.setOrigin(0.5, 0.5);
    applyTextResolution(this.textContent);
  }

  setEnabled(enabled: boolean) {
    if (this.isEnabled === enabled) return;
    this.isEnabled = enabled;
    this.setAlpha(enabled ? 1 : 0.4);
    this.textContent?.setAlpha(enabled ? 1 : 0.5);
    if (enabled) {
      this.setInteractive();
    } else {
      this.disableInteractive();
    }
  }

  pointerDown() {
    this.tweenScale(this.pressScale);
    if (this.textContent) {
      this.tweenFontSize(this.baseFontSize, Math.round(this.baseFontSize * 0.92));
    }
  }

  pointerUp() {
    this.tweenScale(this.baseScale);
    if (this.textContent) {
      this.tweenFontSize(Math.round(this.baseFontSize * 0.92), this.baseFontSize);
    }
  }

  private tweenScale(targetScale: number) {
    this.scene.tweens.add({
      targets: this,
      scale: targetScale,
      duration: 90,
      ease: "Quad.easeOut",
    });
  }

  private tweenFontSize(from: number, to: number) {
    this.scene.tweens.addCounter({
      from,
      to,
      duration: 90,
      ease: "Quad.easeOut",
      onUpdate: (tween) => {
        this.textContent?.setFontSize(tween.getValue());
      },
    });
  }
}
