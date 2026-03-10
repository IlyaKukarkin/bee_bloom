# Quickstart: iOS Widget Display Recovery

**Feature**: 001-fix-ios-widget-display  
**Last Updated**: 2026-03-09

## Prerequisites

- Expo CLI installed
- Development build with expo-widgets
- iOS device or simulator running iOS 15+
- Apple Developer account with App Groups capability enabled

## Setup

### 1. Verify Dependencies

```bash
# Check expo-widgets version
npx expo install expo-widgets@~55.0.3

# Verify app.json configuration
# Should have:
# - groupIdentifier: "group.com.ilyakukarkinorg.beebloom"
# - bundleIdentifier: "com.ilyakukarkinorg.beebloom.widgets"
# - widgets array with HabitWidget configured
```

### 2. Enable App Groups (Apple Developer Console)

1. Go to https://developer.apple.com/account
2. Navigate to Certificates, Identifiers & Profiles → Identifiers
3. Select `com.ilyakukarkinorg.beebloom` (main app)
   - Enable **App Groups** capability
   - Add group: `group.com.ilyakukarkinorg.beebloom`
   - Save
4. Select `com.ilyakukarkinorg.beebloom.widgets` (widget extension)
   - Enable **App Groups** capability  
   - Add same group: `group.com.ilyakukarkinorg.beebloom`
   - Save
5. Delete existing provisioning profiles to force regeneration

### 3. Build & Install

```bash
# Build development client (if not already built)
eas build --platform ios --profile development

# Or rebuild with cleared cache
eas build --platform ios --profile development --clear-cache

# Install on device via TestFlight or direct install
```

## Testing Widget Display

### Test Case 1: Widget Renders (P1)

**Pre-condition**: At least one active habit exists in main app

**Steps**:
1. Open main app, create a habit if none exist
2. Go to iOS home screen
3. Long-press to enter jiggle mode
4. Tap "+" button (top-left)
5. Search for "BeeBloom"
6. Select "BeeBloom Habits" widget
7. Choose widget size (Small, Medium, or Large)
8. Tap "Add Widget"

**Expected Result**:
- ✅ Widget displays habit name(s) immediately (within 5 seconds)
- ✅ Widget shows visible text and colors (not black/empty)
- ✅ Small: Up to 4 habits with completion buttons
- ✅ Medium: Up to 4 habits with weekly progress (e.g., "2/5 this week")
- ✅ Large: Up to 8 habits with weekly progress

**Actual Result**: _[Fill during testing]_

---

### Test Case 2: Empty State Display (P2)

**Pre-condition**: No active habits in main app

**Steps**:
1. Open main app, delete/archive all habits
2. Return to home screen where widget is placed

**Expected Result**:
- ✅ Widget shows message: "Add your first habit in BeeBloom"
- ✅ Widget is not black or blank

**Actual Result**: _[Fill during testing]_

---

### Test Case 3: Widget Updates After Habit Change (P3)

**Pre-condition**: Widget is placed and displaying habits

**Steps**:
1. Open main app
2. Create a new habit or modify existing habit name
3. Wait up to 15 minutes
4. Check widget on home screen

**Expected Result**:
- ✅ Widget reflects updated habit data
- ✅ Widget remains readable (not black/empty)

**Actual Result**: _[Fill during testing]_

---

### Test Case 4: Complete Habit from Widget

**Pre-condition**: Widget displays incomplete habit(s)

**Steps**:
1. Tap a habit button in the widget
2. Observe UI change

**Expected Result**:
- ✅ Habit disappears from widget (marked complete)
- ✅ If all habits complete, widget shows "All habits completed today! 🌸"

**Actual Result**: _[Fill during testing]_

---

### Test Case 5: Overflow Indicator

**Pre-condition**: More than capacity limit of active incomplete habits

**Steps**:
1. Create 10+ active habits in main app
2. Check Small widget (capacity: 4)

**Expected Result**:
- ✅ Widget shows first 4 habits (by user-defined order)
- ✅ Widget shows "+6 more" (or appropriate count) at bottom

**Actual Result**: _[Fill during testing]_

---

## Debugging

### Widget Shows Black Screen

**⚠️ CRITICAL BUG (2026-03-10)**: EAS Build does not automatically sync App Groups capability to widget extension bundle ID.

