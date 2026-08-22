/**
 * Core domain models for the Imposter game.
 *
 * These types intentionally have zero dependency on React or React Native
 * so that the game engine (src/game) can be unit tested in plain Node/Jest
 * without any UI runtime.
 */

/** A single entry in the word database. */
export interface Word {
  word: string;
  category: string;
  hint: string;
}

/** A player participating in the current game session. */
export interface Player {
  id: string;
  name: string;
}

/**
 * Persisted user preferences. This is the only game-related state that
 * survives an app restart. Active round state is intentionally excluded.
 */
export interface GameSettings {
  players: Player[];
  selectedCategories: string[];
  numberOfImposters: number;
  hintsEnabled: boolean;
}

/**
 * All information generated once, at the start of a round. Every field
 * here must be computed exactly once per round and never recomputed on
 * re-render or navigation.
 */
export interface GameRound {
  /** Unique id for this round, useful for cache-busting/keying UI. */
  id: string;
  word: Word;
  /** Player ids who are imposters this round. */
  imposterIds: string[];
  /** Player ids in the randomized order they will view their reveal card. */
  playerOrder: string[];
  /** Player id chosen to start the discussion. */
  startingPlayerId: string;
  /** Present only when hintsEnabled was true when the round was created. */
  hint?: string;
}

/** Category metadata, kept separate from the raw word list. */
export interface Category {
  id: string;
  label: string;
}

export const ALL_CATEGORIES_ID = "all";
