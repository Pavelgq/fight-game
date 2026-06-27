import { cx, cy, menuButton, type, y } from "../ui/designSystem";

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

const TITLE_Y = 70;
const SUBTITLE_Y = 120;
const BUTTONS_START_Y = 220;
const BUTTONS_GAP = 16;

export function getRoomLayout() {
  return {
    background: { x: cx, y: cy },
    title: {
      x: cx,
      y: y(TITLE_Y),
      fontSize: type("h1"),
    },
    subtitle: {
      x: cx,
      y: y(SUBTITLE_Y),
      fontSize: type("body"),
    },
    buttons: {
      x: cx,
      startY: y(BUTTONS_START_Y),
      gap: y(BUTTONS_GAP),
      designWidth: menuButton.designWidth,
      fontSize: menuButton.fontSize,
    },
  };
}

export type RoomLayout = ReturnType<typeof getRoomLayout>;
