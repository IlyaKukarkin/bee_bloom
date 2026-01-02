# Research: BeeBloom Gentle Habit MVP

## Decisions

### Tinybase persistence on Expo
- **Decision**: Use Tinybase store/tables with `@tinybase/persister-async-storage` to persist habits/checks into `@react-native-async-storage/async-storage`.
- **Rationale**: AsyncStorage is bundled-friendly on Expo, works offline, and requires no native mods. The Tinybase persister provides simple `startAutoSave`/`startAutoLoad` hooks.
- **Alternatives considered**: SQLite via `expo-sqlite` (more setup, unnecessary for simple tables); custom JSON file with FileSystem (more glue, no schema benefits).

### Bundler choice (Vite + Expo)
- **Decision**: Keep Metro for native (required) and enable Vite for web/dev by setting `EXPO_USE_WEB_VITE=1` and adding a minimal `vite.config.ts` with React plugin; run `expo start --web` to use Vite, `expo start` for native.
- **Rationale**: Satisfies request for Vite while retaining Expo-native defaults; no impact on native builds.
- **Alternatives considered**: Metro-only (simpler but ignores request); separate Vite app (splits codebase, adds scope).

### OS-level backup
- **Decision**: Rely on platform backup defaults: iOS iCloud app data backup and Android Auto Backup (or Cloud Backup) for AsyncStorage files; no custom sync.
- **Rationale**: Meets "optional OS backup" with zero extra features; aligns with MVP local-only scope.
- **Alternatives considered**: Custom cloud sync (out of scope); manual export/import (adds UI and complexity).

### UI library
- **Decision**: Use `@expo/ui` components with a light custom theme (garden-inspired) and modest motion via `Animated`/Reanimated primitives only where needed.
- **Rationale**: Keeps UI consistent, minimizes custom styling, matches requirement for gentle animations.
- **Alternatives considered**: Headless styling or other kits (more work; unnecessary for MVP).
