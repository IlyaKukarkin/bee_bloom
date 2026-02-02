# Data Model: iOS Home Screen Widget

**Feature**: iOS Widget MVP  
**Date**: 2026-02-02  
**Context**: Widget-specific data structures and state management

## Overview

This document defines the data structures used by the iOS widget extension. The widget shares the main app's Tinybase database via App Group storage but introduces widget-specific view models and props for rendering.

## Core Entities

### HabitWidgetItem

**Purpose**: View model for a single habit displayed in the widget

**Fields**:
- `id: string` - Habit unique identifier (from habits table)
- `title: string` - Habit display name
- `color: string` - Hex color code for visual grouping indicator
- `groupTitle?: string | null` - Group name for display (if habit belongs to group)
- `order: number` - Display order within widget (matches Today view order)

**Source**: Derived from joined query of `habits`, `habitGroups`, and `checks` tables

**Validation Rules**:
- `id` must exist in habits table
- `title` must not be empty
- `color` must be valid hex color (e.g., "#FF5733")
- `order` must be non-negative integer

**State Transitions**: N/A (read-only view model)

**Relationships**:
- Belongs to one `Habit` (via `id`)
- Optionally belongs to one `HabitGroup` (via group reference in Habit)

---

### WidgetViewState

**Purpose**: Complete state snapshot for widget rendering at a specific timestamp

**Fields**:
- `incompleteHabits: HabitWidgetItem[]` - Ordered list of incomplete habits for today
- `totalIncomplete: number` - Total count of incomplete habits (may exceed display capacity)
- `allComplete: boolean` - Whether all habits completed for today
- `hasHabits: boolean` - Whether any habits exist (not deleted)
- `generatedAt: Date` - Timestamp when this state snapshot was created

**Source**: Computed from Tinybase store state

**Validation Rules**:
- `incompleteHabits.length <= totalIncomplete` (displayed ≤ total)
- `allComplete === true` implies `incompleteHabits.length === 0`
- `hasHabits === false` implies `totalIncomplete === 0` and `allComplete === false`
- `generatedAt` must not be in future

**State Transitions**:
1. Initial state (no habits): `hasHabits = false, allComplete = false`
2. Habits exist, some incomplete: `hasHabits = true, allComplete = false, incompleteHabits.length > 0`
3. All complete: `hasHabits = true, allComplete = true, incompleteHabits.length = 0`

**Relationships**: N/A (aggregate view model)

---

### WidgetSize

**Purpose**: Enum defining supported widget size variants

**Values**:
- `small` - Maps to `systemSmall` (2-3 habit capacity)
- `medium` - Maps to `systemMedium` (4-6 habit capacity)
- `large` - Maps to `systemLarge` (8-10 habit capacity)

**Display Capacity**:
```typescript
const WIDGET_CAPACITY = {
  small: 3,
  medium: 6,
  large: 10,
} as const;
```

**Source**: Passed by WidgetKit via `family` prop

**Validation**: Must be one of the three defined values

---

## Widget-Specific Queries

### getTodayIncompleteHabits

**Purpose**: Fetch incomplete habits for current day in display order

**Input**: 
- `store: Store` - Tinybase store instance
- `today: string` - Current date in YYYY-MM-DD format

**Output**: `HabitWidgetItem[]`

**Logic**:
```typescript
1. Query habits where deletedAt IS NULL
2. Left join checks on habitId and date = today
3. Filter to rows where check.completed IS NULL OR check.completed = false
4. Left join habitGroups on groupId
5. Order by group.order ASC, habit.order ASC (matches Today view)
6. Map to HabitWidgetItem structure
7. Return array
```

**Performance**: 
- Expected dataset: <100 habits, <10 incomplete per day
- Query executes in <100ms on device

---

### getWidgetViewState

**Purpose**: Generate complete widget state snapshot

**Input**:
- `store: Store` - Tinybase store instance
- `maxDisplay: number` - Maximum habits to include (based on widget size)

**Output**: `WidgetViewState`

