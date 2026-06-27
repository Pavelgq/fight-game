import { FighterProfile } from "../../model/Player/FighterProfile";
import { getFightingStyle } from "../../model/Player/FightingStyle";
import { getOpponent } from "../../model/Opponents/opponents";
import { GameSession } from "../../session/GameSession";

/** Данные для scene.start() при превью конкретного экрана. */
export function getPreviewSceneData(sceneKey: string | null): Record<string, unknown> {
  switch (sceneKey) {
    default:
      return {};
  }
}

/** Заполняет GameSession данными для превью сцены. */
export function applyPreviewSession(sceneKey: string | null): void {
  const session = GameSession.get();
  switch (sceneKey) {
    case "BattleScene": {
      const playerStyle = getFightingStyle("street");
      session.setPlayer(
        new FighterProfile(
          "Тестовый боец",
          playerStyle.abilityIds,
          { power: 7, agility: 6, stamina: 8, speed: 5, luck: 5 },
          playerStyle.id
        )
      );
      session.setOpponent(getOpponent("street_brawler"));
      break;
    }
    case "RoomScene":
    case "BattleSelectScene": {
      const style = getFightingStyle("street");
      session.setPlayer(
        new FighterProfile(
          "Тестовый боец",
          style.abilityIds,
          { power: 7, agility: 6, stamina: 8, speed: 5, luck: 5 },
          style.id
        )
      );
      break;
    }
    default:
      break;
  }
}

/** @deprecated используйте applyPreviewSession */
export function applyPreviewRegistry(
  _registry: Phaser.Data.DataManager,
  sceneKey: string | null
): void {
  applyPreviewSession(sceneKey);
}

export { createPreviewPlayer, createPreviewEnemy } from "./battle";
