import { Fighter } from "../Player/Fighter";
import {
  FightingStyleId,
  getFightingStyle,
  getStyleAbilities,
} from "../Player/FightingStyle";

export type OpponentId = string;

export type Opponent = {
  id: OpponentId;
  name: string; // имя бойца
  title: string; // подпись боя в списке
  styleId: FightingStyleId;
  description: string;
};

export const OPPONENTS: Opponent[] = [
  {
    id: "street_brawler",
    name: "Гопник Толик",
    title: "Бой с уличным бойцом",
    styleId: "street",
    description: "Дерётся грязно, постоянно смещается",
  },
  {
    id: "karate_master",
    name: "Сэнсэй Кэндзи",
    title: "Бой с каратистом",
    styleId: "karate",
    description: "Бьёт ногами и ловко уклоняется",
  },
  {
    id: "street_boxer",
    name: "Боксёр Витя",
    title: "Бой с уличным боксёром",
    styleId: "boxer",
    description: "Серии ударов руками и крепкие блоки",
  },
];

export function getOpponent(id: OpponentId): Opponent {
  const opponent = OPPONENTS.find((item) => item.id === id);
  if (!opponent) {
    throw new Error(`Неизвестный противник: ${id}`);
  }
  return opponent;
}

/** Собирает ИИ-бойца из стиля противника. */
export function createOpponentFighter(opponent: Opponent): Fighter {
  const style = getFightingStyle(opponent.styleId);
  return new Fighter(opponent.name, getStyleAbilities(style));
}
