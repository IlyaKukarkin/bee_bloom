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

### Task 6: Black Widget Screen Investigation (2026-03-10)

**Question**: Why are widgets rendering completely black even with minimal test widget?

**Finding**: CRITICAL BUG in expo-widgets + EAS Build - App Groups capability not synced to widget extension.

**Details**:
- **Issue**: [expo/expo#43677](https://github.com/expo/expo/issues/43677) - App Group capability not synced to widget extension bundle ID during EAS Build
- **Status**: Accepted by Expo team (9 hours ago as of 2026-03-10), no timeline for fix
- **Root Cause**: During `eas build`, the App Groups capability is registered for main app bundle ID but NOT for the widget extension bundle ID (`com.ilyakukarkinorg.beebloom.widgets`)
- **Symptoms**: Widget renders completely black (even minimal test widgets with no DB access)
- **Impact**: Widget extension cannot access shared SQLite database via App Groups, causing silent failures

**Workaround Steps**:
1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Find widget bundle ID: `com.ilyakukarkinorg.beebloom.widgets`
3. Enable "App Groups" capability
4. Assign group identifier: `group.com.ilyakukarkinorg.beebloom`
5. Delete widget provisioning profile: `eas credentials -p ios` (select widget target)
6. Rebuild: `eas build --platform ios --profile development --clear-cache`

**Alternative**: Wait for Expo team to fix the automatic capability syncing in future release

**Related Issue**: [expo/expo#43646](https://github.com/expo/expo/issues/43646) - ExpoWidgets.bundle JS runtime missing (closed last week, may be related)

**Decision**: Document workaround steps in quickstart.md; revisit after expo-widgets stable release

**UPDATE 2026-03-10 (Evening)**:
- Created minimal test widget with no DB/store access - still renders completely black
- User confirmed App Groups capability is ALREADY enabled and configured correctly for widget bundle ID
- This confirms issue is NOT App Groups misconfiguration (#43677)
- Root cause appears to be [expo/expo#43646](https://github.com/expo/expo/issues/43646): ExpoWidgets.bundle JS runtime not being copied into .appex
- However, PR #43654 (proposed fix) is under review - Expo maintainer cannot reproduce the issue
- Issue may be specific to EAS Build vs local `npx expo run:ios` builds
- Issue may be specific to certain project configurations

**Tested Configuration**:
- `expo-widgets ~55.0.3`
- Building via EAS Build with development profile
- App Groups correctly configured in Apple Developer Portal
- Both main app and widget extension have matching group identifier
- Widget directive `'widget'` present in component
- Issue persists even with minimal test widget (no database, no complex logic)

**Decision**: Wait for Expo team to resolve. Issue is acknowledged but reproduction is inconsistent across different environments.

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
