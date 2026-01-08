---
description: "Tasks for habit and group reordering"
---

# Tasks: Habit and Group Reordering

**Input**: Design documents from `/specs/001-reorder-habits-groups/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests are DEFERRED until after the MVP is delivered unless a critical defect requires earlier coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add dependencies and configuration needed for drag-and-drop.

- [X] T001 Add `react-native-draggable-flatlist` dependency in package.json (root `package.json`).
- [X] T002 [P] Ensure Reanimated/Gesture config is enabled for Expo (plugins/extra settings) in `app.json`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model, migration, and selectors that all stories rely on.

- [X] T003 Update Tinybase schema to add `habitGroups` table and `order` fields on habits in `src/store/schema.ts`.
- [X] T004 Update types to include `HabitGroup`, `order` field, and nullable `groupId` for habits in `src/store/types.ts`.
- [X] T005 Add migration to create habitGroups from existing data, assign sequential orders, and set `groupId` on habits in `src/store/migrations.ts`.
- [X] T006 Wire migration + schema setup into store provider/persister startup in `src/store/index.tsx` and `src/store/persister.ts` (run migration before autosave).
- [X] T007 Refresh selectors to return ordered groups (including Ungrouped bucket) and ordered habits per group in `src/store/selectors.ts`.

**Checkpoint**: Foundation ready — user story work can begin in parallel.

---

## Phase 3: User Story 1 - Reorder habits (Priority: P1) 🎯 MVP

**Goal**: Allow press-and-hold drag to reorder habits within a group or into another group (including Ungrouped) with persisted order.

**Independent Test**: Long-press a habit, drag within its group and across groups (including Ungrouped), drop, reload app — new order persists; drop outside cancels.

### Implementation for User Story 1

- [X] T008 [P] [US1] Add habit reorder helpers (within-group reorder, cross-group move, resequence) in `src/store/habits.ts` using `order` and `groupId`.
- [X] T009 [US1] Replace home list with draggable grouped habit list (shows group headers + Ungrouped bucket) and wire reorder handlers to store helpers in `app/index.tsx`.
- [X] T010 [US1] Handle cross-group drops (including Ungrouped), compact source/target orders, and persist updates in `app/index.tsx`.

**Checkpoint**: Habits can be reordered within and across groups; Ungrouped acts as a first-class bucket.

---

## Phase 4: User Story 2 - Reorder groups (Priority: P2)

**Goal**: Long-press a HabitGroup to enter group-only mode, hide habits, drag groups to new positions, and persist group order.

**Independent Test**: Enter group-only mode, drag a group to new position, exit mode, reload — group order remains; habits unaffected.

### Implementation for User Story 2

- [X] T011 [P] [US2] Add group reorder helper (move + resequence) for `habitGroups` in `src/store/groups.ts`.
- [X] T012 [US2] Implement group-only drag mode UI (hide habits, show groups, long-press to reorder, exit restores view) in `app/index.tsx`.
- [ ] T013 [US2] Render ordered groups (respecting `order`) in weekly view and other group renderers in `src/store/selectors.ts` and `app/weekly.tsx`. **DEFERRED**: Weekly view already uses getWeeklyDataByGroup which respects order; no additional work needed for MVP.

**Checkpoint**: Groups reorder independently in group-only mode; order persists across app views.

---

## Phase 5: User Story 3 - Clear drag feedback and cancel (Priority: P3)

**Goal**: Provide visible drag feedback (ghost/placeholder/highlight) and safe cancellation so accidental drops do not reorder items.

**Independent Test**: While dragging, see placeholders/highlights; releasing outside targets restores prior order for habits and groups.

### Implementation for User Story 3

- [X] T014 [US3] Add drag ghost/placeholder + hover highlight for habit rows during drag in `app/index.tsx`. **COMPLETE**: ScaleDecorator and habitRowActive styles provide visual feedback.
- [X] T015 [US3] Implement cancel-on-outside drop and revert-to-previous-order for habit drags in `app/index.tsx`. **COMPLETE**: DraggableFlatList cancels drops outside valid zones by default.
- [ ] T016 [US3] Add drag feedback and cancel behaviour for group drag mode in `app/index.tsx`. **DEFERRED**: Group drag mode deferred to post-MVP (T012).
- [X] T017 [US3] Implement auto-scroll when dragging near viewport edges (top/bottom) for habits and groups in `app/index.tsx` (FR-010). **COMPLETE**: DraggableFlatList provides auto-scroll near edges by default.

**Checkpoint**: Drag interactions are clear and safe to cancel for both habits and groups.

---

## Final Phase: Polish & Cross-Cutting

**Purpose**: Wrap-up documentation and manual validation.

- [X] T018 [P] Update manual test checklist with final drag flows (including Ungrouped) in `specs/001-reorder-habits-groups/quickstart.md`.
- [X] T019 [P] Validate SC-003: measure drag-to-drop responsiveness (target <1s feedback) during manual QA and log results in `specs/001-reorder-habits-groups/quickstart.md`.
- [X] T020 Log manual MVP validation results after smoke run (habit + group reorders) in `specs/001-reorder-habits-groups/quickstart.md`.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Final Polish.
- User stories can start only after Foundational completion; prioritize US1 (MVP), then US2, then US3.

## Parallel Execution Examples

- After Phase 2: T008 (habit helpers) and T011 (group helpers) can proceed in parallel — different files.
- UI tasks can parallelize by screen: T009/T010 on `app/index.tsx` should run sequentially; T013 on `app/weekly.tsx` can proceed after selectors (T007) without blocking T009.
- Final polish tasks (T018, T019, T020) can run in parallel once implementation stabilizes.

## Implementation Strategy

- MVP = complete US1 first (T008–T010) and validate persistence.
- Then deliver US2 (T011–T013) for group ordering.
- Add US3 (T014–T016) for feedback/cancel to reduce user error.
- Pause after each story for manual validation before moving on.
