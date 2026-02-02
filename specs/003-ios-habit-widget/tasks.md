# Tasks: iOS Home Screen Widget for Habit Tracking

**Feature**: 003-ios-habit-widget  
**Input**: Design documents from `/specs/003-ios-habit-widget/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests are DEFERRED until after the MVP is delivered unless a critical defect requires earlier coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install expo-widgets package and configure app for widget support

- [x] T001 Install expo-widgets package with command `npx expo install expo-widgets`
- [x] T002 Update app.json with expo-widgets plugin configuration per quickstart.md
- [ ] T003 Run `npx expo prebuild --clean` to generate native iOS project with widget extension target
- [ ] T004 Verify app builds successfully with `npx expo run:ios` after widget configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core widget bridge infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create src/store/widget-bridge.ts module with getTodayDateString() helper function
- [x] T006 [P] Implement getTodayIncompleteHabits() query function in src/store/widget-bridge.ts
- [x] T007 [P] Implement getWidgetViewState() function in src/store/widget-bridge.ts
- [ ] T008 Configure Tinybase store instance in widget extension to use shared App Group container path
- [ ] T009 Verify widget extension can read from shared Tinybase/SQLite database (test query in widget)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Today's Habits on Home Screen (Priority: P1) 🎯 MVP

**Goal**: Display today's incomplete habits in widget on home screen without opening app

**Independent Test**: Add widget to home screen with existing habits, verify incomplete habits display correctly in order

### Implementation for User Story 1

- [x] T010 [P] [US1] Create widgets/HabitWidget.tsx component file with basic structure and imports
- [x] T011 [US1] Implement widget rendering for incomplete habits list (VStack with habit items)
- [x] T012 [US1] Add habit display with color indicator and title in widgets/HabitWidget.tsx
- [x] T013 [US1] Implement empty state message "Add your first habit in BeeBloom" with Link to open app (only when no incomplete habits)
- [x] T014 [US1] Implement completion state message "All habits completed today! 🌸" 
- [x] T015 [US1] Add habit ordering logic to match Today view order (respecting groups)
- [x] T016 [US1] Implement refreshWidgetTimeline() function to schedule 15-minute refresh intervals
- [x] T017 [US1] Export refreshWidgetTimeline() and call updateWidgetTimeline() with scheduled dates
- [x] T044 [US1] Add retry logic for widget refresh attempts (every 5 seconds, up to 3 times) when update fails
- [x] T045 [US1] Add a midnight timeline entry to force daily reset refresh

**Checkpoint**: Widget should display habits, empty state, and completion state correctly

---

## Phase 4: User Story 2 - Complete Habit from Widget (Priority: P1) 🎯 MVP

**Goal**: Allow users to complete habits by tapping them in widget (background, no app launch)

**Independent Test**: Tap habit in widget, verify it disappears immediately and persists as completed when opening app

### Implementation for User Story 2

- [x] T018 [US2] Replace Link components with Button components for habit items in widgets/HabitWidget.tsx
- [x] T019 [US2] Implement Button action handler to write completion directly to shared Tinybase store
- [x] T020 [US2] Add store.setRow() call to mark habit as complete for today in action handler
- [x] T021 [US2] Call refreshWidgetTimeline() after completion to update widget display immediately
- [ ] T022 [US2] Verify widget extension has write permissions to shared App Group database
- [ ] T023 [US2] Test completion persists correctly - open main app and verify check appears

**Checkpoint**: User Story 2 complete - habits can be completed from widget in background without app opening

---

## Phase 5: User Story 3 - Adapt to Widget Size (Priority: P2)

**Goal**: Support small (2-3 habits), medium (4-6), large (8-10) widget sizes with responsive rendering

**Independent Test**: Add widgets of all 3 sizes to home screen, verify each shows appropriate habit count

### Implementation for User Story 3

- [x] T024 [P] [US3] Add size detection logic using props.family in widgets/HabitWidget.tsx
- [x] T025 [P] [US3] Implement WIDGET_CAPACITY constants (small: 3, medium: 6, large: 10)
- [x] T026 [US3] Call getWidgetViewState() with appropriate capacity limit based on widget size
- [x] T027 [US3] Adjust font sizes and padding based on widget size (smaller for small widget)
- [x] T028 [US3] Implement overflow indicator "+N more" when habits exceed widget capacity
- [ ] T029 [US3] Test all 3 widget sizes display correctly with different habit counts

**Checkpoint**: All widget sizes render appropriately with correct habit limits

---

## Phase 6: User Story 4 - Open App from Widget (Priority: P3)

**Goal**: When no incomplete habits, tapping the widget opens app to Today view

**Independent Test**: With no incomplete habits, tap widget and verify app opens to Today view

### Implementation for User Story 4

- [x] T030 [US4] Ensure widget title is not a Link when incomplete habits exist
- [x] T031 [US4] Wrap empty state and all-complete messages with Link to open app
- [x] T032 [US4] Verify app.json has URL scheme configured: "scheme": "beebloom"
- [ ] T033 [US4] Test deep link opens app correctly to Today view (expo-router handles routing)

**Checkpoint**: All user stories complete - widget fully functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, code quality, and documentation

- [ ] T034 [P] Run `bun run lint` and fix any Biome errors or warnings
- [ ] T035 [P] Add TypeScript type annotations to all widget bridge functions
- [ ] T036 Test midnight rollover behavior by advancing system time (widget should reset to incomplete)
- [ ] T037 Test offline functionality - enable airplane mode, verify widget still works
- [ ] T038 Test habit deletion in main app - verify widget updates to remove deleted habit
- [ ] T039 Test with long habit titles - verify ellipsis truncation works correctly
- [ ] T040 Test with no habits, some habits, all completed - verify all states display correctly
- [ ] T041 [P] Validate all quickstart.md test scenarios pass on physical device or simulator
- [ ] T042 [P] Add code comments to widget component explaining size-responsive logic
- [ ] T043 Verify widget update timing - complete habit in app, check widget updates within 5 seconds
- [ ] T046 Update package version in package.json and app.json to 1.3.0

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 both P1 priority, can work in parallel but US2 builds on US1 component
  - US3 depends on US1/US2 (modifies same widget component)
  - US4 minimal, can run in parallel with US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates base widget component
- **User Story 2 (P1)**: Depends on US1 widget component existing - Adds completion interaction
- **User Story 3 (P2)**: Depends on US1/US2 - Adds size responsiveness to existing component
- **User Story 4 (P3)**: Independent - Just adds deep link to widget title/empty areas

### Within Each User Story

- Widget bridge functions (T005-T009) MUST complete before any widget component work
- Widget component structure (T010) before habit display logic (T011-T017)
- Display logic before interaction logic (US1 before US2)
- Core functionality before polish and edge cases

### Parallel Opportunities

#### Setup Phase (Phase 1)
- T001-T004 are sequential (package install → config → prebuild → verify)

#### Foundational Phase (Phase 2)
- T006 and T007 can run in parallel (different query functions, same file)
- T005 must complete before T006/T007 (helper function used by queries)
- T008-T009 sequential (configure then verify)

#### User Story 1 (Phase 3)
- T010 first (creates file)
- T011-T017 mostly sequential (building up component features)

#### User Story 2 (Phase 4)
- T018-T023 mostly sequential (modifying same component and testing)

#### User Story 3 (Phase 5)
- T024 and T025 can run in parallel (different concerns)
- T026-T029 sequential (each builds on previous)

#### User Story 4 (Phase 6)
- T030-T033 mostly sequential

#### Polish Phase (Phase 7)
- T034, T035, T041, T042 can all run in parallel (different files/concerns)
- T036-T040, T043 are manual tests, can run in any order

---

## Parallel Example: Foundational Phase

```bash
# After T005 completes, launch T006 and T007 together:

