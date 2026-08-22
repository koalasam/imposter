# Imposter

A local, pass-the-phone party game built with **React Native + Expo + TypeScript**. Fully offline — no backend, accounts, or internet connection required.

One secret word is shown to every player except the imposter(s), who instead see "YOU ARE THE IMPOSTER" (with an optional hint). Everyone privately views their card by holding down a reveal button, a random starting player is chosen, and the group discusses to try to catch the imposter.

---

## A. Project structure

```text
imposter/
├── app/                        # Expo Router screens (file-based routing)
│   ├── _layout.tsx             # Root stack, providers, splash-screen handoff
│   ├── index.tsx                # Main menu (players, categories, imposters, hints)
│   └── game/
│       ├── reveal.tsx           # Per-player hold-to-reveal screen
│       └── start.tsx            # "Start of Play" screen (reveal word/imposters, play again)
│
├── src/
│   ├── components/              # Presentational UI, no game logic
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── SectionLabel.tsx
│   │   ├── PlayerManager.tsx
│   │   ├── CategorySelector.tsx
│   │   ├── ImposterStepper.tsx
│   │   ├── HintToggle.tsx
│   │   ├── HoldToReveal.tsx      # Press-and-hold secure reveal interaction
│   │   ├── SecretContent.tsx     # What's shown inside the reveal card
│   │   └── GameHeader.tsx        # Back button + "Leave Round?" confirmation
│   │
│   ├── data/
│   │   ├── categories.ts         # Category list (add new categories here)
│   │   └── words.json            # Word database (word / category / hint)
│   │
│   ├── game/
│   │   └── engine.ts             # Pure game logic — zero React dependency
│   │
│   ├── models/
│   │   └── types.ts              # Word, Player, GameSettings, GameRound, Category
│   │
│   ├── state/
│   │   ├── settingsStore.ts      # Persisted preferences (zustand + AsyncStorage)
│   │   └── gameStore.ts          # Ephemeral round state (not persisted)
│   │
│   ├── theme/
│   │   └── theme.ts              # Colors, typography, spacing, radii, shadows
│   │
│   └── utils/
│       └── random.ts             # shuffle / pickOne / pickMany / generateId
│
├── __tests__/
│   ├── engine.test.ts            # Game logic unit tests
│   ├── settingsStore.test.ts     # Player/category/imposter state tests
│   └── HoldToReveal.test.tsx     # Component test for the reveal interaction
│
├── assets/                       # icon.png, adaptive-icon.png, splash.png, favicon.png
├── app.json                      # Expo app configuration
├── eas.json                      # EAS Build profiles (development/preview/production)
├── babel.config.js
├── tsconfig.json
└── package.json
```

**Architecture notes:**
- `src/game/engine.ts` has no import from `react` or `react-native` anywhere in its dependency chain, so it can be (and is) unit tested in plain Node/Jest.
- All randomized round data (word, imposters, player order, starting player) is generated **exactly once** per round, inside `gameStore.startNewRound()`. Screens only ever read from the store — nothing re-rolls on re-render or navigation.
- Active round state is intentionally **not** persisted; only user preferences (players, categories, imposter count, hint setting) survive an app restart.

---

## B. Setup instructions

