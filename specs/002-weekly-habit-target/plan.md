# Implementation Plan: Weekly Habit Target

**Branch**: `002-weekly-habit-target` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-weekly-habit-target/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a weekly target field to habits (1-7 times per week, default 7) with dropdown UI selection and progress display on the weekly screen. Users can set and edit targets when creating/editing habits, and view their progress as fractions (e.g., "3/7") on the weekly overview.

## Technical Context

**Language/Version**: TypeScript 5.9, React Native 0.81.5 via Expo SDK 54  
**Primary Dependencies**: Expo Router 6.0, TinyBase 7.3 (local-first state), React 19.1  
**Storage**: TinyBase in-memory store with async-storage persistence, expo-sqlite for future migrations  
**Testing**: None for MVP (per constitution - tests after MVP delivery)  
**Target Platform**: iOS 15+, Android (Expo managed workflow), Web  
**Project Type**: Mobile app (cross-platform React Native + Expo)  
**Performance Goals**: 60fps UI interactions, <100ms state updates  
**Constraints**: Offline-first (local state only), mobile touch targets ≥44pt, uses Expo UI components  
**Scale/Scope**: ~50 habits per user, 365 days of check data, single-user device-local app

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Phase 0)
- ✅ MVP scope is the smallest end-to-end user path; no extra features or speculative work.
- ✅ No automated tests planned before MVP delivery unless blocking defects demand them.
- ✅ No performance or future-proofing work in MVP; defer optimizations and scalability.
- ✅ Code remains clean and readable to keep rapid changes safe.

**Status**: PASSED

### Post-Phase 1 Re-evaluation
- ✅ **Delivery First**: Design delivers smallest viable slice - add field, UI picker, display progress. No extras.
- ✅ **Scope Ruthlessly**: No speculative features added. Deferred: visual indicators, advanced analytics, week customization.
- ✅ **Clean & Readable**: Simple patterns - selector for logic, component for UI, migration for data. No abstractions.
- ✅ **Tests After MVP**: Quickstart includes manual validation checklist. No automated tests in implementation.
- ✅ **Defer Future-Proofing**: No caching, pre-aggregation, or optimization. Query on-demand, migrate once, done.

**Status**: PASSED - All constitution principles satisfied after design. Ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── _layout.tsx           # Root layout
├── index.tsx             # Home screen
├── weekly.tsx            # Weekly overview (UPDATE: add progress display)
└── habit/
    ├── [id].tsx          # Habit edit screen (UPDATE: add target dropdown)
    └── new.tsx           # New habit screen (UPDATE: add target dropdown)

src/
├── components/
│   ├── ui.tsx            # UI components (UPDATE: add WeeklyTargetPicker)
│   └── animations.tsx    # Animations
├── lib/
│   ├── dates.ts          # Date utilities
│   ├── theme.tsx         # Theme
│   └── copy.ts           # Text constants
└── store/
    ├── index.tsx         # Store provider
    ├── schema.ts         # UPDATE: Add weeklyTarget to habits table
    ├── types.ts          # UPDATE: Add weeklyTarget to HabitRow type
    ├── migrations.ts     # UPDATE: Add migration for weeklyTarget field
    ├── habits.ts         # Habit CRUD hooks
    ├── checks.ts         # Check/completion hooks
    ├── groups.ts         # Group hooks
    ├── selectors.ts      # UPDATE: Add selector for weekly progress
    ├── persister.ts      # Storage persistence
    └── id.ts             # ID generation

specs/002-weekly-habit-target/
├── plan.md              # This file
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
└── contracts/           # Phase 1 output (to be generated)
    └── schema-changes.ts
```

**Structure Decision**: Mobile app using Expo Router file-based routing. State management via TinyBase with local persistence. No backend/API - all data local to device.

## Complexity Tracking

**No violations** - All work aligns with constitution principles. No complexity justification needed.

---

## Planning Summary

### Phases Completed

✅ **Phase 0: Research** - All technical unknowns resolved:
- TinyBase schema evolution pattern identified
- Picker component selected (@react-native-picker/picker)
- Weekly progress calculation approach defined
- Migration strategy clarified
- Form state management approach determined

✅ **Phase 1: Design & Contracts** - Deliverables generated:
- `research.md` - 5 research questions answered with decisions and rationales
- `data-model.md` - Complete entity model with schema changes, validation, and data flows
- `contracts/schema-changes.ts` - TypeScript contracts for schema, types, validation, and queries
- `quickstart.md` - Step-by-step implementation guide with code examples and validation checklist
- Agent context updated (Copilot instructions)

✅ **Constitution Re-check** - Post-design validation passed all principles

### Implementation Readiness

**Files to modify**: 7 files
1. `src/store/schema.ts` - Add weeklyTarget field
2. `src/store/types.ts` - Update HabitRow type
3. `src/store/migrations.ts` - Add migration function
4. `src/store/index.tsx` - Call migration
5. `src/store/selectors.ts` - Add useWeeklyProgress selector
6. `src/lib/dates.ts` - Add week boundary utilities (if needed)
7. `src/components/ui.tsx` - Add WeeklyTargetPicker component
8. `app/habit/new.tsx` - Add picker to create form
9. `app/habit/[id].tsx` - Add picker to edit form
10. `app/weekly.tsx` - Display progress

**New dependency**: `@react-native-picker/picker`

**Estimated implementation time**: 85-115 minutes (1.5-2 hours)

### Next Steps

Run `/speckit.tasks` to generate the task breakdown for implementation tracking.
