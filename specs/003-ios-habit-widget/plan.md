# Implementation Plan: iOS Home Screen Widget for Habit Tracking

**Branch**: `003-ios-habit-widget` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ios-habit-widget/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add iOS home screen widget that displays today's incomplete habits (2-3 for small, 4-6 for medium, 8-10 for large widget sizes). Users can complete habits by tapping them directly in the widget. The widget uses expo-widgets package with shared Tinybase storage for offline-first data synchronization between widget and main app.

## Technical Context

**Language/Version**: TypeScript 5.9, React Native 0.81, Expo SDK 54  
**Primary Dependencies**: expo-widgets (widget support), Tinybase (shared state), expo-sqlite (persistence), React 19.1  
**Storage**: Tinybase with expo-sqlite persister (shared via App Group between widget and main app)  
**Testing**: Biome linter (no automated tests per constitution - MVP first)  
**Target Platform**: iOS 14+ (WidgetKit support required)  
**Project Type**: Mobile (React Native/Expo)  
**Performance Goals**: Widget update <5 seconds from app change, tap-to-complete <3 seconds  
**Constraints**: Offline-capable (no network), widget memory limits, timeline refresh budget  
**Scale/Scope**: Single user, local device only, <100 habits typical, 3 widget size variants

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-Phase 0 Check**: ✅ PASSED

- ✅ MVP scope is the smallest end-to-end user path; no extra features or speculative work.
  - Building only the 3 standard widget sizes with tap-to-complete and basic display
  - No widget configuration, no lock screen widgets, no animations beyond defaults
- ✅ No automated tests planned before MVP delivery unless blocking defects demand them.
  - Will use manual testing with device and simulator
  - Lint checks only via existing Biome setup
- ✅ No performance or future-proofing work in MVP; defer optimizations and scalability.
  - Using standard WidgetKit timeline mechanism without custom optimization
  - Accepting 5-second update latency as specified in requirements
- ✅ Code remains clean and readable to keep rapid changes safe.
  - Widget component follows same patterns as existing React Native components
  - Shared storage logic reuses existing Tinybase store structure

**Post-Phase 1 Check**: ✅ PASSED

- ✅ Design maintains MVP focus: Single widget type, 3 sizes, tap-to-complete only. No extra features added.
- ✅ No test infrastructure added: Relies on manual testing and existing Biome linter.
- ✅ No performance abstractions: Direct WidgetKit timeline API usage, simple query functions, no caching layer.
- ✅ Clean structure: Widget bridge module has clear single responsibility, widget component uses declarative SwiftUI-style rendering.
- ✅ Data model reuses existing schema: No new database tables, leverages current habits/checks/groups structure.

## Project Structure

### Documentation (this feature)

```text
specs/003-ios-habit-widget/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── widget-props.ts  # TypeScript interface for widget data contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
widgets/
└── HabitWidget.tsx      # Main widget component with size-responsive rendering

src/
├── store/
│   └── widget-bridge.ts # New: Bridge to share Tinybase data with widget extension
├── components/
└── lib/

app.json                 # Updated: Add expo-widgets plugin configuration
package.json            # Updated: Add expo-widgets dependency
```

**Structure Decision**: Mobile app structure with new `widgets/` directory at root for widget extension code. The widget shares data through App Group storage (configured via expo-widgets plugin), accessing the same Tinybase/SQLite database as the main app. Widget components use expo-widgets' SwiftUI bridge API rather than React Native components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles are followed for this MVP widget implementation.

---

## Phase Summary

### Phase 0: Research ✅ COMPLETE

**Deliverable**: [research.md](./research.md)

**Decisions Made**:
1. **Widget Framework**: expo-widgets with WidgetKit bridge (native iOS support without ejecting)
2. **Data Sharing**: iOS App Group with shared Tinybase SQLite database
3. **Update Strategy**: WidgetKit timeline with 15-minute refresh intervals
4. **Widget Sizes**: systemSmall, systemMedium, systemLarge (3 standard sizes)
5. **Interactions**: Background widget writes for completion; deep link only for open-app when no incomplete habits

**Alternatives Rejected**: Bare React Native (too complex), PWA widgets (iOS unsupported), separate widget database (sync complexity)

**Risks Identified**: Widget performance on large lists, sync timing, App Group configuration issues

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- [data-model.md](./data-model.md) - Widget view models and state management
- [contracts/widget-props.ts](./contracts/widget-props.ts) - TypeScript interfaces for widget data
- [quickstart.md](./quickstart.md) - Developer setup and testing guide
- [.github/agents/copilot-instructions.md](../../.github/agents/copilot-instructions.md) - Updated with expo-widgets context

**Key Data Structures**:
- `HabitWidgetItem`: View model for single habit display
- `WidgetViewState`: Complete state snapshot for rendering
- `WidgetSize`: Size variant with display capacity
- `WidgetDeepLinks`: URL schemes for interactions

**Integration Points**:
- Widget reads from shared Tinybase store (App Group container)
- Widget writes completions directly to shared store (background, no app launch)
- Main app handles deep link URL only for "open app" action when no incomplete habits
- Timeline refresh triggered when widget writes data or app modifies data

**No Schema Changes**: Widget reuses existing habits, checks, habitGroups tables

---

### Phase 2: Task Breakdown (Next Step)

**Command**: `/speckit.tasks`

**Expected Output**: tasks.md with development tasks organized by component

**Task Categories**:
1. Package installation and configuration (app.json, package.json)
2. Widget bridge module implementation (src/store/widget-bridge.ts)
3. Widget component development with background writes (widgets/HabitWidget.tsx)
4. App Group shared storage verification (read/write permissions)
5. Deep link configuration for open-app action (optional)
6. Testing and validation (manual test scenarios)
7. Documentation and code quality (lint, comments)

**Estimated Effort**: ~6-8 hours total development time

---

## Implementation Readiness

✅ **Ready for `/speckit.tasks`**

All planning phases complete:
- ✅ Technical unknowns resolved (research.md)
- ✅ Data model designed (data-model.md)
- ✅ Contracts defined (widget-props.ts)
- ✅ Developer guide created (quickstart.md)
- ✅ Agent context updated (copilot-instructions.md)
- ✅ Constitution compliance verified (no violations)

**Next Action**: Run `/speckit.tasks` to generate task breakdown for implementation.
