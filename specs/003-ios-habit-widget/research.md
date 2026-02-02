# Research: iOS Home Screen Widget for Habit Tracking

**Feature**: iOS Widget MVP  
**Date**: 2026-02-02  
**Status**: Complete

## Overview

This document captures research decisions for implementing iOS home screen widgets using the expo-widgets package in an Expo/React Native application. The research resolves all technical unknowns from the Technical Context section of the implementation plan.

## Technology Stack Decisions

### Decision 1: Widget Framework - expo-widgets

**Chosen**: expo-widgets package with WidgetKit bridge

**Rationale**:
- Native iOS widget support through WidgetKit without ejecting from Expo managed workflow
- Provides TypeScript/React-like API for SwiftUI widget composition
- Handles widget extension target configuration automatically via Expo plugin
- Supports App Group for data sharing between main app and widget extension
- Maintains offline-first capability consistent with existing app architecture

**Alternatives Considered**:
- Bare React Native with native WidgetKit code: Rejected due to loss of Expo managed workflow benefits and increased native code complexity
- react-native-widget-extension: Rejected due to less active maintenance and no Expo integration
- Progressive Web App widgets: Rejected as iOS requires native WidgetKit for home screen widgets

**Implementation Notes**:
- Install: `npx expo install expo-widgets`
- Widget code lives in `/widgets/` directory at project root
- Widget extension runs separately from main app with shared storage via App Group
- Uses SwiftUI components via `@expo/ui/swift-ui` rather than React Native components

### Decision 2: Data Sharing - App Group with Tinybase

**Chosen**: iOS App Group with shared SQLite database accessed by Tinybase

**Rationale**:
- App Groups are the standard iOS mechanism for sharing data between app and extensions
- Existing Tinybase store with expo-sqlite persister can be reused by configuring shared container path
- No data duplication or synchronization logic needed
- Maintains single source of truth for habit data
- Preserves offline-first architecture

**Alternatives Considered**:
- UserDefaults for App Group: Rejected due to size limits (habits data can grow) and poor structure for relational data
- Separate widget database with sync: Rejected as it violates MVP simplicity and introduces sync complexity
- In-memory only widget data: Rejected as it won't survive widget reloads and violates offline-first principle

**Implementation Notes**:
- Configure App Group ID: `group.com.ilyakukarkinorg.beebloom` (matches main bundle identifier pattern)
- Widget accesses same SQLite file path within App Group container
- Main app and widget both use Tinybase with same schema
- No write conflicts expected (widget only reads, app writes; widget writes only check completions)

### Decision 3: Widget Update Strategy - Timeline with Background Refresh

**Chosen**: WidgetKit timeline-based updates with 15-minute minimum refresh interval

**Rationale**:
- WidgetKit timeline is the standard iOS widget update mechanism
- Background refresh budget allows periodic updates without user interaction
- 15-minute intervals balance freshness with battery life (iOS recommendation)
- Meets 5-second update requirement when app is active (immediate timeline reload)
- Falls within iOS system constraints

**Alternatives Considered**:
- Push notifications for widget updates: Rejected as out of scope for MVP and requires backend infrastructure
- Polling from widget: Not possible - widgets cannot run continuous background tasks
- Real-time sync: Rejected as widgets have strict execution time limits

**Implementation Notes**:
- Use `updateWidgetTimeline()` with scheduled dates for periodic refresh
- When app modifies data, call `WidgetCenter.reloadAllTimelines()` for immediate update
- Accept that widget may show stale data if app hasn't run recently (acceptable for MVP)
- Timeline entries include current date plus next 4-5 refresh intervals

### Decision 4: Widget Size Support

**Chosen**: systemSmall, systemMedium, systemLarge (3 standard sizes)

**Rationale**:
- Matches specification requirements (small: 2-3 habits, medium: 4-6, large: 8-10)
- Standard iOS widget families supported by all devices
- Excludes systemExtraLarge (iPad-only), accessory widgets (Lock Screen) per out-of-scope list

**Implementation Notes**:
- Widget component receives `family` prop to detect rendered size
- Conditional rendering based on `props.family === 'systemSmall'` etc.
- Each size uses appropriate layout (VStack for lists, compact vs. detailed)

### Decision 5: Interaction Handling - Background Widget Writes

**Chosen**: Widget extension writes directly to shared Tinybase database for habit completion

**Rationale**:
- Widget has read/write access to shared Tinybase store via App Group
- Completing habit in background avoids opening app in fullscreen (better UX)
- Instant feedback - widget updates immediately without app launch delay
- Main app automatically sees changes when next opened (shared database)
- Only need deep link for intentional "open app" action when there are no incomplete habits

