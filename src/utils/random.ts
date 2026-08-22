/**
 * Small collection of randomization helpers used by the game engine.
 * Kept separate and dependency-free so they're trivially unit-testable
 * and reusable outside of React.
 */

/** Returns a new array with the same elements in random order (Fisher-Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i]!;
    const b = result[j]!;
    result[i] = b;
    result[j] = a;
  }
  return result;
}

/** Picks a single random element from a non-empty array. */
export function pickOne<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("pickOne: cannot pick from an empty array");
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index]!;
}

/**
 * Picks `count` distinct random elements from `items` without replacement.
 * Throws if `count` exceeds the number of available items.
 */
export function pickMany<T>(items: readonly T[], count: number): T[] {
  if (count < 0) {
    throw new Error("pickMany: count must be non-negative");
  }
  if (count > items.length) {
    throw new Error(
      `pickMany: cannot pick ${count} items from an array of length ${items.length}`
    );
  }
  return shuffle(items).slice(0, count);
}

/** Generates a short, unique-enough id for keying rounds in UI state. */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
