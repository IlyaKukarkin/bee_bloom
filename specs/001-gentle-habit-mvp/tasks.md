# Tasks: BeeBloom Gentle Habit MVP

**Input**: Design documents from `/specs/001-gentle-habit-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Automated tests are DEFERRED until after the MVP is delivered unless a critical defect requires earlier coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Initialize Expo app scaffold with TypeScript via `npx create-expo-app@latest` (creates [package.json](package.json) and [app/](app/))
- [X] T002 Install Expo UI kit `@expo/ui` using `npx expo install` (recorded in [package.json](package.json))
- [X] T003 Install Tinybase + AsyncStorage deps (`tinybase`, `@react-native-async-storage/async-storage`) in [package.json](package.json)
- [X] T004 Add Vite configuration for web runs in [vite.config.ts](vite.config.ts) with React plugin and Expo web support
- [X] T005 Add `.env` enabling optional Vite web (`EXPO_USE_WEB_VITE=1`) and document in [README.md](README.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T006 Set up Expo Router layout with providers (theme + Tinybase store) in [app/_layout.tsx](app/_layout.tsx)
- [X] T007 [P] Define theme palette/typography and garden tone tokens in [src/lib/theme.ts](src/lib/theme.ts)
- [X] T008 [P] Add supportive copy strings for empty and success states in [src/lib/copy.ts](src/lib/copy.ts)
- [X] T009 [P] Define data schemas/types for Habit and DailyCheck in [src/store/schema.ts](src/store/schema.ts) and [src/store/types.ts](src/store/types.ts)
- [X] T010 [P] Create Tinybase store setup with AsyncStorage persister and autosave/autoload in [src/store/index.ts](src/store/index.ts) and [src/store/persister.ts](src/store/persister.ts)
- [X] T011 [P] Add date helpers enforcing today/yesterday keys and ISO formatting in [src/lib/dates.ts](src/lib/dates.ts)
- [X] T012 [P] Create shared UI wrappers (surface/card/button/text styles) using Expo UI in [src/components/ui.tsx](src/components/ui.tsx)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Log a Habit Today (Priority: P1) 🎯 MVP

**Goal**: Create a habit offline and mark today’s check; persists after restart.
**Independent Test (manual)**: Offline device → create habit → mark today → restart app offline → habit and today’s completion remain.

- [X] T013 [US1] Implement habit CRUD mutations (create/edit/delete) with Tinybase in [src/store/habits.ts](src/store/habits.ts)
- [X] T014 [US1] Implement daily check toggle/upsert (today or yesterday only) in [src/store/checks.ts](src/store/checks.ts)
- [X] T015 [US1] Build habit form screen for create/edit using Expo UI in [app/habit/new.tsx](app/habit/new.tsx) and [app/habit/[id].tsx](app/habit/%5Bid%5D.tsx)
- [X] T016 [US1] Build Today list with check toggles and local persistence in [app/index.tsx](app/index.tsx)
- [X] T017 [US1] Wire navigation and delete confirmation flow with gentle copy in [app/index.tsx](app/index.tsx) and [app/habit/[id].tsx](app/habit/%5Bid%5D.tsx)

**Checkpoint**: User Story 1 functional and persists offline after restart

---

## Phase 4: User Story 2 - See Today’s Plan (Priority: P2)

**Goal**: Gentle Today screen with supportive copy, grouping visuals, and stable state on revisit.
**Independent Test (manual)**: With habits present, open Today → see habits with single check; supportive empty-state copy; toggles persist after restart.

- [X] T018 [US2] Add supportive empty-state and encouragement messaging in Today screen using [src/lib/copy.ts](src/lib/copy.ts) within [app/index.tsx](app/index.tsx)
- [X] T019 [US2] Render color/group chips and grouped ordering in Today list component [src/components/today/List.tsx](src/components/today/List.tsx)
- [X] T020 [US2] Add gentle animations for list rows and toggle feedback in [src/components/today/AnimatedRow.tsx](src/components/today/AnimatedRow.tsx)

**Checkpoint**: Today view is calming, grouped, and retains state on reopen

---

## Phase 5: User Story 3 - Review Week and Organize (Priority: P3)

**Goal**: Weekly progress with last 7 days per habit, showing colors/groups.
**Independent Test (manual)**: With multiple days recorded, open Weekly → see 7-day history per habit with color/group context; offline stable.

- [X] T021 [US3] Add selector to compute last 7 days per habit in [src/store/selectors.ts](src/store/selectors.ts)
- [X] T022 [US3] Build weekly view screen showing 7-day grid per habit in [app/weekly.tsx](app/weekly.tsx)
- [X] T023 [US3] Add grouping sections/filters with color chips in weekly view in [app/weekly.tsx](app/weekly.tsx)
- [X] T024 [US3] Add navigation entry to weekly view (tab/stack link) in [app/_layout.tsx](app/_layout.tsx)

**Checkpoint**: Weekly view delivers calm 7-day reflection offline

---

## Phase N: Post-MVP Polish & Cross-Cutting Concerns

- [X] T025 [P] Refine garden-tone copy and microcopy review in [src/lib/copy.ts](src/lib/copy.ts)
- [X] T026 [P] Add placeholder app icon/splash assets and wire in [app.json](app.json) with files under [assets/](assets/)
- [X] T027 [P] Add manual QA checklist (offline, backfill yesterday, delete flows, weekly view) in [specs/001-gentle-habit-mvp/checklists/qa.md](specs/001-gentle-habit-mvp/checklists/qa.md)
- [X] T028 [P] Update [README.md](README.md) with run commands (native/web), backfill rule, and scope notes
- [X] T029 [P] Verify OS backup eligibility for AsyncStorage data and document expected behavior in [README.md](README.md)
- [X] T030 [P] Confirm no notification permissions/configs or libs are present (FR-012) and record in [README.md](README.md)
- [X] T031 [P] Run iOS Simulator and Android Emulator smoke (create, toggle today/yesterday, restart) and capture notes in [specs/001-gentle-habit-mvp/checklists/qa.md](specs/001-gentle-habit-mvp/checklists/qa.md)

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User stories (P1 → P2 → P3) → Polish.
- Within User Story 1: T013 → T014 → T015/T016 (parallel after data) → T017.
- Within User Story 2: T018 → T019 → T020.
- Within User Story 3: T021 → T022 → T023 → T024.

## Parallel Opportunities

- Phase 2: T007, T008, T009, T010, T011, T012 can proceed in parallel once T006 scaffold is ready.
- User Story 1: T015 and T016 can proceed in parallel after T013/T014 land.
- Polish: T025–T028 are independent.

## Implementation Strategy

1. Complete Setup (Phase 1) and Foundational (Phase 2) to establish store, theme, and navigation.
2. Deliver User Story 1 end-to-end (habit create/toggle today/yesterday, persistence) and validate offline restart.
3. Layer User Story 2 refinements (supportive copy, grouping visuals, gentle animations) without changing flows.
4. Add User Story 3 weekly view and navigation entry.
5. Perform light polish and manual QA; defer automated tests and cloud sync until post-MVP.
