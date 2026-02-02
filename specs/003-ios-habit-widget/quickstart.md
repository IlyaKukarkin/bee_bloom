# Quickstart: iOS Home Screen Widget

**Feature**: iOS Widget MVP  
**Audience**: Developers implementing the widget  
**Time to Complete**: ~2 hours

## Prerequisites

- Expo SDK 54+ installed
- iOS development environment (Xcode 14+, macOS)
- Physical iOS device or simulator running iOS 14+
- BeeBloom app running with existing habits data

## Installation Steps

### 1. Install expo-widgets Package

```bash
npx expo install expo-widgets
```

**Verification**: Check `package.json` includes `"expo-widgets": "^X.X.X"` in dependencies.

---

### 2. Configure app.json

Add expo-widgets plugin to your app.json:

```json
{
  "expo": {
    "plugins": [
      "expo-sqlite",
      "expo-router",
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

**Note**: The `bundleIdentifier` must match your main app's bundle ID pattern. The `groupIdentifier` must use `group.` prefix followed by your main bundle ID.

**Verification**: Run `npx expo prebuild --clean` to regenerate native projects with widget configuration.

---

### 3. Create Widget Bridge Module

Create `src/store/widget-bridge.ts`:

```typescript
import type { Store } from 'tinybase';
import type { HabitWidgetItem, WidgetViewState } from '../../specs/003-ios-habit-widget/contracts/widget-props';
import { WIDGET_CAPACITY } from '../../specs/003-ios-habit-widget/contracts/widget-props';

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Query incomplete habits for today from Tinybase store.
 */
export function getTodayIncompleteHabits(store: Store): HabitWidgetItem[] {
  const today = getTodayDateString();
  const items: HabitWidgetItem[] = [];

  // Get all non-deleted habits
  const habits = store.getTable('habits');
  const groups = store.getTable('habitGroups');
  const checks = store.getTable('checks');

  // Build array of habits with completion status
  Object.entries(habits).forEach(([habitId, habit]) => {
    // Skip deleted habits
    if (habit.deletedAt) return;

    // Check if completed today
    const checkKey = `${habitId}_${today}`;
    const check = checks[checkKey];
    const isComplete = check?.completed === true;

    // Skip if already completed
    if (isComplete) return;

    // Get group info if habit is grouped
    const groupTitle = habit.groupId ? groups[habit.groupId]?.title : null;

    items.push({
      id: habitId,
      title: habit.title as string,
      color: habit.color as string,
      groupTitle: groupTitle as string | null,
      order: (habit.order as number) || 0,
    });
  });

  // Sort by order (matches Today view)
  items.sort((a, b) => a.order - b.order);

  return items;
}

/**
 * Generate complete widget view state with display capacity limit.
 */
