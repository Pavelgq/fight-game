import { Rng, defaultRng } from "../model/Rng";

/** @deprecated Используйте Rng из model/Rng.ts */
export const getRandom = (minValue: number, maxValue: number, rng: Rng = defaultRng) => {
  return rng.nextInt(minValue, maxValue);
};
