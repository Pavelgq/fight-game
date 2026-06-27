import { GameObjects, Scene } from "phaser";
import { AbilityType } from "../model/Player/Ability";

/**
 * Единый дизайн-язык экрана боя. Палитра, типографика и хелперы для подложек.
 * Цвета типов приёмов (abilityColors) — единый источник правды для карт,
 * таймлайна и подписей зон.
 */

export const palette = {
  /** Чернильный контур всех поверхностей — «нарисованность» cel-shading. */
  ink: 0x0e1116,
  /** Градиент арены: глубокий индиго сверху → фиолет снизу. */
  arenaTop: 0x1b2347,
  arenaBot: 0x2a1840,
  /** Сплошные панели (рисуются без прозрачности). */
  surface: 0x171f33,
  surfaceHi: 0x223052,

  /** Тёмная подложка панелей поверх ринга (legacy). */
  panel: 0x101a2e,
  panelDeep: 0x0a1120,
  panelStroke: 0x46597d,
  /** Акцент — золотистый: выбор, подсказки, активные элементы. */
  accent: 0xffc53d,
  gold: 0xffc53d,
  /** Маркеры бойцов: синий игрок / красный враг. */
  player: 0x3fa9ff,
  enemy: 0xff4d5e,
  rail: 0x2c3a55,
  railTick: 0x55678c,
  good: 0x2fd27a,
  danger: 0xe05541,
  /** «Призрак» урона на HP-баре — белый трейлинг-слой. */
  hpGhost: 0xffffff,
} as const;

export const textColors = {
  light: "#f2f6ff",
  muted: "#9fb0c8",
  accent: "#ffc53d",
  player: "#8cc6ff",
  enemy: "#ff8f8f",
} as const;

/** Цвета по типу приёма — переиспользуются во всех компонентах боя. */
export const abilityColors: Record<AbilityType, number> = {
  attack: 0xff5436,
  defence: 0x3d8bff,
  dodge: 0x2fd27a,
};

/** Дисплейный шрифт — узкий, ударный: имена, числа, заголовки. */
export const FONT_DISPLAY = "Oswald";
/** Текстовый шрифт — чистый гротеск: статы, подписи, лог. */
export const FONT_BODY = "Inter";
/** Базовый шрифт компонентов = текстовый (был Arial). */
export const FONT = FONT_BODY;

type PanelOptions = {
  radius?: number;
  fill?: number;
  alpha?: number;
  stroke?: number;
  strokeAlpha?: number;
  lineWidth?: number;
  /** Якорь панели относительно (x, y). 0.5 — центр (по умолчанию). */
  originX?: number;
  originY?: number;
};

/**
 * Рисует скруглённую панель-подложку и возвращает Graphics.
 * Координаты — локальные, если объект кладётся в контейнер.
 */
export function drawPanel(
  scene: Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: PanelOptions = {}
): GameObjects.Graphics {
  const {
    radius = 10,
    fill = palette.panel,
    alpha = 0.8,
    stroke = palette.panelStroke,
    strokeAlpha = 1,
    lineWidth = 2,
    originX = 0.5,
    originY = 0.5,
  } = options;

  const left = x - width * originX;
  const top = y - height * originY;

  const g = scene.add.graphics();
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(left, top, width, height, radius);
  if (lineWidth > 0) {
    g.lineStyle(lineWidth, stroke, strokeAlpha);
    g.strokeRoundedRect(left, top, width, height, radius);
  }
  return g;
}
