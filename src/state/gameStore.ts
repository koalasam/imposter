import { create } from "zustand";
import { GameRound, GameSettings } from "@/models/types";
import { generateRound } from "@/game/engine";
import { CATEGORY_IDS } from "@/data/categories";

/**
 * Holds the single source of truth for "what is happening right now in
 * this round". Deliberately NOT persisted (see spec §26) — an in-progress
 * round does not need to survive an app restart, and persisting secret
 * information locally forever isn't necessary for a pass-the-phone game.
 */
interface GameState {
  round: GameRound | null;
  currentPlayerIndex: number;
  isCurrentPlayerRevealed: boolean;
  isRoundActive: boolean;
  isWordRevealed: boolean;
  areImpostersRevealed: boolean;

  startNewRound: (settings: GameSettings) => GameRound;
  markCurrentPlayerRevealed: () => void;
  goToNextPlayer: () => "next" | "finished";
  toggleWordRevealed: (value?: boolean) => void;
  toggleImpostersRevealed: (value?: boolean) => void;
  endRound: () => void;
}

export const useGameStore = create<GameState>()((set, get) => ({
  round: null,
  currentPlayerIndex: 0,
  isCurrentPlayerRevealed: false,
  isRoundActive: false,
  isWordRevealed: false,
  areImpostersRevealed: false,

  startNewRound: (settings) => {
    // Generated exactly once here, per spec §8/§9 — nothing in the UI
    // layer is allowed to call generateRound directly during render.
    const round = generateRound(settings, CATEGORY_IDS);
    set({
      round,
      currentPlayerIndex: 0,
      isCurrentPlayerRevealed: false,
      isRoundActive: true,
      isWordRevealed: false,
      areImpostersRevealed: false,
    });
    return round;
  },

  markCurrentPlayerRevealed: () => {
    if (!get().isCurrentPlayerRevealed) {
      set({ isCurrentPlayerRevealed: true });
    }
  },

  goToNextPlayer: () => {
    const { round, currentPlayerIndex } = get();
    if (!round) return "finished";
    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex >= round.playerOrder.length) {
      set({ isCurrentPlayerRevealed: false });
      return "finished";
    }
    set({ currentPlayerIndex: nextIndex, isCurrentPlayerRevealed: false });
    return "next";
  },

  toggleWordRevealed: (value) =>
    set((state) => ({ isWordRevealed: value ?? !state.isWordRevealed })),

  toggleImpostersRevealed: (value) =>
    set((state) => ({
      areImpostersRevealed: value ?? !state.areImpostersRevealed,
    })),

  endRound: () =>
    set({
      round: null,
      currentPlayerIndex: 0,
      isCurrentPlayerRevealed: false,
      isRoundActive: false,
      isWordRevealed: false,
      areImpostersRevealed: false,
    }),
}));
