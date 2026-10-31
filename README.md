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
- Student progress and lesson rewards remain stored through the existing Firebase documents and transactions.
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