### Prerequisites
- Node.js 18+
- npm (or yarn/pnpm if you prefer — the lockfile here is npm's)
- The [Expo Go](https://expo.dev/go) app on your phone, **or** Xcode (iOS Simulator) / Android Studio (Android Emulator) for local simulators/emulators
- For device builds: an [Expo (EAS)](https://expo.dev) account (free) and the EAS CLI

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm start
```

This starts the Metro bundler and shows a QR code. Scan it with the Expo Go app on your phone (same Wi-Fi network), or press `i` / `a` in the terminal to launch the iOS Simulator / Android Emulator.

### Run on Android specifically

```bash
npm run android
```

Requires Android Studio with an emulator configured, or a physical device with USB debugging enabled.

### Run on iOS specifically

```bash
npm run ios
```

Requires a Mac with Xcode installed.

---

## C. Testing instructions

```bash
npm test          # run the full test suite once
npm run test:watch  # re-run on file changes
npm run typecheck   # strict TypeScript check, no emit
```

The suite covers:
- **Game engine** (`engine.test.ts`) — category filtering, imposter-count clamping, round validation, full round generation (word/imposters/order/starting player), the "never make every player an imposter" rule, hint behavior, and the specific edge cases called out in the spec (3p/1i, 4p/1i, 4p/2i, 10p/3i, 10p/9i).
- **Settings store** (`settingsStore.test.ts`) — adding/removing/renaming players, duplicate/empty-name rejection, automatic imposter-count clamping when players are removed, and the "All categories" toggle logic.
- **Hold-to-Reveal component** (`HoldToReveal.test.tsx`) — confirms the secret is never rendered before a press, appears while held, disappears immediately on release, and resets when the active player changes.

---

## D. Build instructions (Android & iOS release builds)

Builds are produced with **EAS Build**, Expo's modern cloud (or local) build service.

### One-time setup

```bash
npm install -g eas-cli
eas login
eas build:configure
```

This links the project to your Expo account and confirms the bundle identifiers in `app.json` (`com.imposter.partygame` by default — see Customization below to change this).

### Android production build (App Bundle, for Google Play)

```bash
eas build --platform android --profile production
```

Produces an `.aab` file suitable for upload to the Google Play Console. A quick-install `.apk` for manual testing on a device is available via:

```bash
eas build --platform android --profile preview
```

### iOS production build (for App Store)

```bash
eas build --platform ios --profile production
```

You'll need an active Apple Developer Program membership; EAS will walk you through certificate/provisioning-profile generation (or let you supply your own).

### Submitting to the stores

```bash
eas submit --platform android
eas submit --platform ios
```

`eas submit` uploads the most recent build to the Google Play Console / App Store Connect. You'll need your Play Console service-account key and/or App Store Connect API key configured first — see the [EAS Submit docs](https://docs.expo.dev/submit/introduction/).

---

## E. Where to add or edit words

Open `src/data/words.json`. Each entry looks like:

```json
{ "word": "Penguin", "category": "animals", "hint": "A bird associated with cold places" }
```

- `category` must match one of the `id` values in `src/data/categories.ts` (e.g. `animals`, `food`, `places`, ...).
- Keep hints related but non-obvious — avoid using the word itself or an exact synonym.
- No code changes are needed; new entries are picked up automatically.

### Adding a brand-new category

1. Add an entry to the `CATEGORIES` array in `src/data/categories.ts`:
   ```ts
   { id: "board-games", label: "Board Games" }
   ```
2. Add words in `words.json` tagged with `"category": "board-games"`.

That's it — the category selector, the "All" logic, and word filtering all derive from this list automatically.

---

## F. Customization

### Colors, typography, spacing

Everything lives in `src/theme/theme.ts`. Change `colors.accent`, `colors.background`, etc. and the whole app updates — no styles are hard-coded outside this file and the component stylesheets that reference it.

### App name

Edit the `expo.name` field in `app.json`. This is the name shown under the icon on the home screen.

### Bundle / package identifiers

Edit `expo.ios.bundleIdentifier` and `expo.android.package` in `app.json`. These must be globally unique per app store and, once published, generally shouldn't change.

### App icon & splash screen

Replace the files in `assets/` (`icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png`) with your own artwork, keeping the same filenames and roughly the same aspect ratios (icon: square, ideally 1024×1024; splash: portrait). No config changes needed — `app.json` already points at these paths.

### Default settings

- **Minimum players**: `MIN_PLAYERS` constant in `src/game/engine.ts` (default `3`).
- **Default hint setting**: `hintsEnabled: false` in `DEFAULT_SETTINGS` inside `src/state/settingsStore.ts` (defaults to **off**, so imposters just see "YOU ARE THE IMPOSTER" with no clue unless the player turns hints on).
- **Default selected categories**: also in `DEFAULT_SETTINGS` — defaults to `["all"]`.

---

## G. Game flow (for reference)

```text
Main Menu
    ↓ (add players, pick categories, set imposter count, toggle hints)
Start Round  →  validated, then a round is generated exactly once
    ↓
Player 1 Reveal  (hold to view → Next Player appears only after reveal)
    ↓
Player 2 Reveal
    ↓
   ...
    ↓
Final Player Reveal
    ↓
Start of Play  (random starting player shown)
    ↓
Reveal Word (optional, hideable)
    ↓
Reveal Imposters (optional, hideable)
    ↓
Play Again  →  same settings, brand-new random round
    ↓
Player 1 Reveal of the new round...
```

At any point during an active round, the Back button in the top-left asks for confirmation before returning to the Main Menu, so a round can't be lost by an accidental tap.