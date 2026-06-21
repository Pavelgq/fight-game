import { Scale } from "phaser";

export type RoomMenuItem = {
  label: string;
  target: string;
};

export const ROOM_MENU: RoomMenuItem[] = [
  { label: "Бои", target: "BattleSelectScene" },
  { label: "Тренер", target: "TrainerScene" },
  { label: "Тренировка", target: "TrainingScene" },
  { label: "Персонаж", target: "CharacterInfoScene" },
  { label: "Колода приёмов", target: "DeckScene" },
];

export function getRoomLayout(scale: Scale.ScaleManager) {
  const { width, height } = scale;
  const cx = width / 2;

  return {
    background: { x: cx, y: height / 2 },
    title: {
      x: cx,
      y: height * (70 / 720),
      fontSize: Math.round(height * (40 / 720)),
    },
    subtitle: {
      x: cx,
      y: height * (120 / 720),
      fontSize: Math.round(height * (22 / 720)),
    },
    buttons: {
      x: cx,
      startY: height * (220 / 720),
      gap: height * (16 / 720),
    },
  };
}
