import { AUTO, Game, Scale, Types } from "phaser";
import { gameConfig } from "./config";
import { CANVAS } from "./ui/designSystem";
import { getDisplayPixelRatio } from "./ui/displayScale";
import { PreloadScene } from "./scenes/PreloadScene/PreloadScene";
import { MainMenuScene } from "./scenes/MainMenuScene/MainMenuScene";
import { PlayerBuildScene } from "./scenes/PlayerBuildScene/PlayerBuildScene";
import { RoomScene } from "./scenes/RoomScene/RoomScene";
import { BattleSelectScene } from "./scenes/BattleSelectScene/BattleSelectScene";
import { BattleScene } from "./scenes/BattleScene/BattleScene";
import { CharacterInfoScene } from "./scenes/CharacterInfoScene/CharacterInfoScene";
import { StubScene } from "./scenes/StubScene/StubScene";

const dpr = getDisplayPixelRatio();

const config: Types.Core.GameConfig = {
  type: AUTO,
  parent: "game",
  backgroundColor: gameConfig.backgroundColor,
  width: CANVAS.width,
  height: CANVAS.height,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
    width: CANVAS.width,
    height: CANVAS.height,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  scene: [
    PreloadScene,
    MainMenuScene,
    PlayerBuildScene,
    RoomScene,
    BattleSelectScene,
    BattleScene,
    CharacterInfoScene,

    new StubScene("TrainerScene", "Тренер"),
    new StubScene("TrainerSelectScene", "Выбор тренера"),
    new StubScene("TrainingScene", "Тренировка"),
    new StubScene("DeckScene", "Колода приёмов"),
  ],
};

new Game(config);

// Для отладки в консоли
if (typeof window !== "undefined" && dpr > 1) {
  console.info(`[display] Retina buffer ${CANVAS.width}×${CANVAS.height} (dpr=${dpr})`);
}