**Primary Cause**: [expo/expo#43677](https://github.com/expo/expo/issues/43677) - App Groups not configured on widget extension

**Manual Workaround**:
1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Find identifier: `com.ilyakukarkinorg.beebloom.widgets` (widget extension)
3. Edit → Enable "App Groups" capability
4. Add group: `group.com.ilyakukarkinorg.beebloom` (same as main app)
5. Save changes
6. Delete widget provisioning profiles:
   ```bash
   eas credentials -p ios
   # Select widget target → Delete provisioning profile
   ```
7. Rebuild:
   ```bash
   eas build --platform ios --profile development --clear-cache
   ```

**Status**: Bug reported but under investigation. Expo team unable to reproduce consistently.

**UPDATE 2026-03-10**: Testing confirmed black widgets persist even with minimal test widget (no database access), and App Groups IS correctly configured. Root cause appears to be [expo/expo#43646](https://github.com/expo/expo/issues/43646) - JS runtime bundle not copied to .appex. Proposed fix in [PR #43654](https://github.com/expo/expo/pull/43654) is under review but maintainer cannot reproduce the issue. Waiting for Expo team resolution.

---

**Secondary Cause**: Missing `'widget'` directive in HabitWidget component

**Fix**:
1. Open `widgets/HabitWidget.tsx`
2. Ensure first line inside component is `'widget';`
3. Rebuild app with `eas build --clear-cache`

**Verification**:
```tsx
const HabitWidget = (props: WidgetBase) => {
  'widget';  // ← MUST be first line
  // rest of code...
```

---

### Widget Shows Stale Data

**Likely Cause**: Timeline not refreshing or App Groups misconfigured

**Debug Steps**:
1. Check App Groups entitlement in Apple Developer Console
2. Verify both app AND widget extension have same group ID
3. Delete provisioning profiles and rebuild
4. Check logs for SQLite errors: `Paths.appleSharedContainers` should not be undefined

---

### Weekly Progress Not Showing

**Likely Cause**: Widget size is Small (only Medium/Large show weekly data)

**Verification**:
1. Add Medium or Large widget
2. Ensure habit has `weeklyTarget` set (not null)
3. Verify at least some checks exist this week

---

## File Changes Summary

For implementation reference:

| File | Change | Lines |
|------|--------|-------|
| `widgets/HabitWidget.tsx` | Add `'widget'` directive | 1 |
| `widgets/HabitWidget.tsx` | Render weekly progress for medium/large | ~15 |
| `src/store/widget-bridge.ts` | Update WIDGET_CAPACITY | 3 |
| `src/store/widget-bridge.ts` | Add weekly calculation to getWidgetViewState | ~20 |
| `src/store/widget-bridge.ts` | Extend HabitWidgetItem type | 1 |

**Total**: ~40 lines across 2 files

---

## Known Issues & Blockers

### Black Widget Rendering (2026-03-10)

**Status**: ⏸️ BLOCKED - Waiting for Expo team to resolve

**Symptoms**:
- All widgets render completely black on iOS home screen
- Issue affects both simple test widgets and complex widgets
- Widgets are clickable but show no visual content
- Persists across rebuilds and reinstalls

**Root Cause Analysis**:
1. **Initial Hypothesis**: Missing `'widget'` directive
   - ✅ RESOLVED: Added directive, issue persists
   
2. **Secondary Hypothesis**: App Groups misconfiguration ([#43677](https://github.com/expo/expo/issues/43677))
   - ✅ VERIFIED: App Groups correctly configured in Apple Developer Portal
   - ✅ VERIFIED: Both main app and widget extension have matching group ID
   - ❌ NOT THE CAUSE: Issue persists with correct configuration

3. **Current Leading Theory**: JS Runtime Bundle Missing ([#43646](https://github.com/expo/expo/issues/43646))
   - ExpoWidgets.bundle not being copied into widget extension (.appex)
   - Proposed fix in [PR #43654](https://github.com/expo/expo/pull/43654)
   - **CAVEAT**: Expo maintainer (jakex7) cannot reproduce the issue
   - May be specific to EAS Build workflow vs local builds
   - May be configuration-specific

**Environment Details**:
```
expo-widgets: ~55.0.3
expo: ~55.0.5
Build Method: EAS Build (development profile)
Platform: iOS
TestFlight: Yes
```

**Testing Performed**:
- ✅ Created minimal test widget (no DB, no store, just text) - still black
- ✅ Verified `'widget'` directive present as first line
- ✅ Confirmed App Groups capability enabled on both bundle IDs
- ✅ Verified group identifier matches exactly: `group.com.ilyakukarkinorg.beebloom`
- ✅ Rebuilt with `--clear-cache` multiple times

**Next Steps**:
1. Wait for Expo team to investigate and resolve
2. Monitor PR #43654 for merge status
3. Try local build (`npx expo run:ios`) to compare with EAS build
4. Consider testing with expo-widgets 55.0.4+ when released

**Workaround**: None currently - feature blocked until resolved

**Related Files**:
- [TestWidget.tsx](widgets/TestWidget.tsx) - Minimal test widget for debugging
- [HabitWidget.tsx](widgets/HabitWidget.tsx) - Production widget (also affected)
