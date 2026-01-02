# Quickstart: BeeBloom Gentle Habit MVP

## Prereqs
- Node 18+; npm or yarn
- Expo CLI (`npx expo`); iOS Simulator or Android Emulator for native

## Bootstrap
1. Create the Expo app (TypeScript):
   - `npx create-expo-app@latest` (choose blank TypeScript template) in the repo root.
2. Install UI kit:
   - `npx expo install @expo/ui`
3. Install data + persistence:
   - `npm install tinybase @tinybase/react @tinybase/persister-async-storage @react-native-async-storage/async-storage`
4. Install Vite for web bundling:
   - `npm install -D vite @vitejs/plugin-react`
5. Optional: add `.env` with `EXPO_USE_WEB_VITE=1` to use Vite on web.

## Run
- Native (Metro): `npx expo start`
- Web (Vite): `EXPO_USE_WEB_VITE=1 npx expo start --web`

## Notes
- Local-only data; no backend, no notifications.
- Tinybase store persists to AsyncStorage via `@tinybase/persister-async-storage`.
- Keep animations gentle; no test suite in MVP.
