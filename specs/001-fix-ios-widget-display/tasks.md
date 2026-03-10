# Tasks: iOS Widget Display Recovery

**Feature**: 001-fix-ios-widget-display  
**Branch**: `001-fix-ios-widget-display`  
**Input**: Design documents from `/specs/001-fix-ios-widget-display/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/widget-types.ts

**Tests**: Automated tests are DEFERRED per constitution. Manual device testing only (documented in quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## 🚨 BLOCKER: Widget Rendering Issue (2026-03-10)

**Status**: ⏸️ FEATURE BLOCKED - All testing and verification tasks blocked

**Issue**: All widgets render completely black on iOS despite correct code implementation. Root cause appears to be expo-widgets package bug where JS runtime bundle is not being copied into widget extension (.appex).

**Affected Tasks**: T009-T025 (all verification, testing, and deployment tasks)

**Code Status**: ✅ Implementation complete (T001-T008)
- Widget directive added
- Capacity constants updated
- Weekly progress calculation implemented
- UI rendering logic complete

**Upstream Issues**:
- [expo/expo#43646](https://github.com/expo/expo/issues/43646) - ExpoWidgets.bundle JS runtime missing
- [PR #43654](https://github.com/expo/expo/pull/43654) - Proposed fix under review

**Action**: Waiting for Expo team to resolve package issue. See [quickstart.md](quickstart.md#known-issues--blockers) for full details.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (No Setup Required)

**Status**: SKIPPED - Project structure already exists; widget infrastructure already implemented

---

## Phase 2: Foundational (Critical Widget Directive Fix)

**Purpose**: Add missing `'widget'` directive that BLOCKS all widget rendering

**⚠️ CRITICAL**: Widget cannot render without this directive. This MUST complete before any user story work.

- [x] T001 Add `'widget'` directive as first line of HabitWidget component in widgets/HabitWidget.tsx
- [x] T002 Update WIDGET_CAPACITY constants to `{ small: 4, medium: 4, large: 8 }` in src/store/widget-bridge.ts

**Checkpoint**: Foundation ready - widget can now render; proceed to user story enhancements

---

## Phase 3: User Story 1 - View Habit Info On Home Screen (Priority: P1) 🎯 MVP

**Goal**: Display up to 4/4/8 habits (small/medium/large) with name, status, and weekly progress (medium/large only)

**Independent Test**: Add widget to home screen with at least one active habit and confirm visible text/content displays

### Implementation for User Story 1

- [x] T003 [US1] Extend `HabitWidgetItem` type with optional `weeklyProgress?: { completed: number; target: number }` in src/store/widget-bridge.ts
- [x] T004 [US1] Add `getWeekStartDate()` helper function to calculate Sunday 00:00 of current week in src/store/widget-bridge.ts
- [x] T005 [US1] Add `getWeekEndDate()` helper function to calculate Saturday 23:59 of current week in src/store/widget-bridge.ts
- [x] T006 [US1] Add `calculateWeeklyProgress(store, habitId, weeklyTarget)` function that counts distinct check dates within current week in src/store/widget-bridge.ts
- [x] T007 [US1] Modify `getWidgetViewState()` to call `calculateWeeklyProgress()` and populate `weeklyProgress` field for medium/large widgets only in src/store/widget-bridge.ts
- [x] T008 [US1] Update HabitWidget component to conditionally render weekly progress text "(X/Y this week)" for medium and large widgets in widgets/HabitWidget.tsx
- [ ] T009 [US1] Verify weekly progress text appears after habit title in Medium widget layout in widgets/HabitWidget.tsx
- [ ] T010 [US1] Verify weekly progress text appears after habit title in Large widget layout in widgets/HabitWidget.tsx
- [ ] T011 [US1] Test overflow indicator displays "+N more" when incomplete habits exceed capacity in widgets/HabitWidget.tsx

**Manual Testing Checklist (from quickstart.md)**:
1. Build and install app: `eas build --platform ios --profile development`
2. Add Small widget → verify 4 habits display with name + completion button
3. Add Medium widget → verify 4 habits display with name + completion button + "X/Y this week"
4. Add Large widget → verify 8 habits display with name + completion button + "X/Y this week"
5. Verify widget is NOT black or empty

**Checkpoint**: User Story 1 complete - widget displays habits with size-appropriate data

---

## Phase 4: User Story 2 - See Correct Empty State (Priority: P2)

**Goal**: Display clear empty-state message when no eligible habits available

**Independent Test**: Delete/archive all habits, verify widget shows "Add your first habit in BeeBloom"

### Implementation for User Story 2

- [ ] T012 [US2] Verify existing empty state logic in HabitWidget component handles `!hasHabits` case in widgets/HabitWidget.tsx
- [ ] T013 [US2] Verify existing loading state logic in HabitWidget component handles `!isLoaded` case in widgets/HabitWidget.tsx
- [ ] T014 [US2] Verify existing all-complete state logic in HabitWidget component handles `allComplete` case in widgets/HabitWidget.tsx

**Manual Testing Checklist (from quickstart.md)**:
1. Delete or archive all habits in main app
2. Return to home screen
3. Verify widget shows "Add your first habit in BeeBloom" message
4. Verify widget is NOT black or blank

**Checkpoint**: User Story 2 complete - empty states display correctly

---

## Phase 5: User Story 3 - Reflect Habit Changes (Priority: P3)

**Goal**: Widget updates within 15 minutes when habit data changes in main app

**Independent Test**: Create/modify a habit in app, wait up to 15 minutes, verify widget reflects changes

### Implementation for User Story 3

- [ ] T015 [US3] Verify existing `refreshWidgetTimeline()` function schedules updates at +15/30/45/60 min + next midnight in widgets/HabitWidget.tsx
- [ ] T016 [US3] Verify `refreshWidgetTimeline()` is called after habit completion in widget Button onPress handler in widgets/HabitWidget.tsx
- [ ] T017 [US3] Verify widget store auto-save persists habit completions back to shared SQLite in src/store/widget-bridge.ts

**Manual Testing Checklist (from quickstart.md)**:
1. Widget displaying habits
2. Open main app and create new habit
3. Wait up to 15 minutes (or force refresh by re-adding widget)
4. Verify new habit appears in widget
5. Verify widget remains readable (not black/empty)

**Checkpoint**: User Story 3 complete - widget refreshes after data changes

---

## Phase 6: Post-MVP Polish & Verification

**Purpose**: Final validation and cleanup

- [ ] T018 [P] Run full quickstart.md test suite (all 5 test cases) on physical iOS device
- [ ] T019 [P] Verify widget renders in light mode (iOS appearance setting)
- [ ] T020 [P] Verify widget renders in dark mode (iOS appearance setting)
- [ ] T021 [P] Test long habit names to ensure truncation doesn't clip all content
- [ ] T022 [P] Test widget with fewer habits than capacity (e.g., 2 habits in Large widget showing 8 capacity)
- [ ] T023 Rebuild with cleared cache: `eas build --platform ios --profile development --clear-cache`
- [ ] T024 Submit to TestFlight or install on test device
- [ ] T025 Document any discovered issues in quickstart.md debugging section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: SKIPPED - infrastructure exists
- **Foundational (Phase 2)**: No dependencies - START HERE - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion
  - US1, US2, US3 can proceed sequentially or in parallel after T001-T002
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational T001-T002 only
- **User Story 2 (P2)**: Independent - only verifies existing code (can run parallel to US1)
- **User Story 3 (P3)**: Independent - only verifies existing code (can run parallel to US1)

### Within Each User Story

**User Story 1 (Sequential):**
1. T003 (type extension) MUST complete before T007
2. T004-T006 (helper functions) MUST complete before T007
3. T007 (getWidgetViewState modification) MUST complete before T008-T010
4. T008 (add render logic) MUST complete before T009-T011 (testing)

**User Story 2 & 3 (All verifications):**
- All tasks are verification only - no implementation dependencies
- Can run in any order

### Parallel Opportunities

- **Phase 2**: T001 and T002 can run in parallel (different files)
- **User Stories**: US2 and US3 can run in parallel with US1 (verification only)
- **US1 Helpers**: T004 and T005 can run in parallel (both date helpers)
- **US1 Rendering**: T009 and T010 can run in parallel (different widget sizes)
- **Phase 6**: All verification tasks (T018-T022) can run in parallel

---

## Parallel Execution Example: User Story 1

```bash
# After T001-T002 (Foundation) complete:

