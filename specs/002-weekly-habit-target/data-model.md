# Data Model: Weekly Habit Target

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)  
**Date**: 2026-01-09

## Entities

### Habit (Modified)

Represents a user's habit being tracked over time.

**Attributes**:
- `id` (string, primary key) - Unique identifier
- `title` (string, required) - Habit name
- `description` (string) - Optional description
- `color` (string) - UI color code
- `groupId` (string, nullable) - Reference to parent group
- `order` (number) - Display order within group
- `createdAt` (string, ISO 8601) - Creation timestamp
- `deletedAt` (string, nullable, ISO 8601) - Soft delete timestamp
- **`weeklyTarget` (number, required) - NEW** - Target completions per week (1-7)

**Validation Rules**:
- `weeklyTarget` must be integer between 1 and 7 (inclusive)
- Default value: 7
- Required field (not nullable)

**Relationships**:
- Belongs to one HabitGroup (via `groupId`, optional)
- Has many Checks (one-to-many via habit checks)

**State Transitions**:
- On create: `weeklyTarget` defaults to 7
- On edit: `weeklyTarget` can be updated to any value 1-7
- On migration: Existing habits without field receive default value 7

---

### Check (Unchanged)

Represents a single completion/check of a habit on a specific date.

**Attributes**:
- `habitId` (string, foreign key) - Reference to habit
- `date` (string, ISO 8601 date) - Date of check
- `completed` (boolean) - Whether habit was completed
- `updatedAt` (string, ISO 8601) - Last update timestamp

**Relationships**:
- Belongs to one Habit (via `habitId`)

**Usage for Weekly Progress**:
- Filter by `habitId` and date range (current week)
- Count where `completed === true`
- Compare count to `habit.weeklyTarget` for progress display

---

### HabitGroup (Unchanged)

Represents a grouping/category of habits.

**Attributes**:
- `id` (string, primary key) - Unique identifier
- `title` (string, required) - Group name
- `color` (string) - UI color code
- `order` (number) - Display order
- `createdAt` (string, ISO 8601) - Creation timestamp

**Relationships**:
- Has many Habits (one-to-many)

---

## Computed Properties

### Weekly Progress (Virtual)

**Not stored**, calculated on-demand for display.

**Calculation**:
```typescript
interface WeeklyProgress {
  current: number;  // Count of completed checks this week
  target: number;   // habit.weeklyTarget value
  display: string;  // Format: "current/target" (e.g., "3/7")
}
```

**Logic**:
1. Determine current week boundaries (Monday 00:00 to Sunday 23:59)
2. Query checks table: `WHERE habitId = ? AND date >= weekStart AND date <= weekEnd AND completed = true`
3. Count results = `current`
4. Retrieve `habit.weeklyTarget` = `target`
5. Format as `${current}/${target}`

**Edge Cases**:
- If `current > target`, still display actual count (e.g., "8/7")
- Week transitions reset count to 0 (date-based filter handles automatically)
- New habits with no checks show "0/7" (or "0/{target}")

---

## Schema Changes

### TinyBase Schema Update

**File**: `src/store/schema.ts`

```typescript
export const schema = {
  tables: {
    habits: {
      // ... existing fields ...
      weeklyTarget: { type: "number" },  // NEW FIELD
    },
    // ... other tables unchanged ...
  },
} as const;
```

### TypeScript Type Update

**File**: `src/store/types.ts`

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
  weeklyTarget: number;  // NEW FIELD (1-7, default 7)
}
```

---

## Migration

### Migration Function

**File**: `src/store/migrations.ts`

**Purpose**: Apply default `weeklyTarget = 7` to all existing habits that don't have the field.

**Trigger**: Run once on app startup after store initialization.

**Idempotency**: Check if first habit already has `weeklyTarget` field; skip if migration already applied.

**Pseudocode**:
```typescript
function migrateToWeeklyTarget(store: Store): void {
  const habitsTable = store.getTable("habits");
  
  // Skip if migration already ran
  const firstHabit = Object.values(habitsTable)[0];
  if (firstHabit && typeof firstHabit.weeklyTarget === "number") {
    return; // Already migrated
  }
  
  // Apply default to all non-deleted habits
  for (const [habitId, habit] of Object.entries(habitsTable)) {
    if (!habit.deletedAt) {
      store.setCell("habits", habitId, "weeklyTarget", 7);
    }
  }
}
```

**Error Handling**: None needed - TinyBase operations are synchronous and atomic.

---

## Data Flow

### Create Habit
1. User enters habit details in form
2. User selects weekly target from dropdown (default: 7)
3. On save: Store habit with all fields including `weeklyTarget`
4. UI displays new habit on weekly screen with "0/{target}" progress

### Edit Habit
1. Load existing habit data
2. Pre-populate form including current `weeklyTarget` value
3. User changes target via dropdown
4. On save: Update habit with new `weeklyTarget`
5. Weekly screen reflects new target immediately

### View Weekly Progress
1. Render weekly screen
2. For each habit:
   - Query checks for current week
   - Count completed checks
   - Retrieve habit's `weeklyTarget`
   - Display as "X/Y" format
3. Updates reactively when user marks habits complete

### Week Transition
1. User opens app on new week (date-based detection)
2. Weekly progress calculation uses new week boundaries
3. All habits show fresh counts starting from 0
4. Previous week data remains in checks table (historical)

---

## Constraints

- **Storage**: TinyBase in-memory with async-storage persistence (local device only)
- **Performance**: Query optimization not needed for MVP (<100 habits, <365 days data)
- **Concurrency**: Single-user, single-device, no sync conflicts
- **Validation**: 
  - UI enforces 1-7 selection via picker
  - Type system enforces number type
  - Migration ensures all habits have valid value
