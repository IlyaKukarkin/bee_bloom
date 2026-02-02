# bee_bloom Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-02

## Active Technologies
- TypeScript 5.9, React 19, React Native 0.81 (Expo SDK 54) + Expo Router, Tinybase, Expo SQLite, AsyncStorage, gesture-handler/reanimated stack; plan to add a minimal draggable list helper for RN/Expo (001-reorder-habits-groups)
- Tinybase persisted to Expo SQLite on native, local storage on web (per `useAndStartPersister`) (001-reorder-habits-groups)
- TypeScript 5.9, React Native 0.81.5 via Expo SDK 54 + Expo Router 6.0, TinyBase 7.3 (local-first state), React 19.1 (002-weekly-habit-target)
- TinyBase in-memory store with async-storage persistence, expo-sqlite for future migrations (002-weekly-habit-target)
- TypeScript (Expo React Native) + Expo runtime, Expo UI (`@expo/ui`), React Navigation/Expo Router, Tinybase (+ AsyncStorage persister), Expo FileSystem/Storage APIs as needed (001-gentle-habit-mvp)
- expo-widgets package with WidgetKit bridge, iOS App Group for shared Tinybase storage, SwiftUI components via @expo/ui/swift-ui (003-ios-habit-widget)

## Project Structure

```text
src/
widgets/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript (Expo React Native): Follow standard conventions

## Recent Changes
- 003-ios-habit-widget: Added expo-widgets package with WidgetKit bridge, iOS App Group for shared Tinybase storage, SwiftUI components via @expo/ui/swift-ui
- 002-weekly-habit-target: Added TypeScript 5.9, React Native 0.81.5 via Expo SDK 54 + Expo Router 6.0, TinyBase 7.3 (local-first state), React 19.1
- 001-reorder-habits-groups: Added TypeScript 5.9, React 19, React Native 0.81 (Expo SDK 54) + Expo Router, Tinybase, Expo SQLite, AsyncStorage, gesture-handler/reanimated stack; plan to add a minimal draggable list helper for RN/Expo
- 001-gentle-habit-mvp: Added TypeScript (Expo React Native) + Expo runtime, Expo UI (`@expo/ui`), React Navigation/Expo Router, Tinybase (+ AsyncStorage persister), Expo FileSystem/Storage APIs as needed

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
