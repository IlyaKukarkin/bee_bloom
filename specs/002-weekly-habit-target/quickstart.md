# Quickstart: Weekly Habit Target Implementation

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: 2026-01-09

This guide provides the step-by-step implementation sequence for adding weekly habit targets.

## Prerequisites

- Branch `002-weekly-habit-target` checked out
- Development environment set up (Expo, Node.js)
- Existing app running successfully

## Implementation Sequence

### Phase 1: Data Layer (Schema & Types)

**Estimated time**: 15-20 minutes

#### Step 1.1: Update Schema

**File**: `src/store/schema.ts`

Add `weeklyTarget` field to habits table:

```typescript
export const schema = {
  tables: {
    // ... other tables ...
    habits: {
      id: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      color: { type: "string" },
      groupId: { type: "string" },
      order: { type: "number" },
      createdAt: { type: "string" },
      deletedAt: { type: "string" },
      weeklyTarget: { type: "number" }, // ADD THIS LINE
    },
    // ... other tables ...
  },
} as const;
```

#### Step 1.2: Update Types

**File**: `src/store/types.ts`

Add `weeklyTarget` to `HabitRow` interface:

```typescript
export interface HabitRow {
  id: string;
  title: string;
  description?: string | null;
  color: string;
  groupId: string | null;
  order?: number;
  createdAt: string;
  deletedAt: string | null;
  weeklyTarget: number; // ADD THIS LINE
}
```

#### Step 1.3: Create Migration

**File**: `src/store/migrations.ts`

Add migration function at the end of the file:

```typescript
/**
 * Migration: Add weeklyTarget field to existing habits
 * Sets default value of 7 for all habits without the field
 */
export function migrateToWeeklyTarget(store: Store): void {
  const habitsTable = store.getTable("habits");
  
  // Skip if migration already ran
  const firstHabit = Object.values(habitsTable)[0] as HabitRow | undefined;
  if (firstHabit && typeof firstHabit.weeklyTarget === "number") {
    console.log("Weekly target migration already applied, skipping");
    return;
  }
  
  console.log("Applying weekly target migration...");
  
  // Set weeklyTarget: 7 for all non-deleted habits
  Object.entries(habitsTable).forEach(([habitId, habit]) => {
    const habitRow = habit as HabitRow & { weeklyTarget?: number };
    if (!habitRow.deletedAt && habitRow.weeklyTarget === undefined) {
      store.setCell("habits", habitId, "weeklyTarget", 7);
    }
  });
  
  console.log("Weekly target migration complete");
}
```

#### Step 1.4: Run Migration on Startup

**File**: `src/store/index.tsx`

Find where other migrations are called (likely in a `useEffect` or store initialization), and add:

```typescript
// After existing migrations like migrateToGroupsAndOrdering
migrateToWeeklyTarget(store);
```

**Test**: Run app, check console for migration log. Verify existing habits now have `weeklyTarget: 7`.

---

### Phase 2: Weekly Progress Selector

**Estimated time**: 15-20 minutes

#### Step 2.1: Add Date Utilities (if needed)

**File**: `src/lib/dates.ts`

Check if week boundary functions exist. If not, add:

```typescript
/**
 * Get the start of the current week (Monday at 00:00)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the current week (Sunday at 23:59:59)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Format date as YYYY-MM-DD for comparison
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

#### Step 2.2: Add Weekly Progress Selector

**File**: `src/store/selectors.ts`

Add selector function:

```typescript
import { getWeekStart, getWeekEnd, formatDateKey } from "../lib/dates";

/**
 * Calculate weekly progress for a habit
 * Returns current completions vs target for the current week
 */
export function useWeeklyProgress(habitId: string): {
  current: number;
  target: number;
  display: string;
} {
  const habit = useRow("habits", habitId) as HabitRow | undefined;
  const checks = useValues("checks");
  
  if (!habit) {
    return { current: 0, target: 7, display: "0/7" };
  }
  
  // Get current week boundaries
  const weekStart = formatDateKey(getWeekStart());
  const weekEnd = formatDateKey(getWeekEnd());
  
  // Count completed checks for this habit during current week
  const current = Object.values(checks).filter((check: any) => {
    return (
      check.habitId === habitId &&
      check.completed === true &&
      check.date >= weekStart &&
      check.date <= weekEnd
    );
  }).length;
  
  const target = habit.weeklyTarget;
  
  return {
    current,
    target,
    display: `${current}/${target}`,
  };
}
```

**Test**: Use this hook in a component temporarily to verify it returns correct values.

---

### Phase 3: UI Components

**Estimated time**: 20-30 minutes

#### Step 3.1: Install Picker Library

```bash
npx expo install @react-native-picker/picker
```

#### Step 3.2: Create WeeklyTargetPicker Component

**File**: `src/components/ui.tsx`

Add at end of file:

```typescript
import { Picker } from '@react-native-picker/picker';

