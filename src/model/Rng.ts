/** Детерминированный генератор случайных чисел для колоды, ИИ и матчей. */
export interface Rng {
  /** Целое в диапазоне [min, max] включительно. */
  nextInt(min: number, max: number): number;
}

/** Недетерминированный RNG (локальный офлайн). */
export class MathRng implements Rng {
  nextInt(min: number, max: number): number {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  }
}

/** Детерминированный RNG по seed (mulberry32). */
export class SeededRng implements Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  nextInt(min: number, max: number): number {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const range = hi - lo + 1;
    return lo + (this.nextUint32() % range);
  }

  private nextUint32(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }
}

export const defaultRng = new MathRng();
