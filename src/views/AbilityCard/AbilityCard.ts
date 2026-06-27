import { GameObjects, Scene } from "phaser";
import { Ability, AbilityType, AttackAbility } from "../../model/Player/Ability";
import { ROW_LABELS } from "../../model/Battle/zones";
import { applyTextResolution } from "../../ui/displayScale";
import { abilityColors, FONT, FONT_DISPLAY, palette, textColors } from "../theme";

export const ABILITY_COLORS: Record<AbilityType, number> = abilityColors;

const TYPE_LABEL: Record<AbilityType, string> = {
  attack: "Атака",
  defence: "Защита",
  dodge: "Уклон",
};

const REACH_LABEL = ["свой столбец", "± сосед", "любой столбец"];

const LAYOUT = {
  outerRadius: 14,
  innerRadius: 11,
  borderWidth: 3,
  headerRatio: 0.14,
  artRatio: 0.42,
  footerRatio: 0.3,
  costRadiusRatio: 0.11,
  padX: 10,
} as const;

const HOVER_LIFT_RATIO = 0.04;
const HOVER_SCALE_BONUS = 1.08;
const SELECTED_SCALE = 1.05;

function statLines(ability: Ability): string[] {
  if (ability instanceof AttackAbility) {
    return [
      `⚔ ${ability.baseDamage}`,
      REACH_LABEL[ability.reach] ?? `${ability.reach}`,
    ];
  }
  if (ability.type === "defence") {
    const rows = ROW_LABELS.filter((_, row) =>
      ability.availableSector[row].some(Boolean)
    );
    const reduction =
      ability.block !== undefined ? Math.round((1 - ability.block) * 100) : 0;
    return [rows.join(" · ") || "—", `блок −${reduction}%`];
  }
  const guarded = ROW_LABELS.filter((_, row) => ability.guard?.(row, 1) ?? false);
  return ["уклон", guarded.join(" · ") || "—"];
}

/**
 * Карта приёма в духе коллекционных карточек: портрет 3:4, рамка, кристалл стоимости.
 */
export class AbilityCard extends GameObjects.Container {
  readonly ability: Ability;
  private readonly bg: GameObjects.Graphics;
  private readonly cardWidth: number;
  private readonly cardHeight: number;
  private restY: number;
  private readonly hit: GameObjects.Rectangle;
  private enabled = true;
  private selected = false;
  private hovered = false;
  private hoverTween?: Phaser.Tweens.Tween;

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
    this.cardWidth = width;
    this.cardHeight = height;
    this.restY = y;

    this.bg = scene.add.graphics();
    this.add(this.bg);

    const w = width;
    const h = height;
    const left = -w / 2;
    const top = -h / 2;
    const headerH = h * LAYOUT.headerRatio;
    const artH = h * LAYOUT.artRatio;
    const footerH = h * LAYOUT.footerRatio;
    const artTop = top + headerH;
    const footerTop = artTop + artH;

    const typeColor = abilityColors[ability.type];

    const art = scene.add.graphics();
    art.fillStyle(typeColor, 0.55);
    art.fillRoundedRect(left + 6, artTop, w - 12, artH, 6);
    art.fillStyle(0xffffff, 0.07);
    art.fillRect(left + 6, artTop, w - 12, artH * 0.4);
    this.add(art);

    const footer = scene.add.graphics();
    footer.fillStyle(palette.panelDeep, 0.92);
    footer.fillRoundedRect(left + 6, footerTop, w - 12, footerH - 8, 8);
    this.add(footer);

    const costR = Math.round(w * LAYOUT.costRadiusRatio);
    const costGem = scene.add.graphics();
    costGem.fillStyle(palette.accent, 1);
    costGem.fillCircle(left + costR + 8, top + costR + 8, costR);
    costGem.lineStyle(2, palette.gold, 1);
    costGem.strokeCircle(left + costR + 8, top + costR + 8, costR);
    this.add(costGem);

