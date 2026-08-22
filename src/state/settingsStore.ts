import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ALL_CATEGORIES_ID, GameSettings, Player } from "@/models/types";
import { CATEGORY_IDS } from "@/data/categories";
import { MIN_PLAYERS, clampImposterCount } from "@/game/engine";
import { generateId } from "@/utils/random";

/**
 * Default preferences for a brand-new install. Hints default to ON, giving
 * imposters a subtle clue out of the box; players can turn this off from
 * the main menu if they want the classic no-hint experience.
 */
const DEFAULT_SETTINGS: GameSettings = {
  players: [],
  selectedCategories: [ALL_CATEGORIES_ID],
  numberOfImposters: 1,
  hintsEnabled: true,
};

interface SettingsState extends GameSettings {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  addPlayer: (name: string) => { ok: boolean; error?: string };
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => { ok: boolean; error?: string };

  toggleCategory: (categoryId: string) => void;
  toggleAllCategories: () => void;

  setNumberOfImposters: (count: number) => void;
  setHintsEnabled: (enabled: boolean) => void;

  validationErrors: () => string[];
}

function normalizedName(name: string): string {
  return name.trim();
}

function isDuplicateName(players: Player[], name: string, excludeId?: string): boolean {
  const target = normalizedName(name).toLowerCase();
  return players.some(
    (p) => p.id !== excludeId && p.name.trim().toLowerCase() === target
  );
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addPlayer: (rawName) => {
        const name = normalizedName(rawName);
        if (name.length === 0) {
          return { ok: false, error: "Player name can't be empty." };
        }
        const { players } = get();
        if (isDuplicateName(players, name)) {
          return { ok: false, error: "That name is already taken." };
        }
        const newPlayer: Player = { id: generateId(), name };
        const nextPlayers = [...players, newPlayer];
        set({
          players: nextPlayers,
          numberOfImposters: clampImposterCount(
            get().numberOfImposters,
            nextPlayers.length
          ),
        });
        return { ok: true };
      },

      removePlayer: (id) => {
        const nextPlayers = get().players.filter((p) => p.id !== id);
        set({
          players: nextPlayers,
          // Spec 6 & 27: automatically clamp imposter count as players shrink.
          numberOfImposters: clampImposterCount(
            get().numberOfImposters,
            Math.max(nextPlayers.length, 1)
          ),
        });
      },

      renamePlayer: (id, rawName) => {
        const name = normalizedName(rawName);
        if (name.length === 0) {
          return { ok: false, error: "Player name can't be empty." };
        }
        const { players } = get();
        if (isDuplicateName(players, name, id)) {
          return { ok: false, error: "That name is already taken." };
        }
        set({
          players: players.map((p) => (p.id === id ? { ...p, name } : p)),
        });
        return { ok: true };
      },

      toggleCategory: (categoryId) => {
        const { selectedCategories } = get();
        const currentlyAll = selectedCategories.includes(ALL_CATEGORIES_ID);
        // Expand "All" into explicit individual categories before toggling,
        // so unchecking one category from "All" behaves intuitively.
        const base = currentlyAll ? [...CATEGORY_IDS] : selectedCategories;
        const isSelected = base.includes(categoryId);
        let next = isSelected
          ? base.filter((c) => c !== categoryId)
          : [...base, categoryId];

        if (next.length === 0) {
          // Never allow zero categories selected — fall back to the last
          // remaining one rather than leaving the game unstartable.
          next = [categoryId];
        }

        const allSelected = CATEGORY_IDS.every((c) => next.includes(c));
        set({ selectedCategories: allSelected ? [ALL_CATEGORIES_ID] : next });
      },

      toggleAllCategories: () => {
        // Per spec: "Selecting All selects every category." Tapping All is
        // a one-way shortcut back to "everything enabled" — narrowing the
        // selection is done via the individual category toggles, which is
        // what naturally makes All appear deselected again.
        set({ selectedCategories: [ALL_CATEGORIES_ID] });
      },

      setNumberOfImposters: (count) => {
        const playerCount = Math.max(get().players.length, 1);
        set({ numberOfImposters: clampImposterCount(count, playerCount) });
      },

      setHintsEnabled: (enabled) => set({ hintsEnabled: enabled }),

      validationErrors: () => {
        const state = get();
        const errors: string[] = [];
        if (state.players.length < MIN_PLAYERS) {
          errors.push(`You need at least ${MIN_PLAYERS} players to start.`);
        }
        if (state.selectedCategories.length === 0) {
          errors.push("Select at least one category to start.");
        }
        return errors;
      },
    }),
    {
      name: "imposter-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        players: state.players,
        selectedCategories: state.selectedCategories,
        numberOfImposters: state.numberOfImposters,
        hintsEnabled: state.hintsEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);