export function getWidgetViewState(
  store: Store,
  widgetSize: 'small' | 'medium' | 'large'
): WidgetViewState {
  const maxDisplay = WIDGET_CAPACITY[widgetSize];
  const allHabits = Object.values(store.getTable('habits')).filter(
    (h) => !h.deletedAt
  );
  const incompleteHabits = getTodayIncompleteHabits(store);

  return {
    incompleteHabits: incompleteHabits.slice(0, maxDisplay),
    totalIncomplete: incompleteHabits.length,
    allComplete: allHabits.length > 0 && incompleteHabits.length === 0,
    hasHabits: allHabits.length > 0,
    generatedAt: new Date(),
  };
}
```

**Verification**: Import in another file to check TypeScript types resolve correctly.

---

### 4. Create Widget Component

Create `widgets/HabitWidget.tsx`:

```typescript
import { Button, HStack, Link, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  frame,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import type { WidgetBase } from 'expo-widgets';
import { updateWidgetTimeline } from 'expo-widgets';
import { createStore } from 'tinybase';
import type { HabitWidgetProps } from '../specs/003-ios-habit-widget/contracts/widget-props';
import { WidgetDeepLinks } from '../specs/003-ios-habit-widget/contracts/widget-props';
import { getTodayDateString, getWidgetViewState } from '../src/store/widget-bridge';

// Initialize Tinybase store with App Group shared SQLite path
// Note: Actual path configuration handled by expo-widgets plugin
const store = createStore();
// TODO: Configure persister with shared container path

/**
 * Habit Widget Component
 * Displays today's incomplete habits with tap-to-complete interaction.
 */
const HabitWidget = (props: WidgetBase<HabitWidgetProps>) => {
  const { family } = props;

  // Determine widget size
  const widgetSize =
    family === 'systemSmall'
      ? 'small'
      : family === 'systemMedium'
        ? 'medium'
        : 'large';

  // Get current state
  const viewState = getWidgetViewState(store, widgetSize);
  const { incompleteHabits, totalIncomplete, allComplete, hasHabits } = viewState;
  const overflowCount = totalIncomplete - incompleteHabits.length;

  // Empty state: no habits exist
  if (!hasHabits) {
    return (
      <Link url={WidgetDeepLinks.openToday()}>
        <VStack modifiers={[padding(16), frame({ maxWidth: Infinity, maxHeight: Infinity })]}>
          <Text modifiers={[font({ size: 14 }), foregroundStyle('#666666')]}>
            Add your first habit in BeeBloom
          </Text>
        </VStack>
      </Link>
    );
  }

  // All complete state
  if (allComplete) {
    return (
      <Link url={WidgetDeepLinks.openToday()}>
        <VStack modifiers={[padding(16), frame({ maxWidth: Infinity, maxHeight: Infinity })]}>
          <Text modifiers={[font({ size: 16, weight: 'semibold' })]}>
            All habits completed today! 🌸
          </Text>
        </VStack>
      </Link>
    );
  }

  // Habit list
  return (
    <VStack modifiers={[padding(12), frame({ maxWidth: Infinity, alignment: 'topLeading' })]}>
      {/* Widget title */}
      <Text modifiers={[font({ size: 12, weight: 'medium' }), foregroundStyle('#999999')]}>
        BeeBloom
      </Text>

      <Spacer />

      {/* Habit list - tap to complete in background */}
      {incompleteHabits.map((habit) => (
        <Button
          key={habit.id}
          action={() => {
            // Complete habit directly in widget (write to shared store)
            const today = getTodayDateString();
            const checkKey = `${habit.id}_${today}`;
            store.setCell('checks', checkKey, 'habitId', habit.id);
            store.setCell('checks', checkKey, 'date', today);
            store.setCell('checks', checkKey, 'completed', true);
            store.setCell('checks', checkKey, 'updatedAt', new Date().toISOString());
            
            // Refresh widget timeline immediately
            refreshWidgetTimeline();
          }}
        >
          <HStack modifiers={[padding({ vertical: 4 })]}>
            {/* Color indicator */}
            <Text modifiers={[foregroundStyle(habit.color), font({ size: 16 })]}>●</Text>

            {/* Habit title */}
            <Text
              modifiers={[
                font({ size: widgetSize === 'small' ? 13 : 14 }),
                foregroundStyle('#000000'),
                padding({ leading: 8 }),
              ]}
            >
              {habit.title}
            </Text>
          </HStack>
        </Button>
      ))}

      {/* Overflow indicator */}
      {overflowCount > 0 && (
        <Text
          modifiers={[
            font({ size: 11 }),
            foregroundStyle('#999999'),
            padding({ top: 4 }),
          ]}
        >
          +{overflowCount} more
        </Text>
      )}
    </VStack>
  );
};

/**
 * Update widget timeline with scheduled refresh intervals.
 */
export function refreshWidgetTimeline() {
  const now = new Date();
  const dates = [
    now,
    new Date(now.getTime() + 15 * 60 * 1000), // +15 min
    new Date(now.getTime() + 30 * 60 * 1000), // +30 min
    new Date(now.getTime() + 45 * 60 * 1000), // +45 min
    new Date(now.getTime() + 60 * 60 * 1000), // +60 min
  ];

  updateWidgetTimeline('HabitWidget', dates, HabitWidget);
}

export default HabitWidget;
```

**Verification**: TypeScript should compile without errors. Widget will render after building native app.

---

### 5. Configure Deep Link for Open App Action (Optional)

The widget only opens the app when there are no incomplete habits (empty state or all-complete state). Habit completion happens in the widget background without opening the app.

In your app.json, ensure the URL scheme is configured:

```json
{
  "expo": {
    "scheme": "beebloom"
  }
}
```

Expo Router will automatically handle `beebloom://today` URLs and navigate to the Today view.

**Verification**: With no incomplete habits, tap the widget and verify the app opens to Today view.

---

### 6. Build and Test

#### Build Native App with Widget Extension

```bash
npx expo prebuild --clean
npx expo run:ios
```

This generates the native iOS project with the widget extension target.

#### Add Widget to Home Screen

1. Long-press home screen on iOS device/simulator
2. Tap "+" button in top-left corner
3. Search for "BeeBloom"
4. Select widget size (small/medium/large)
5. Tap "Add Widget"

#### Test Scenarios

**Test 1: Widget Displays Incomplete Habits**
- Expected: Widget shows 2-3 habits (small), 4-6 (medium), or 8-10 (large)
- Verify: Habit titles and colors visible

**Test 2: Tap Habit to Complete (Background)**
- Action: Tap a habit in widget
- Expected: Habit disappears from widget immediately (no app opening), appears completed when you open main app later

**Test 3: Complete Habit in App**
- Action: Complete habit in main app's Today view
- Expected: Widget updates within 5 seconds (may need to background/foreground app)

**Test 4: All Habits Complete**
- Action: Complete all habits
- Expected: Widget shows "All habits completed today! 🌸"

**Test 5: No Habits Exist**
- Action: Delete all habits
- Expected: Widget shows "Add your first habit in BeeBloom"

**Test 6: Overflow Indicator**
- Action: Create 15+ habits, use small widget
- Expected: Widget shows 3 habits + "+12 more" indicator

---

### 7. Validate with Linter

```bash
bun run lint
```

**Expected**: No errors. Biome should pass all checks.

---

## Troubleshooting

### Widget Not Appearing in Widget Gallery

**Solution**: 
- Run `npx expo prebuild --clean` to regenerate native projects
- Rebuild app with `npx expo run:ios`
- Check app.json has correct widget configuration

### Widget Shows "Unable to Load"

**Solution**:
- Check Xcode console for widget extension errors
- Verify App Group entitlements configured correctly
- Ensure shared container path accessible from widget

### Widget Not Updating After App Changes

**Solution**:
- Ensure the widget timeline refresh is called after app writes (if applicable)
- Check timeline refresh interval (15 minutes default)
- Force-refresh by removing and re-adding widget

### Tapping Habit Does Nothing

**Solution**:
- Verify Button action handler is correctly updating shared Tinybase store
- Check widget has write permissions to App Group shared container
- Verify store instance is connected to shared SQLite database path
- Check Xcode console for widget extension errors during tap

### Tapping Widget Does Nothing When No Incomplete Habits

**Solution**:
- Verify deep link scheme registered in app.json: `"scheme": "beebloom"`
- Test deep link URL directly: `xcrun simctl openurl booted "beebloom://today"`

---

## Next Steps

After completing this quickstart:

1. **Test on Physical Device**: Widgets behave differently on real devices vs. simulator
2. **Monitor Performance**: Check widget render time in Xcode Instruments
3. **Iterate on Design**: Adjust spacing, colors, font sizes based on visual testing
4. **Document Edge Cases**: Note any discovered issues for future reference

Proceed to `/speckit.tasks` to break down implementation into specific development tasks.