# Batch 1 (Parallel):
T003: Extend HabitWidgetItem type
T004: Add getWeekStartDate() helper
T005: Add getWeekEndDate() helper

# Batch 2 (After Batch 1):
T006: Add calculateWeeklyProgress() function

# Batch 3 (After T006):
T007: Modify getWidgetViewState() to use calculateWeeklyProgress()

# Batch 4 (After T007):
T008: Update HabitWidget to render weekly progress

# Batch 5 (Parallel - After T008):
T009: Verify Medium widget layout
T010: Verify Large widget layout
T011: Test overflow indicator
```

---

## Task Summary

**Total Tasks**: 25  
**Critical Path**: T001 → T003-T007 → T008 → T009-T011 → T018-T025  
**Estimated Effort**: ~40 lines of code across 2 files (per research.md)  
**Files Modified**: 2 (widgets/HabitWidget.tsx, src/store/widget-bridge.ts)  
**Parallel Opportunities**: 10+ tasks can run in parallel  
**MVP Delivery**: After Phase 3 (US1) - widget displays habits correctly

---

## Implementation Strategy

1. **Start with Foundation** (T001-T002): Fix the critical bug preventing all widget rendering
2. **Deliver US1 First** (T003-T011): Core habit display with weekly progress = MVP  
3. **Verify US2 & US3** (T012-T017): Confirm existing empty state and refresh logic still works
4. **Polish & Ship** (T018-T025): Final testing and deployment

**Recommended MVP Scope**: Foundation (Phase 2) + User Story 1 (Phase 3) = Minimum viable fix for black widget
