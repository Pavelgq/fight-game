import { AUTO, Game, Types } from "phaser";
import { gameConfig } from "./config";
import { PreloadScene } from "./scenes/PreloadScene/PreloadScene";
import { MainMenuScene } from "./scenes/MainMenuScene/MainMenuScene";
import { PlayerBuildScene } from "./scenes/PlayerBuildScene/PlayerBuildScene";
import { RoomScene } from "./scenes/RoomScene/RoomScene";
import { BattleSelectScene } from "./scenes/BattleSelectScene/BattleSelectScene";
import { BattleScene } from "./scenes/BattleScene/BattleScene";
import { StubScene } from "./scenes/StubScene/StubScene";

const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: "game",
    width: gameConfig.viewportWidth,
    height: gameConfig.viewportHeight,
    backgroundColor: gameConfig.backgroundColor,
    scene: [
      PreloadScene,
      MainMenuScene,
      PlayerBuildScene,
      RoomScene,
      BattleSelectScene,
      BattleScene,
      // Моковые экраны — пока заглушки, наполним позже
      new StubScene("TrainerScene", "Тренер"),
      new StubScene("TrainerSelectScene", "Выбор тренера"),
      new StubScene("TrainingScene", "Тренировка"),
      new StubScene("CharacterInfoScene", "Информация о персонаже"),
      new StubScene("DeckScene", "Колода приёмов"),
    ]
};

new Game(config);
