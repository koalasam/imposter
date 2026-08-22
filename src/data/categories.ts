import { Category } from "@/models/types";

/**
 * The list of real, selectable word categories. The "All" pseudo-category
 * is handled separately in the UI/state layer and is NOT part of this list,
 * because it doesn't correspond to a category in the word database — it's
 * a shorthand meaning "every category below is selected".
 *
 * To add a new category:
 *   1. Add an entry here with a unique id and display label.
 *   2. Add words tagged with that same `category` id in src/data/words.json.
 * Nothing else needs to change — selection, filtering, and the "All"
 * toggle logic all derive from this list automatically.
 */
export const CATEGORIES: Category[] = [
  { id: "animals", label: "Animals" },
  { id: "brands", label: "Brands" },
  { id: "celebrities", label: "Celebrities" },
  { id: "food", label: "Food" },
  { id: "movies", label: "Movies" },
  { id: "nature", label: "Nature" },
  { id: "objects", label: "Objects" },
  { id: "places", label: "Places" },
  { id: "professions", label: "Professions" },
  { id: "sports", label: "Sports" },
];

export const CATEGORY_IDS: string[] = CATEGORIES.map((c) => c.id);