**Alternatives Considered**:
- Deep links for all interactions: Rejected because it forces app to open fullscreen, interrupting user
- App Intents (iOS 16+): Rejected to support iOS 14+ (specification assumes iOS 14 minimum)
- Background URL Session: Unnecessary complexity for local-only app

**Implementation Notes**:
- Widget calls `store.setCell()` directly on tap to mark habit complete
- Widget calls `refreshWidgetTimeline()` to update display immediately
- Deep link only when no incomplete habits (empty/all-complete) to open app: `beebloom://today`
- No need for main app deep link handler for completions

## Testing Strategy

### Manual Testing Approach (MVP)

**Decision**: Manual testing on physical device and iOS simulator

**Rationale**:
- Constitution requires tests after MVP
- Widget behavior best verified visually on actual home screen
- Simulator supports widget testing in Xcode
- Covers all acceptance criteria through manual verification

**Test Scenarios**:
1. Add widget to home screen (all 3 sizes)
2. Verify incomplete habits display correctly
3. Tap habit to complete, verify it disappears from widget
4. Complete habit in app, verify widget updates within 5 seconds
5. Complete all habits, verify completion message appears
6. Test with no habits, verify empty state message
7. Test midnight rollover (advance system time)
8. Test offline behavior (airplane mode)
9. Test with more habits than fit (overflow indicator)

**Quality Gates**:
- Biome lint passes: `bun run lint`
- All manual test scenarios pass on iOS 14+ device/simulator
- Widget displays within Apple's widget guidelines (size, layout, readability)

## Configuration Reference

### App Group Setup

```json
{
  "expo": {
    "plugins": [
      [
        "expo-widgets",
        {
          "bundleIdentifier": "com.ilyakukarkinorg.beebloom.widgets",
          "groupIdentifier": "group.com.ilyakukarkinorg.beebloom",
          "enablePushNotifications": false,
          "widgets": [
            {
              "name": "HabitWidget",
              "displayName": "BeeBloom Habits",
              "description": "Complete your daily habits",
              "supportedFamilies": ["systemSmall", "systemMedium", "systemLarge"]
            }
          ]
        }
      ]
    ]
  }
}
```

### expo-widgets API Patterns

**Basic Timeline Update**:
```typescript
import { updateWidgetTimeline } from 'expo-widgets';

const now = new Date();
const dates = [
  now,
  new Date(now.getTime() + 15 * 60 * 1000), // +15 min
  new Date(now.getTime() + 30 * 60 * 1000), // +30 min
];

updateWidgetTimeline('HabitWidget', dates, HabitWidget);
```

**Size-Responsive Component**:
```typescript
import { Text, VStack } from '@expo/ui/swift-ui';
import { WidgetBase } from 'expo-widgets';

const HabitWidget = (props: WidgetBase<HabitWidgetProps>) => {
  if (props.family === 'systemSmall') {
    return <VStack>{/* 2-3 habits */}</VStack>;
  }
  if (props.family === 'systemMedium') {
    return <VStack>{/* 4-6 habits */}</VStack>;
  }
  // systemLarge
  return <VStack>{/* 8-10 habits */}</VStack>;
};
```

## Known Constraints

1. **Widget Memory Limit**: Widgets have strict memory limits (~30MB). Keep data queries focused on today's incomplete habits only.

2. **Timeline Budget**: iOS limits how often widgets can refresh. 15-minute intervals are conservative and safe.

3. **Execution Time**: Widget code must complete quickly (<5 seconds). Avoid heavy computation or blocking operations.

4. **No Network**: Widgets cannot make network requests (aligns with offline-first principle).

5. **No Continuous Background**: Widgets cannot run continuously in background like the main app.

6. **SwiftUI Only**: Widget UI uses SwiftUI components, not React Native. Different API from main app views.

## Risk Mitigation

### Risk 1: Widget Performance on Large Habit Lists

**Mitigation**: 
- Query only incomplete habits for current day (filter in Tinybase selector)
- Limit rendering to maximum widget capacity (10 habits for large size)
- Use indexed queries on date field if performance issues arise post-MVP

### Risk 2: Widget-App Data Sync Timing

**Mitigation**:
- Accept 15-minute max staleness for background refresh (within 5-second requirement when app active)
- Main app triggers immediate widget reload after any habit/check modification
- Retry mechanism (3 retries × 5 seconds) handles transient failures per specification

### Risk 3: App Group Configuration Issues

**Mitigation**:
- Expo plugin handles entitlements automatically
- Test on physical device early (App Groups don't work reliably in some simulator versions)
- Verify shared container path accessible from both app and widget

## Next Steps

Proceed to Phase 1:
- Generate data-model.md (widget-specific data structures)
- Generate contracts/widget-props.ts (TypeScript interface)
- Generate quickstart.md (developer setup guide)
- Update .github/.copilot file with expo-widgets context
