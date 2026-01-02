# Implementation Plan: BeeBloom Gentle Habit MVP

**Branch**: `001-gentle-habit-mvp` | **Date**: 2026-01-02 | **Spec**: [specs/001-gentle-habit-mvp/spec.md](specs/001-gentle-habit-mvp/spec.md)
**Input**: Feature specification from `/specs/001-gentle-habit-mvp/spec.md`

**Note**: This plan follows MVP-first constitution (delivery first, no pre-MVP tests, no perf/future-proofing).

## Summary

Build a gentle, offline-first habit tracker (Today + weekly views) for iOS and Android using Expo with TypeScript, Tinybase for local data, and Expo UI for components. No auth, no notifications, no cloud sync; optional OS backup only. Users can create/edit/delete habits, group by color/name, and toggle a single checkmark per day with previous-day backfill only.

## Technical Context

**Language/Version**: TypeScript (Expo React Native)
**Primary Dependencies**: Expo runtime, Expo UI (`@expo/ui`), React Navigation/Expo Router, Tinybase (+ AsyncStorage persister), Expo FileSystem/Storage APIs as needed
**Storage**: Tinybase tables persisted to AsyncStorage; optional OS backup via platform backup mechanisms (no custom sync)
**Testing**: Deferred until post-MVP per constitution (manual flows only)
**Target Platform**: iOS and Android (offline-first, local-only)
**Project Type**: Mobile app (Expo)
**Performance Goals**: None for MVP (focus on responsiveness/UX feel only)
**Constraints**: Offline-first; no auth; no notifications; no cloud sync; gentle animations/copy; previous-day-only backfill
**Scale/Scope**: Single-user, single-device local data; small habit lists and 7-day view

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- MVP scope is the smallest end-to-end user path; no extra features or speculative work.
- No automated tests planned before MVP delivery unless blocking defects demand them.
- No performance or future-proofing work in MVP; defer optimizations and scalability.
- Code remains clean and readable to keep rapid changes safe.

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/                     # Expo Router screens (Today, Weekly, Habit detail/create)
src/
  components/            # Shared UI blocks using Expo UI
  lib/                   # Theme, copy, animation helpers
  store/                 # Tinybase setup, schemas, persistence helpers
  hooks/                 # UI/data hooks (e.g., useTodayHabits)
assets/                  # Icons, illustrations

# No automated tests in MVP per constitution
```

**Structure Decision**: Single Expo mobile project with Router screens under `app/` and shared logic under `src/`; no separate backend or web app; data/local store only.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
