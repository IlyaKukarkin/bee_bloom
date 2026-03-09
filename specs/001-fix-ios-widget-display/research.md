# Research: iOS Widget Display Recovery

**Feature**: 001-fix-ios-widget-display  
**Date**: 2026-03-09  
**Status**: Complete

## Research Tasks

### Task 1: Expo Widgets API Migration (Critical)

**Question**: Has the expo-widgets API changed since the widget was initially implemented?

**Finding**: YES - Critical breaking change identified.

**Details**:
- **Version**: expo-widgets ~55.0.3 (alpha)
- **Breaking Change**: Widget components now REQUIRE a `'widget'` directive as the first line
- **Current Code**: Missing the directive, likely causing black/empty rendering
- **Fix**: Add `'widget';` as first line in HabitWidget component

**Evidence**: 
- Latest docs (provided DOC.MD) show all widget examples begin with `'widget'` directive
- Current implementation lacks this directive
- Timeline/type usage otherwise matches current API

**Decision**: Add missing `'widget'` directive - single line fix with high impact

---

### Task 2: Widget Size Capacity Requirements

**Question**: What are the correct capacity limits for each widget size per spec clarifications?

**Finding**: Current implementation uses wrong capacity constants.

**Details**:
- **Current**: small=3, medium=6, large=10
- **Required**: small=4, medium=4, large=8
- **Rationale**: Spec clarifications defined exact user requirements for habit display counts

**Decision**: Update WIDGET_CAPACITY constants in widget-bridge.ts

---

### Task 3: Weekly Target Progress Display

**Question**: How should weekly progress data be calculated and displayed for medium/large widgets?

**Finding**: Data exists in schema; calculation logic needs to be added.

**Details**:
- **Data Source**: `HabitRow.weeklyTarget` field (number | null) in SQLite schema
- **Calculation**: Count checks for current week, compare to weeklyTarget
- **Display**: Show as "X/Y this week" where X=completed, Y=target
- **Widget Sizes**: Medium and Large only (Small shows name + status only)

**Best Practice**: Use existing date utilities (todayKey, week calculation) from lib/dates.ts

**Decision**: 
1. Extend `HabitWidgetItem` type with optional `weeklyProgress?: { completed: number; target: number }`
2. Add calculation in `getWidgetViewState` for medium/large sizes
3. Conditionally render progress text in widget layout

---

### Task 4: App Groups Data Sharing Verification

**Question**: Is the App Groups configuration correct for SQLite sharing?

**Finding**: Configuration is correct; external entitlement issue resolved.

**Details**:
- **Group ID**: `group.com.ilyakukarkinorg.beebloom` (consistent across app.json and code)
- **Path Resolution**: `Paths.appleSharedContainers["group.com.ilyakukarkinorg.beebloom"]?.uri`
- **Database Name**: `beebloom.db`
- **User Action**: Confirmed App Groups capability added in Apple Developer Console

**Decision**: No code changes needed; entitlement configuration handled externally

---

### Task 5: Empty State & Loading State Patterns

**Question**: Are current empty/error states sufficient per spec requirements?

**Finding**: Current implementation meets all spec empty state requirements.

**Details**:
- **Loading State**: Shows "Loading habits…" during store initialization ✅
- **No Habits**: Shows "Add your first habit in BeeBloom" with clear call-to-action ✅
- **All Complete**: Shows positive feedback "All habits completed today! 🌸" ✅
- **Error Handling**: refreshWidgetTimeline has retry logic with MAX_RETRIES=3 ✅

**Decision**: No changes needed; existing patterns are sufficient for MVP

---

## Summary of Decisions

| Area | Change Required | Scope |
|------|----------------|-------|
| Widget Directive | ✅ Add `'widget'` as first line | 1 line (critical fix) |
| Capacity Constants | ✅ Update to 4/4/8 | 3 lines |
| Weekly Progress Data | ✅ Add calculation + display | ~30 lines |
| App Groups Config | ❌ No change | External entitlement |
| Empty States | ❌ No change | Already compliant |

**Total Estimated Changes**: ~35 lines of code across 2 files

**Risk Assessment**: LOW - Changes are isolated, well-defined, and testable on device
