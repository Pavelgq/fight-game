import { AUTO, Game, Types } from "phaser";
import { gameConfig } from "./config";
import { PreloadScene } from "./scenes/PreloadScene/PreloadScene";
import { GameScene } from "./scenes/GameScene/GameScene";
import { MainMenuScene } from "./scenes/MainMenuScene/MainMenuScene";
import { PlayerBuildScene } from "./scenes/PlayerBuildScene/PlayerBuildScene";

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: gameConfig.viewportWidth,
    height: gameConfig.viewportHeight,
    backgroundColor: gameConfig.backgroundColor,
    scene: [
      PreloadScene,
      GameScene,
      MainMenuScene,
      PlayerBuildScene,
    ]
};

new Game(config);