# Terminal 1
# Implement getTodayIncompleteHabits() in src/store/widget-bridge.ts

# Terminal 2  
# Implement getWidgetViewState() in src/store/widget-bridge.ts

# Both write to same file but different functions - merge when complete
```

---

## Implementation Strategy

### MVP Scope (Ship First)

**Phase 1**: Setup ✅  
**Phase 2**: Foundational ✅  
**Phase 3**: User Story 1 (P1) ✅ - View habits  
**Phase 4**: User Story 2 (P1) ✅ - Complete from widget  

**MVP Delivery**: After Phase 4, widget can display and complete habits - core value delivered

### Post-MVP Iterations

**Phase 5**: User Story 3 (P2) - Size variants (enhances flexibility)  
**Phase 6**: User Story 4 (P3) - Open app link (nice-to-have)  
**Phase 7**: Polish (quality and edge cases)

### Validation Checkpoints

After **Phase 2** (Foundation):
- Widget bridge queries return correct data
- Shared storage access verified

After **Phase 4** (MVP - US1 + US2):
- Widget displays on home screen
- Habits can be viewed and completed
- Changes persist to main app
- **Ready to ship to users for feedback**

After **Phase 5** (US3):
- All 3 widget sizes work correctly

After **Phase 6** (US4):
- Deep link navigation works

After **Phase 7** (Polish):
- All edge cases handled
- Code quality validated
- Production ready

---

## Total Task Count

**Setup**: 4 tasks  
**Foundational**: 5 tasks  
**User Story 1 (P1)**: 8 tasks  
**User Story 2 (P1)**: 6 tasks  
**User Story 3 (P2)**: 6 tasks  
**User Story 4 (P3)**: 4 tasks  
**Polish**: 10 tasks  

**Total**: 43 tasks

**Estimated Time**: 6-8 hours total (as per plan.md)

**MVP Time** (Phase 1-4 only): ~4-5 hours
