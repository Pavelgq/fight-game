/** Зарегистрированные сцены — для валидации ?scene= в dev-превью. */
export const PREVIEWABLE_SCENES = [
  "MainMenuScene",
  "PlayerBuildScene",
  "RoomScene",
  "BattleSelectScene",
  "BattleScene",
  "TrainerScene",
  "TrainerSelectScene",
  "TrainingScene",
  "CharacterInfoScene",
  "DeckScene",
] as const;

export type PreviewableScene = (typeof PREVIEWABLE_SCENES)[number];

function readSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/** ?scene=BattleScene — сразу открыть экран для настройки дизайна. */
export function getPreviewScene(): PreviewableScene | null {
  const key = readSearchParams().get("scene");
  if (!key) return null;
  if ((PREVIEWABLE_SCENES as readonly string[]).includes(key)) {
    return key as PreviewableScene;
  }
  console.warn(`[scenePreview] Unknown scene "${key}", falling back to MainMenuScene`);
  return null;
}

/** ?debug=layout — полупрозрачные прямоугольники по ключам layout. */
export function isLayoutDebug(): boolean {
  return readSearchParams().get("debug") === "layout";
}
