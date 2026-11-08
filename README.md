# Wizard LMS student app

The student application is a JavaScript React Native app built with Expo SDK 54 and Expo Router.

## Project structure

```text
app/                         Expo Router screens and layouts
assets/                      Images and other bundled assets
components/
  battle/                    Battle-mode UI
  home/                      Home screen UI
  lessonsScreen/              Lesson library and player UI
    player/
  shared/                    UI reused across features
constants/                   Fonts and asset-preload definitions
context/                     App-wide React contexts
data/                        Static UI and game data
hooks/                       Screen and interaction state
services/                    Firebase and local-storage operations
```

Keep route files inside `app/` so Expo Router continues to expose the same routes. Components should not access Firebase directly; use hooks for screen state and `services/` for persistence and backend calls.

## Data flow

- Screens in `app/` compose feature components and hooks.
- `hooks/` manages view and interaction state.
- `services/` handles Firebase Authentication, Firestore, Cloud Functions, Storage, and the AsyncStorage student cache.
- PvE and PvP battle completion is recorded through `battleStatsService`; it updates overall and mode-specific statistics and preserves the existing battle-history entry shape.
- `useBattleStats` loads overall, PvE, and PvP totals and history for the home menu.
- Completed battles update a public `leaderboards/{uid}` projection. `leaderboardService` ranks that collection by wins, then win rate, and `useLeaderboard` supplies the three views on the Leaderboard tab.
- Leaderboard projections contain only usernames and battle totals, keeping the private `users/{uid}` documents out of public collection reads. Firestore rules must allow signed-in reads of `leaderboards` and owner-only writes to each user's projection.
- Legacy `battleWins` and `battleLosses` seed overall totals the first time a user records a battle with the new schema. Existing mode-specific totals cannot be reconstructed from the legacy counters; PvE and PvP totals start with battles recorded under the new schema.
- Battle totals and history are stored on `users/{uid}` and mirrored to the student cache after a result is recorded.
- Student progress and lesson rewards remain stored through the existing Firebase documents and transactions.
- Shop purchases atomically deduct gold and store `ownedSkins` and `ownedCards` on `users/{uid}`; the student cache and home-screen state refresh immediately after a purchase.
- Inventory rows are derived from those owned IDs and the catalog in `data/shopItems.js`; repeated card purchases display as a quantity.
- Firebase Auth uses browser persistence on web and AsyncStorage-backed persistence on native.

## Development

Install dependencies and start Expo:

```bash
npm install
npm start
```

Run the configured lint check:

```bash
npm run lint
```

## PvP battles

Start the WebSocket relay from the project root:

```bash
npm run pvp:server
```

In the PvP screen, enter the computer's LAN address as `ws://<computer-ip>:5000` and use the same room code on both devices. Set `EXPO_PUBLIC_PVP_SERVER_URL` in `.env` to prefill the server address.

Firebase configuration is read from the `EXPO_PUBLIC_FIREBASE_*` environment variables. Keep local `.env` values out of source control.
