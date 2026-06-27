import { GameObjects, Scene } from "phaser";
import { palette } from "../theme";

export type BattleArenaBounds = {
  width: number;
  height: number;
};

const SPOTLIGHT_HEIGHT_RATIO = 0.55;
const VIGNETTE_BAND_RATIO = 0.18;

/** Векторная арена: градиент + прожектор + виньетка. */
export function createBattleArena(
  scene: Scene,
  bounds: BattleArenaBounds
): GameObjects.Graphics {
  const { width, height } = bounds;
  const g = scene.add.graphics();

  g.fillGradientStyle(
    palette.arenaTop,
    palette.arenaTop,
    palette.arenaBot,
    palette.arenaBot,
    1
  );
  g.fillRect(0, 0, width, height);

  g.fillGradientStyle(
    palette.surfaceHi,
    palette.surfaceHi,
    palette.arenaBot,
    palette.arenaBot,
    0.35,
    0.35,
    0,
    0
  );
  g.fillRect(0, 0, width, height * SPOTLIGHT_HEIGHT_RATIO);

  const vig = 0x05070d;
  const band = height * VIGNETTE_BAND_RATIO;
  g.fillGradientStyle(vig, vig, vig, vig, 0.55, 0.55, 0, 0);
  g.fillRect(0, 0, width, band);
  g.fillGradientStyle(vig, vig, vig, vig, 0, 0, 0.6, 0.6);
  g.fillRect(0, height - band, width, band);

  return g;
}
