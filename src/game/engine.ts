import { GameRound, GameSettings, Player, Word } from "@/models/types";
import { generateId, pickMany, pickOne } from "@/utils/random";
import wordsData from "@/data/words.json";
import { ALL_CATEGORIES_ID } from "@/models/types";

/**
 * The game engine has zero dependency on React or React Native. This makes
 * every rule below directly unit-testable in plain Node/Jest, and keeps UI
 * components free of game logic (they only ever read state produced here).
 */

export const MIN_PLAYERS = 3;

const ALL_WORDS: Word[] = wordsData as Word[];

export function getAllWords(): Word[] {
  return ALL_WORDS;
}

/**
 * Resolves the effective set of category ids to filter words by.
 * If `selectedCategories` contains the "all" sentinel (or is empty, which
 * should not normally happen but is handled defensively), every category
 * is eligible.
 */
export function resolveEligibleCategories(
  selectedCategories: string[],
  allCategoryIds: string[]
): string[] {
  if (
    selectedCategories.length === 0 ||
    selectedCategories.includes(ALL_CATEGORIES_ID)
  ) {
    return allCategoryIds;
  }
  return selectedCategories;
}

/** Filters the word database down to words in the given categories. */
export function getWordsForCategories(
  categories: string[],
  words: Word[] = ALL_WORDS
): Word[] {
  const categorySet = new Set(categories);
  return words.filter((w) => categorySet.has(w.category));
}

/** Thrown when a round cannot be validly generated from the given settings. */
export class GameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameValidationError";
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates game settings before a round can start. Returns all applicable
 * errors at once (rather than throwing on the first one) so the UI can
 * surface everything wrong in a single pass.
 */
export function validateSettings(
  settings: GameSettings,
  allCategoryIds: string[]
): ValidationResult {
  const errors: string[] = [];

  if (settings.players.length < MIN_PLAYERS) {
    errors.push(`You need at least ${MIN_PLAYERS} players to start.`);
  }

  const eligibleCategories = resolveEligibleCategories(
    settings.selectedCategories,
    allCategoryIds
  );
  if (eligibleCategories.length === 0) {
    errors.push("Select at least one category to start.");
  } else {
    const eligibleWords = getWordsForCategories(eligibleCategories);
    if (eligibleWords.length === 0) {
      errors.push("The selected categories have no available words.");
    }
  }

  const maxImposters = Math.max(1, settings.players.length - 1);
  if (settings.numberOfImposters < 1) {
    errors.push("There must be at least 1 imposter.");
  } else if (settings.numberOfImposters > maxImposters) {
    errors.push(`With ${settings.players.length} players, there can be at most ${maxImposters} imposter(s).`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Clamps a requested imposter count into the valid range for a given
 * player count: at minimum 1, at most players.length - 1, and never equal
 * to or greater than the full player count.
 */
export function clampImposterCount(
  requested: number,
  playerCount: number
): number {
  const max = Math.max(1, playerCount - 1);
  if (playerCount < 2) {
    // Degenerate case (shouldn't happen once MIN_PLAYERS is enforced),
    // but guarded so this function never divides players into an invalid
    // state.
    return 1;
  }
  return Math.min(Math.max(1, requested), max);
}

/**
 * Generates a brand new round from the given settings. All randomized
 * elements (word, imposters, player order, starting player) are computed
 * exactly once here and returned as an immutable result — callers must
 * store this in state rather than re-deriving it on render.
 */
export function generateRound(
  settings: GameSettings,
  allCategoryIds: string[]
): GameRound {
  const validation = validateSettings(settings, allCategoryIds);
  if (!validation.valid) {
    throw new GameValidationError(validation.errors.join(" "));
  }

  const eligibleCategories = resolveEligibleCategories(
    settings.selectedCategories,
    allCategoryIds
  );
  const eligibleWords = getWordsForCategories(eligibleCategories);
  const word = pickOne(eligibleWords);

  const imposterCount = clampImposterCount(
    settings.numberOfImposters,
    settings.players.length
  );
  const imposters = pickMany(settings.players, imposterCount);
  const imposterIds = imposters.map((p) => p.id);

  // Players always go through in the same order they appear in the main
  // menu's player list, so the reveal order is predictable round to round.
  const playerOrder = settings.players.map((p) => p.id);
  const startingPlayerId = pickOne(settings.players).id;

  return {
    id: generateId(),
    word,
    imposterIds,
    playerOrder,
    startingPlayerId,
    hint: settings.hintsEnabled ? word.hint : undefined,
  };
}

/** True if the given player id is an imposter in this round. */
export function isImposter(round: GameRound, playerId: string): boolean {
  return round.imposterIds.includes(playerId);
}

/** Returns the list of imposter Player objects for display purposes. */
export function getImposterPlayers(
  round: GameRound,
  players: Player[]
): Player[] {
  const playerById = new Map(players.map((p) => [p.id, p] as const));
  return round.imposterIds
    .map((id) => playerById.get(id))
    .filter((p): p is Player => p !== undefined);
}

/** Looks up a Player by id, given the full roster. */
export function findPlayer(
  players: Player[],
  playerId: string
): Player | undefined {
  return players.find((p) => p.id === playerId);
}