**Logic**:
```typescript
1. Get today's date in YYYY-MM-DD
2. allHabits = query habits where deletedAt IS NULL
3. incompleteHabits = getTodayIncompleteHabits(store, today)
4. Return {
     incompleteHabits: incompleteHabits.slice(0, maxDisplay),
     totalIncomplete: incompleteHabits.length,
     allComplete: allHabits.length > 0 && incompleteHabits.length === 0,
     hasHabits: allHabits.length > 0,
     generatedAt: new Date()
   }
```

---

## Data Flow

### Widget Render Flow

```
┌─────────────────────┐
│  WidgetKit Timeline │
│  Triggers Render    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Read Tinybase Store │ (from App Group shared SQLite)
│ via Store Instance  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ getWidgetViewState()│ (query incomplete habits for today)
│ with size capacity  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ HabitWidget         │ (render based on props.family)
│ Component Renders   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Display on Home     │
│ Screen              │
└─────────────────────┘
```

### Widget Interaction Flow

```
┌─────────────────────┐
│ User Taps Habit     │
│ in Widget           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Widget Extension    │ store.setCell('checks', key, 'completed', true)
│ Writes to Shared DB │ (set check.completed = true for today)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Widget Reloads      │ refreshWidgetTimeline()
│ Timeline            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Widget Re-renders   │ (habit disappears from list)
│ with Updated Data   │ (no app launch, background completion)
└─────────────────────┘

Note: Main app sees changes next time it opens (shared Tinybase store)
```

## Storage Considerations

### App Group Shared Container

**Path**: `~/Library/Group Containers/group.com.ilyakukarkinorg.beebloom/`

**Contents**:
- `tinybase.db` - SQLite database (shared between app and widget)
- Accessed by both main app and widget extension with same schema

**Access Pattern**:
- **Main App**: Read/write (creates habits, groups, checks)
- **Widget**: Read for display; writes check completions directly to shared store on tap
- **Concurrency**: SQLite handles concurrent reads; writes are low-frequency and atomic (single check update)

### Widget Timeline Storage

**Managed By**: WidgetKit (iOS system)

**Contents**: 
- Rendered snapshot images for each timeline entry
- Timeline dates for scheduled refreshes

**Size Limits**: 
- Per-entry snapshot: ~500KB max
- Total timeline: ~10-15 entries recommended

**Lifecycle**: 
- Automatically purged by iOS when widget removed
- Cleared when timeline reloaded

## Type Definitions

### TypeScript Interfaces

```typescript
// Widget view model for a single habit
export interface HabitWidgetItem {
  id: string;
  title: string;
  color: string;
  groupTitle?: string | null;
  order: number;
}

// Complete widget state snapshot
export interface WidgetViewState {
  incompleteHabits: HabitWidgetItem[];
  totalIncomplete: number;
  allComplete: boolean;
  hasHabits: boolean;
  generatedAt: Date;
}

// Widget size with display capacity
export type WidgetSize = 'small' | 'medium' | 'large';

export const WIDGET_CAPACITY: Record<WidgetSize, number> = {
  small: 3,
  medium: 6,
  large: 10,
};

// Props passed to widget component
export interface HabitWidgetProps {
  viewState: WidgetViewState;
  displayCount: number; // How many to actually show (based on capacity)
}
```

## Migration Impact

**Existing Schema**: No changes required to existing Tinybase schema

**New Code**: 
- Widget query functions in `src/store/widget-bridge.ts`
- Widget component in `widgets/HabitWidget.tsx`

**Data Migration**: None needed (uses existing habit, group, check data)

## Error Handling

### Store Access Errors

**Scenario**: Widget cannot access shared SQLite database

**Handling**: 
- Display fallback message: "Open BeeBloom to refresh"
- Log error (visible in device console)
- Widget remains on home screen but shows error state

### Query Errors

**Scenario**: Tinybase query throws exception

**Handling**:
- Catch exception, log to console
- Return empty WidgetViewState (hasHabits = false)
- Widget shows empty state message

### Invalid Data

**Scenario**: Habit row missing required fields

**Handling**:
- Skip invalid rows during query
- Include only valid habits in results
- Log warning with habit ID for debugging

## Performance Targets

- **Query Execution**: <100ms for getTodayIncompleteHabits
- **State Generation**: <50ms for getWidgetViewState
- **Total Render**: <200ms from timeline trigger to display update
- **Memory Usage**: <10MB per widget instance

All targets measured on iPhone 12 (representative mid-range device).