    const costText = scene.add
      .text(left + costR + 8, top + costR + 8, `${ability.speed}`, {
        font: `${Math.round(costR * 1.1)}px ${FONT_DISPLAY}`,
        color: "#1a1200",
      })
      .setOrigin(0.5);
    applyTextResolution(costText);

    const type = scene.add
      .text(left + w - LAYOUT.padX, top + headerH * 0.55, TYPE_LABEL[ability.type], {
        font: `${Math.round(headerH * 0.55)}px ${FONT}`,
        color: textColors.muted,
      })
      .setOrigin(1, 0.5);
    applyTextResolution(type);

    const name = scene.add
      .text(0, top + headerH * 0.55, ability.name, {
        font: `${Math.round(headerH * 0.72)}px ${FONT_DISPLAY}`,
        color: textColors.light,
        align: "center",
        wordWrap: { width: w - costR * 2 - 24 },
      })
      .setOrigin(0.5, 0.5);
    applyTextResolution(name);

    const lines = statLines(ability);
    const line1 = scene.add
      .text(0, footerTop + footerH * 0.38, lines[0], {
        font: `${Math.round(footerH * 0.32)}px ${FONT_DISPLAY}`,
        color: textColors.light,
      })
      .setOrigin(0.5);
    applyTextResolution(line1);
    const line2 = scene.add
      .text(0, footerTop + footerH * 0.72, lines[1], {
        font: `${Math.round(footerH * 0.26)}px ${FONT}`,
        color: textColors.muted,
      })
      .setOrigin(0.5);
    applyTextResolution(line2);

    this.hit = scene.add
      .rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    this.add([costText, type, name, line1, line2, this.hit]);

    this.hit.on("pointerup", () => {
      if (this.enabled) this.emit("selected", this);
    });
    this.hit.on("pointerover", () => this.setHovered(true));
    this.hit.on("pointerout", () => this.setHovered(false));

    this.redraw();
    scene.add.existing(this);
  }

  private targetScale(): number {
    let scale = 1;
    if (this.selected) scale = SELECTED_SCALE;
    if (this.hovered && this.enabled) scale *= HOVER_SCALE_BONUS;
    return scale;
  }

  private targetY(): number {
    const lift = this.cardHeight * HOVER_LIFT_RATIO;
    if (this.selected) return this.restY - lift * 0.5;
    if (this.hovered && this.enabled) return this.restY - lift;
    return this.restY;
  }

  private animatePose() {
    this.hoverTween?.stop();
    this.hoverTween = this.scene.tweens.add({
      targets: this,
      scale: this.targetScale(),
      y: this.targetY(),
      duration: 160,
      ease: "Cubic.easeOut",
      onComplete: () => {
        if (this.hovered && this.enabled) {
          this.scene.children.bringToTop(this);
        }
      },
    });
  }

  private setHovered(hover: boolean) {
    if (!this.enabled || this.hovered === hover) return;
    this.hovered = hover;
    this.animatePose();
  }

  private redraw() {
    const w = this.cardWidth;
    const h = this.cardHeight;
    this.bg.clear();

    this.bg.fillStyle(palette.ink, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, LAYOUT.outerRadius);

    this.bg.fillStyle(abilityColors[this.ability.type], 1);
    this.bg.fillRoundedRect(
      -w / 2 + LAYOUT.borderWidth,
      -h / 2 + LAYOUT.borderWidth,
      w - LAYOUT.borderWidth * 2,
      h - LAYOUT.borderWidth * 2,
      LAYOUT.innerRadius
    );

    const borderColor = this.selected ? palette.gold : palette.ink;
    const borderW = this.selected ? 4 : 2;
    this.bg.lineStyle(borderW, borderColor, 1);
    this.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, LAYOUT.outerRadius);
  }

  setSelected(selected: boolean) {
    if (this.selected === selected) return;
    this.selected = selected;
    this.redraw();
    this.animatePose();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.42);
    if (!enabled && this.hovered) {
      this.hovered = false;
      this.animatePose();
    }
  }
}
