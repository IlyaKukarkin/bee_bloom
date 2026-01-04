# BeeBloom 🌸🌸

A gentle habit tracker that feels like a quiet garden, not a productivity app.

## Overview

BeeBloom is an offline-first mobile app for iOS and Android that helps you track daily habits with a calm, supportive approach. Built for personal use with privacy in mind - all data stays on your device.

## Features

- **Offline-first**: No internet required, all data stored locally
- **Daily check-ins**: Mark habits for today or yesterday only (gentle backfill)
- **Habit organization**: Group habits by category and assign colors
- **Weekly review**: See 7-day progress for all habits
- **No notifications**: Calm, non-intrusive experience
- **No authentication**: Just open and use

## Tech Stack

- **Framework**: Expo SDK 54 with React Native 0.81.5
- **Language**: TypeScript 5.9.2
- **Navigation**: Expo Router 6.0.21 (file-based routing)
- **Data Layer**: Tinybase 7.3.1 with Expo SQLite (native) and LocalStorage (web)
- **UI**: Custom components with garden-tone palette
- **Web Bundler**: Vite 7.3.0 (optional via `EXPO_USE_WEB_VITE=1`)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode and iOS Simulator (macOS only)
- For Android: Android Studio and Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Run Commands

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web

# Development server (choose platform)
npm start
```

### Optional: Vite for Web

To use Vite for web bundling (faster HMR), set the environment variable:

```bash
EXPO_USE_WEB_VITE=1 npm run web
```

This is already configured in `.env`.

## Project Structure

```
bee_bloom/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx        # Root layout with tabs and providers
│   ├── index.tsx          # Today view (home screen)
│   ├── weekly.tsx         # Weekly review view
│   └── habit/
│       ├── new.tsx        # Create habit form
│       └── [id].tsx       # Edit habit form
├── src/
│   ├── components/
│   │   ├── ui.tsx         # Shared UI components
│   │   └── animations.tsx # Gentle animations
│   ├── lib/
│   │   ├── theme.tsx      # Garden-tone theme
│   │   ├── copy.ts        # Supportive copy strings
│   │   └── dates.ts       # Date helpers
│   └── store/
│       ├── index.tsx      # Tinybase store provider
│       ├── persister.ts   # Persistence layer (SQLite/LocalStorage)
│       ├── schema.ts      # Data schema
│       ├── types.ts       # TypeScript types
│       ├── habits.ts      # Habit CRUD operations
│       ├── checks.ts      # Daily check operations
│       └── selectors.ts   # Weekly data selectors
├── specs/                 # Feature specifications and design docs
├── .specify/              # Speckit configuration
└── package.json
```

## Data Model

### Habit
- `id`: Unique identifier
- `title`: Habit name (required, 1-80 chars)
- `description`: Optional details (0-200 chars)
- `color`: Color from garden palette
- `group`: Optional grouping label (0-40 chars)
- `createdAt`: Creation timestamp
- `deletedAt`: Soft delete timestamp (null if active)

### DailyCheck
- `habitId`: Reference to habit
- `date`: YYYY-MM-DD format (local device date)
- `completed`: Boolean
- `updatedAt`: Last update timestamp

## Backfill Rules

- **Allowed**: Mark checks for today or yesterday only
- **Forbidden**: Future dates or dates older than yesterday
- **Rationale**: Gentle enforcement to prevent retroactive logging while allowing reasonable backfill

## OS Backup Eligibility

### iOS
- Data stored in SQLite database via Expo SQLite
- Default location: App Documents directory
- **Eligible for iCloud backup**: Yes (automatic if user has iCloud enabled)
- **iTunes backup**: Yes (included in local backups)

### Android
- Data stored in SQLite database via Expo SQLite
- Default location: App's private data directory
- **Eligible for cloud backup**: Yes (Android Auto Backup enabled by default)
- **Local backup**: Yes (via ADB backup or cloud services)

### Expected Behavior
Users who enable OS-level backups (iCloud on iOS, Google Drive on Android) will have their BeeBloom data backed up automatically. No additional configuration required.

## Notifications

**BeeBloom has NO notification functionality.**

- No push notifications
- No local notifications
- No notification permissions requested
- No notification libraries installed

This is intentional - the app is designed to be calm and non-intrusive.

## Testing

This MVP does not include automated tests per constitution guidelines. Manual QA checklist is available in:

```
specs/001-gentle-habit-mvp/checklists/qa.md
```

## Known Scope Limitations (Deferred to Post-MVP)

- Cloud sync across devices
- Habit streaks or analytics
- Reminders or notifications (intentionally excluded)
- Export/import functionality
- Themes or customization beyond default palette
- Performance optimization for large datasets (>100 habits)

## License

Private project for personal use.

## Contributing

This is a personal project not accepting contributions.
