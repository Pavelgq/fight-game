import { Scene } from "phaser";
import button from "../../../assets/button.png";
import background from "../../../assets/background.jpg";
import oswaldLatin from "../../../assets/fonts/oswald-latin.woff2";
import oswaldCyrillic from "../../../assets/fonts/oswald-cyrillic.woff2";
import interLatin from "../../../assets/fonts/inter-latin.woff2";
import interCyrillic from "../../../assets/fonts/inter-cyrillic.woff2";
import { applyPreviewSession, getPreviewSceneData } from "../../ui/fixtures";
import { getPreviewScene } from "../../ui/scenePreview";

const CYRILLIC_RANGE =
  "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";

/**
 * Загружает дисплейный (Oswald) и текстовый (Inter) шрифты до старта игры,
 * чтобы Phaser рендерил текст уже нужной гарнитурой, а не Arial-фолбэком.
 */
async function loadFonts(): Promise<void> {
  if (typeof FontFace === "undefined" || !document.fonts) return;

  const faces = [
    new FontFace("Oswald", `url(${oswaldLatin})`, { weight: "400 700" }),
    new FontFace("Oswald", `url(${oswaldCyrillic})`, {
      weight: "400 700",
      unicodeRange: CYRILLIC_RANGE,
    }),
    new FontFace("Inter", `url(${interLatin})`, { weight: "400 700" }),
    new FontFace("Inter", `url(${interCyrillic})`, {
      weight: "400 700",
      unicodeRange: CYRILLIC_RANGE,
    }),
  ];

  await Promise.all(
    faces.map((face) =>
      face.load().then((loaded) => document.fonts.add(loaded))
    )
  );
}

export class PreloadScene extends Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("button", button);
    this.load.image("background", background);
  }

  create() {
    const start = () => {
      const preview = getPreviewScene();
      const sceneKey = preview ?? "MainMenuScene";
      if (preview) {
        applyPreviewSession(preview);
      }
      this.scene.start(sceneKey, getPreviewSceneData(preview));
    };
    loadFonts().then(start, start);
  }
}
