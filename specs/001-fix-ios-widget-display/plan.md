# Implementation Plan: iOS Widget Display Recovery

**Branch**: `001-fix-ios-widget-display` | **Date**: 2026-03-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-fix-ios-widget-display/spec.md`

## Summary

Fix iOS home screen widget rendering black/empty state by adding missing `'widget'` directive and ensuring proper data flow. The primary technical issue is that the widget component lacks the required `'widget'` directive introduced in expo-widgets alpha API. Secondary improvements include verifying proper App Groups data sharing and implementing size-responsive layouts matching clarified requirements (4/4/8 habits for small/medium/large).

## Technical Context

**Language/Version**: TypeScript 5.x with React Native, Expo SDK 55  
**Primary Dependencies**: expo-widgets ~55.0.3, @expo/ui/swift-ui, tinybase, expo-sqlite  
**Storage**: SQLite database shared via iOS App Groups (group.com.ilyakukarkinorg.beebloom)  
**Testing**: Manual device testing (automated tests deferred per constitution)  
**Target Platform**: iOS 15+ (systemSmall, systemMedium, systemLarge widget families)  
**Project Type**: Mobile (Expo managed workflow with native widgets extension)  
**Performance Goals**: Widget renders within 5 seconds of placement; updates within 15 minutes  
**Constraints**: App Groups entitlement required; widget size limits (4/4/8 habits); iOS WidgetKit refresh budget  
**Scale/Scope**: Single widget with 3 size variants; ~10 active habits typical user load

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ MVP scope is the smallest end-to-end user path: Add `'widget'` directive + verify rendering for all 3 sizes
- ✅ No automated tests planned before MVP delivery; manual device testing only
- ✅ No performance work beyond spec requirements (5s render, 15min update acceptable)
- ✅ Code remains clean: Single-line directive fix + layout adjustments only; no architectural changes

**Status**: PASS - All constitution principles satisfied. This is a focused bug fix with minimal scope.

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
app/                          # Expo Router app directory
├── _layout.tsx
├── index.tsx
├── weekly.tsx
└── habit/
    ├── [id].tsx
    └── new.tsx

widgets/
└── HabitWidget.tsx          # MODIFIED: Add 'widget' directive, update capacity constants

src/
├── components/
│   ├── animations.tsx
│   └── ui.tsx
├── lib/
│   ├── copy.ts
│   ├── dates.ts
│   └── theme.tsx
└── store/
    ├── checks.ts
    ├── groups.ts
    ├── habits.ts
    ├── id.ts
    ├── index.tsx
    ├── migrations.ts
    ├── persister.ts
    ├── schema.ts
    ├── selectors.ts
    ├── types.ts
    └── widget-bridge.ts     # MODIFIED: Update WIDGET_CAPACITY constants

app.json                      # Expo configuration (widget already configured)
```

**Structure Decision**: Mobile app with native iOS widget extension. The widget (widgets/HabitWidget.tsx) reads data directly from shared SQLite via App Groups. No new files required - only modifications to existing widget implementation and capacity constants.

## Phase 0: Research & API Migration Analysis

### Expo Widgets API Changes (expo-widgets ~55.0.3)

**Critical Breaking Change Identified:**

The current implementation is missing the required `'widget'` directive as the first line of the widget component. This is likely the root cause of the black/empty widget rendering.

**Current (Broken):**
```tsx
const HabitWidget = (props: WidgetBase) => {
  const storeInstance = getWidgetStore();  // ❌ Missing directive
  // ...
```

**Required (Per Latest Docs):**
```tsx
const HabitWidget = (props: WidgetBase) => {
  'widget';  // ✅ Required directive
  const storeInstance = getWidgetStore();
  // ...
```

**Other API Aspects Verified:**
- ✅ `createWidget("HabitWidget", HabitWidget)` usage is correct
- ✅ `updateTimeline()` method signature unchanged
- ✅ `WidgetBase` type still valid
- ✅ Timeline entry structure `{ date, props }` unchanged
- ✅ Widget families (systemSmall/Medium/Large) unchanged
- ✅ App Groups configuration approach unchanged

**Decision:** Add `'widget'` directive as first line in HabitWidget component. No other API migration required.

### Habit Capacity Requirements (From Spec Clarifications)

**Current Implementation:**
```tsx
export const WIDGET_CAPACITY: Record<WidgetSize, number> = {
  small: 3,   // ❌ Spec requires 4
  medium: 6,  // ❌ Spec requires 4
  large: 10,  // ❌ Spec requires 8
};
```

**Required (Per Spec):**
```tsx
export const WIDGET_CAPACITY: Record<WidgetSize, number> = {
  small: 4,   // ✅ Up to 4 habits with name + status
  medium: 4,  // ✅ Up to 4 habits with name + status + weekly progress
  large: 8,   // ✅ Up to 8 habits with name + status + weekly progress
};
```

**Decision:** Update capacity constants to match spec requirements.

### Weekly Target Progress Integration

**Current State:** Widget displays habit name and completion status only.

**Required (Per Spec):** 
- Small: habit name + today's completion status ✅ (already implemented)
- Medium/Large: habit name + today's completion status + weekly target progress ⚠️ (needs addition)

