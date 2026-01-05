# Implementation Plan: Habit and Group Reordering

**Branch**: `[001-reorder-habits-groups]` | **Date**: January 5, 2026 | **Spec**: [specs/001-reorder-habits-groups/spec.md](specs/001-reorder-habits-groups/spec.md)
**Input**: Feature specification from `/specs/001-reorder-habits-groups/spec.md`

**Note**: This plan follows the `/speckit.plan` workflow. Tasks for implementation belong in `tasks.md` (Phase 2, not covered here).

## Summary

Enable press-and-hold drag-and-drop to reorder habits within and across groups, and reorder HabitGroups themselves in a group-only mode. Persist ordering locally via Tinybase with Expo SQLite/AsyncStorage. Implement drag UX using Expo-friendly gesture + animation stack (gesture-handler/reanimated) with a lightweight draggable list helper for clear placeholders, auto-scroll, and cancel-on-drop-outside behavior.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9, React 19, React Native 0.81 (Expo SDK 54)
**Primary Dependencies**: Expo Router, Tinybase, Expo SQLite, AsyncStorage, gesture-handler/reanimated stack; plan to add a minimal draggable list helper for RN/Expo
**Storage**: Tinybase persisted to Expo SQLite on native, local storage on web (per `useAndStartPersister`)
**Testing**: Automated tests deferred per constitution; manual validation for MVP flows only
**Target Platform**: Expo mobile (iOS/Android) with Expo web compatibility
**Project Type**: Mobile app (Expo Router, app/ directory)
**Performance Goals**: None for MVP; keep drag interactions responsive and avoid jank (aim 60fps without formal SLA)
**Constraints**: Offline-first local persistence; avoid heavy deps; keep schema simple and readable; preserve existing data
**Scale/Scope**: Single-user local dataset (tens–hundreds of habits, low-thousands of checks); no multi-user sync

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- MVP scope: Reorder habits and groups only (no new analytics, sharing, or perf work).
- Tests: No automated tests planned pre-MVP; manual checks only unless blocking defects arise.
- Perf/future-proofing: No optimization work beyond keeping drag interactions smooth; defer hardening.
- Code quality: Keep changes small/clear in store, UI components, and persistence.
- Status: PASS

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
app/
├── _layout.tsx
├── index.tsx
├── weekly.tsx
└── habit/
  ├── [id].tsx
  └── new.tsx

src/
├── components/
├── lib/
├── store/
├── selectors.ts
└── theme.tsx

assets/
docs/
specs/
```

**Structure Decision**: Expo Router app with feature pages in `app/`; shared logic/components in `src/`; persistence and store schema in `src/store/`; feature docs live in `specs/001-reorder-habits-groups/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Phase 0 – Research Plan (output: research.md)

- Topics: drag-and-drop approach for Expo RN; data model for ordered habits and groups; persistence/migration with Tinybase + Expo SQLite/AsyncStorage; UX safeguards (cancel, placeholders, auto-scroll).
- Method: review Expo-friendly draggable list options vs custom gesture/reanimated; align schema and migration steps; define offline-safe ordering strategy.
- Exit: `research.md` with decisions, rationale, and alternatives.

## Phase 1 – Design & Contracts (outputs: data-model.md, contracts/, quickstart.md)

- Data model: add explicit HabitGroup entity with order; add `order` to habits; define migration defaults from existing data.
- Contracts: document local API/service interfaces for reorder and persistence (OpenAPI-style) in `contracts/`.
- Quickstart: implementation steps to enable UI + persistence + migration and manual test checklist.
- Agent context: run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` after docs to record new tech choices.

## Post-Design Constitution Check

- Confirm scope remains limited to reorder UI + persistence; no tests added pre-MVP; no perf work beyond smooth drag UX.
- Status: PASS (design stays within MVP constraints and defers tests/perf hardening).