interface WeeklyTargetPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export function WeeklyTargetPicker({ value, onValueChange }: WeeklyTargetPickerProps) {
  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
        Weekly Target
      </Text>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => onValueChange(Number(itemValue))}
        style={{ height: 120 }}
      >
        <Picker.Item label="1 time per week" value={1} />
        <Picker.Item label="2 times per week" value={2} />
        <Picker.Item label="3 times per week" value={3} />
        <Picker.Item label="4 times per week" value={4} />
        <Picker.Item label="5 times per week" value={5} />
        <Picker.Item label="6 times per week" value={6} />
        <Picker.Item label="7 times per week" value={7} />
      </Picker>
    </View>
  );
}
```

**Note**: Adjust styling to match your existing UI theme.

---

### Phase 4: Habit Create/Edit Screens

**Estimated time**: 20-25 minutes

#### Step 4.1: Update New Habit Screen

**File**: `app/habit/new.tsx`

1. Import the picker:
```typescript
import { WeeklyTargetPicker } from '../../src/components/ui';
```

2. Add state for weekly target:
```typescript
const [weeklyTarget, setWeeklyTarget] = useState(7); // Default to 7
```

3. Add picker to form (before the save button):
```typescript
<WeeklyTargetPicker 
  value={weeklyTarget} 
  onValueChange={setWeeklyTarget} 
/>
```

4. Include in save handler:
```typescript
// When creating habit, add weeklyTarget to the data
store.setRow("habits", habitId, {
  // ... existing fields ...
  weeklyTarget: weeklyTarget,
});
```

#### Step 4.2: Update Edit Habit Screen

**File**: `app/habit/[id].tsx`

1. Import the picker:
```typescript
import { WeeklyTargetPicker } from '../../src/components/ui';
```

2. Add state initialized from existing habit:
```typescript
const [weeklyTarget, setWeeklyTarget] = useState(habit.weeklyTarget);
```

3. Add picker to form:
```typescript
<WeeklyTargetPicker 
  value={weeklyTarget} 
  onValueChange={setWeeklyTarget} 
/>
```

4. Include in update handler:
```typescript
store.setRow("habits", habitId, {
  // ... existing fields ...
  weeklyTarget: weeklyTarget,
});
```

**Test**: Create new habit, verify default is 7. Edit habit, verify current value is pre-selected. Change value, save, verify it persists.

---

### Phase 5: Weekly Screen Progress Display

**Estimated time**: 15-20 minutes

#### Step 5.1: Update Weekly Screen

**File**: `app/weekly.tsx`

1. Import selector:
```typescript
import { useWeeklyProgress } from '../src/store/selectors';
```

2. For each habit rendered, add progress display using a separate component:
```typescript
// Create a separate component that can use hooks
function HabitProgressRow({ habit }: { habit: HabitRow }) {
  const progress = useWeeklyProgress(habit.id);
  
  return (
    <Text style={{ fontSize: 14, color: '#666' }}>
      {progress.display}
    </Text>
  );
}
```

**Example integration** (adjust to your existing UI structure):
```typescript
{habits.map((habit) => (
  <HabitProgressRow key={habit.id} habit={habit} />
))}

// Or with more structure:
function HabitProgressRow({ habit }: { habit: HabitRow }) {
  const progress = useWeeklyProgress(habit.id);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ flex: 1 }}>{habit.title}</Text>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>
        {progress.display}
      </Text>
    </View>
  );
}
```

**Test**: 
- Create habits with different targets (3, 5, 7)
- Mark some as complete for current week
- Verify progress shows correctly (e.g., "2/5", "1/3", "4/7")
- Complete a habit, verify count increments
- Wait for next week or manually change device date to verify reset

---

## Validation Checklist

After completing all phases:

- [ ] Existing habits have `weeklyTarget: 7` after migration
- [ ] New habits default to 7 in creation form
- [ ] Dropdown shows values 1-7
- [ ] Selected value persists when saving habit
- [ ] Edit screen shows current habit's target
- [ ] Weekly screen displays progress for each habit
- [ ] Progress format is "X/Y" (e.g., "3/7")
- [ ] Progress increments when marking habit complete
- [ ] Progress resets to 0 at week boundary
- [ ] Over-target displays correctly (e.g., "8/7")

## Troubleshooting

**Migration not running**:
- Check console for migration log messages
- Verify migration is called during store initialization
- Clear app data and reinstall to trigger fresh migration

**Picker not displaying**:
- Ensure `@react-native-picker/picker` is installed
- Check import statement is correct
- Verify Picker component is inside View with proper styling

**Progress not updating**:
- Check week boundary functions are correct
- Verify checks table has data with correct date format
- Ensure selector is comparing dates as strings (YYYY-MM-DD)
- Check habit has valid weeklyTarget value

**TypeScript errors**:
- Ensure `HabitRow` type includes `weeklyTarget: number`
- Rebuild TypeScript (`npx tsc --noEmit`)
- Restart VS Code TypeScript server

## Next Steps

After MVP is working:
1. Get user feedback on dropdown UX
2. Consider visual indicators for met/exceeded targets (deferred per spec)
3. Add analytics on most common target values
4. Consider week-start customization (deferred per spec)