**Data Availability Check:**
- Weekly target data exists in `HabitRow.weeklyTarget` (number | null)
- Check completion count calculation needs to be added to `getWidgetViewState`

**Decision:** Extend `HabitWidgetItem` type and `getWidgetViewState` to include weekly progress for medium/large widgets.

### App Groups & Shared Data Verification

**Configuration Status:**
- ✅ app.json has `groupIdentifier: "group.com.ilyakukarkinorg.beebloom"`
- ✅ widget-bridge.ts uses `Paths.appleSharedContainers["group.com.ilyakukarkinorg.beebloom"]`
- ⚠️ Apple Developer Console: User confirmed App Groups capability was added after previous build failure

**Decision:** No code changes needed; entitlement issue resolved externally.

### Empty State & Error Handling

**Current Implementation:**
```tsx
if (!isLoaded) {
  return <Text>Loading habits…</Text>;
}
if (!hasHabits) {
  return <Text>Add your first habit in BeeBloom</Text>;
}
if (allComplete) {
  return <Text>All habits completed today! 🌸</Text>;
}
```

**Spec Requirements:**
- ✅ Empty state message is clear and actionable
- ✅ Loading state prevents blank rendering during data fetch
- ✅ All-complete state provides positive feedback

**Decision:** Current empty state handling is sufficient; no changes needed.

## Phase 1: Design & Contracts

### Data Model

Created [data-model.md](data-model.md) documenting:

**Entities:**
- `HabitWidgetItem` (extended with optional `weeklyProgress` field)
- `WidgetViewState` (unchanged)

**Key Design Decisions:**
1. **Weekly Progress Calculation**: Count distinct check dates within current week range
2. **Week Boundaries**: Sunday 00:00 to Saturday 23:59 (iOS calendar convention)
3. **Overflow Handling**: Display "+N more" when incomplete habits exceed widget capacity
4. **Null Target Handling**: Omit weeklyProgress field when `HabitRow.weeklyTarget` is null

**Data Flow:**
- Widget reads SQLite directly via App Groups (no props passing)
- Timeline entries contain only dates (props always empty object)
- Weekly data calculated on-demand in `getWidgetViewState()`

### Contracts

Created [contracts/widget-types.ts](contracts/widget-types.ts) defining:

**Type Contracts:**
- `WidgetSize` - Internal size categories
- `WeeklyProgress` - Weekly tracking structure
- `HabitWidgetItem` - Extended habit display data
- `WidgetViewState` - Aggregate widget state
- `WidgetStore` - Store instance interface
- `WidgetKitFamily` - iOS family name mapping
- `WidgetBase` - Expo widgets props interface
- `Widget` - Widget instance interface

**Function Signatures:**
- `getWidgetSizeFromFamily(family: WidgetKitFamily): WidgetSize`
- `buildTimelineDates(now?: Date): Date[]`
- `createWidget<T>(name, component): Widget<T>`

**Constants:**
- `WIDGET_CAPACITY` - Updated to `{ small: 4, medium: 4, large: 8 }`

### Quickstart Guide

Created [quickstart.md](quickstart.md) with:

**Setup Instructions:**
1. Dependency verification (`expo-widgets@~55.0.3`)
2. App Groups capability setup (Apple Developer Console)
3. Build & install steps

**Test Cases:**
- Test Case 1: Widget Renders (P1) - Core display functionality
- Test Case 2: Empty State Display (P2) - No habits scenario
- Test Case 3: Widget Updates After Habit Change (P3) - Data refresh
- Test Case 4: Complete Habit from Widget - Interactive tap behavior
- Test Case 5: Overflow Indicator - Capacity limit handling

**Debugging Guide:**
- Black screen ? Missing `'widget'` directive
- Stale data ? App Groups misconfiguration
- Missing weekly progress ? Widget size or null weeklyTarget

**File Changes Summary:**
- 2 files modified (`widgets/HabitWidget.tsx`, `src/store/widget-bridge.ts`)
- ~40 total lines of code

### Agent Context Update

Running agent context update script:

```powershell
.\.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
```

**Technologies Added:**
- expo-widgets ~55.0.3 (`'widget'` directive requirement)
- iOS WidgetKit (systemSmall/Medium/Large families)
- App Groups shared data (SQLite via Expo File System)
- TinyBase widget store pattern

**Agent Context File:** `.github/copilot-instructions.md` (or equivalent)

## Constitution Re-Check (Post-Design)

*GATE: Verify no scope creep occurred during design phase.*

- ? **MVP Scope Maintained**: Only 2 files modified, ~40 lines total
- ? **No Test Automation**: Manual device testing only, documented in quickstart
- ? **No Performance Work**: Accepts iOS WidgetKit refresh constraints as-is
- ? **Complexity Bounded**: No new abstractions; extends existing patterns only

**Violations**: NONE

**Status**: PASS - Design phase remained faithful to MVP-first constitution. Ready for tasks generation.

## Next Steps

This plan document is complete. Proceed with:

```bash
# Generate implementation tasks
/speckit.tasks

# Or review/clarify before tasks
/speckit.clarify  # Optional if ambiguities remain
```

**End of Planning Phase** | **Ready for Implementation** ?
