import { Logger } from "../Logger";
import { AvailableHealthUnits } from "../types";

export class Health {
  currentValue: number;
  maxValue: number;

  constructor(maxValue: number) {
    this.currentValue = maxValue;
    this.maxValue = maxValue;
  }

  makeDamage(damage: number, unit: AvailableHealthUnits) {
    Logger.warn("И наносит урон в размере", damage, unit);
    switch (unit) {
      case "percent":
        this.currentValue = Math.floor(
          this.currentValue - (this.currentValue * damage) / 100
        );
        break;
      case "point":
        this.currentValue -= damage;
        break;
    }
    return this.isDeath();
  }

  isDeath() {
    return this.currentValue <= 0;
  }
}
