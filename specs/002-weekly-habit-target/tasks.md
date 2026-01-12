# Tasks: Weekly Habit Target

**Input**: Design documents from `/specs/002-weekly-habit-target/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests are DEFERRED until after the MVP is delivered unless a critical defect requires earlier coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies required across all user stories

- [X] T001 Install @react-native-picker/picker dependency via `npx expo install @react-native-picker/picker`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model and migration that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add weeklyTarget field to habits table schema in src/store/schema.ts
- [X] T003 Add weeklyTarget property to HabitRow interface in src/store/types.ts
- [X] T004 Create migrateToWeeklyTarget() migration function in src/store/migrations.ts
- [X] T005 Call migrateToWeeklyTarget() from store initialization in src/store/index.tsx
- [X] T006 [P] Add getWeekStart() utility function in src/lib/dates.ts
- [X] T007 [P] Add getWeekEnd() utility function in src/lib/dates.ts
- [X] T008 [P] Add formatDateKey() utility function in src/lib/dates.ts (if not already exists)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Set Weekly Target for New Habit (Priority: P1) 🎯 MVP

**Goal**: Enable users to set weekly target (1-7) when creating new habits via dropdown, with default of 7

**Independent Test**: Create a new habit, select target from dropdown (or accept default 7), save, and verify weeklyTarget is persisted correctly

### Implementation for User Story 1

- [X] T009 [P] [US1] Create WeeklyTargetPicker component in src/components/ui.tsx with Picker displaying options 1-7
- [X] T010 [US1] Add weeklyTarget state (default: 7) to new habit form in app/habit/new.tsx
- [X] T011 [US1] Integrate WeeklyTargetPicker component into new habit form in app/habit/new.tsx
- [X] T012 [US1] Include weeklyTarget value when saving new habit in app/habit/new.tsx

**Checkpoint**: User Story 1 complete - users can set weekly targets when creating habits

---

## Phase 4: User Story 2 - Edit Weekly Target for Existing Habit (Priority: P2)

**Goal**: Enable users to modify weekly target for existing habits via dropdown, pre-populated with current value

**Independent Test**: Edit an existing habit, change weekly target via dropdown, save, and verify updated value persists

### Implementation for User Story 2

- [X] T013 [US2] Add weeklyTarget state initialized from habit.weeklyTarget in app/habit/[id].tsx
- [X] T014 [US2] Integrate WeeklyTargetPicker component into edit habit form in app/habit/[id].tsx
- [X] T015 [US2] Include updated weeklyTarget value when saving edited habit in app/habit/[id].tsx

**Checkpoint**: User Story 2 complete - users can edit weekly targets for existing habits

---

## Phase 5: User Story 3 - View Weekly Progress on Weekly Screen (Priority: P1) 🎯 MVP

**Goal**: Display weekly progress as "X/Y" format for each habit on the weekly overview screen

**Independent Test**: Create habits with different targets, mark some as complete, verify weekly screen shows correct progress fractions (e.g., "2/3", "5/7")

### Implementation for User Story 3

- [X] T016 [P] [US3] Create useWeeklyProgress(habitId) selector in src/store/selectors.ts that queries checks table for current week
- [X] T017 [US3] Integrate useWeeklyProgress hook into weekly screen component in app/weekly.tsx
- [X] T018 [US3] Display progress.display value ("X/Y" format) for each habit in app/weekly.tsx

**Checkpoint**: User Story 3 complete - users can see weekly progress for all habits

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches and validation across all user stories

- [ ] T019 Verify migration runs correctly on app startup and applies default weeklyTarget=7 to existing habits
- [ ] T020 Test dropdown usability on both iOS and Android devices
- [ ] T021 Verify progress display updates immediately when habit is marked complete
- [ ] T022 Test edge case: habit completed more times than target (e.g., "8/7" displays correctly)
- [ ] T023 Verify week transition resets progress counts to 0

---

## Dependencies & Parallel Execution

### Dependency Graph (User Story Completion Order)

```
Phase 1 (Setup) → Phase 2 (Foundational)
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    User Story 1   User Story 2   User Story 3
      (P1 MVP)        (P2)          (P1 MVP)
        ↓               ↓               ↓
        └───────────────┼───────────────┘
                        ↓
                  Phase 6 (Polish)
```

**Note**: User Stories 1, 2, and 3 can be implemented in parallel after Phase 2 is complete. However, for MVP delivery, prioritize US1 and US3 together (both P1).

### Parallel Execution Opportunities

**Within Phase 2 (Foundational)**:
- T006, T007, T008 (date utilities) can run in parallel with schema/migration work

**Across User Stories (after Phase 2)**:
- T009 (WeeklyTargetPicker component) can be developed in parallel with T016 (useWeeklyProgress selector)
- US1 tasks (T009-T012) and US3 tasks (T016-T018) are fully independent and can be implemented simultaneously
- US2 tasks (T013-T015) depend on WeeklyTargetPicker from US1 (T009)

**Suggested MVP Sequence**:
1. Complete Phase 1 & 2 (foundational)
2. Implement US1 & US3 in parallel (both P1, core MVP value)
3. Implement US2 (P2, enhances flexibility but not critical for initial value)
4. Complete Phase 6 (polish & validation)

---

## Implementation Strategy

### MVP First (Recommended)

**MVP Scope**: User Story 1 + User Story 3
- Users can set targets when creating habits
- Users can see progress on weekly screen
- Delivers core value proposition

**Post-MVP**: User Story 2
- Add editing capability once MVP is validated

### Incremental Delivery Checkpoints

1. **Checkpoint 1** (After Phase 2): Data layer ready, migrations work
2. **Checkpoint 2** (After US1): Can create habits with targets
3. **Checkpoint 3** (After US3): Can view weekly progress
4. **Checkpoint 4** (After US2): Can edit targets for existing habits
5. **Checkpoint 5** (After Phase 6): All polish complete, ready to ship

---

## Task Summary

- **Total Tasks**: 23
- **Setup Phase**: 1 task
- **Foundational Phase**: 7 tasks (critical path)
- **User Story 1 (P1 MVP)**: 4 tasks
- **User Story 2 (P2)**: 3 tasks
- **User Story 3 (P1 MVP)**: 3 tasks
- **Polish Phase**: 5 tasks

**Parallelizable Tasks**: 4 tasks marked with [P]

**Critical Path for MVP**: Phase 1 → Phase 2 → (US1 + US3) → Phase 6  
**Estimated MVP Time**: 60-90 minutes  
**Full Feature Time**: 85-115 minutes

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description`  
✅ All tasks include specific file paths  
✅ Tasks organized by user story for independent implementation  
✅ Each user story has clear goal and independent test criteria  
✅ Dependencies documented in graph  
✅ Parallel opportunities identified
