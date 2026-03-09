# Data Model: iOS Widget Display Recovery

**Feature**: 001-fix-ios-widget-display  
**Date**: 2026-03-09

## Overview

This feature modifies existing widget data flow to include weekly progress and ensure proper rendering. No database schema changes required - all needed data already exists in the TinyBase store.

## Entities

### HabitWidgetItem (Extended)

**Purpose**: Represents a single habit displayed in the widget with all necessary UI data.

**Current Attributes**:
- `id: string` - Habit unique identifier
- `title: string` - Habit display name
- `color: string` - Visual indicator color (hex format)
- `groupId: string | null` - Optional group association
- `groupTitle: string | null` - Group display name if grouped
- `order: number` - User-defined sort priority

**New Attributes**:
- `weeklyProgress?: { completed: number; target: number }` - Optional weekly tracking data for medium/large widgets

**Relationships**:
- Derived from `HabitRow` + `HabitGroupRow` via joins
- Filtered to active habits only (non-archived, not deleted)
- Sorted by `order` field (user-defined priority)
- Limited by widget size capacity (4/4/8 for small/medium/large)

**Validation Rules**:
- `id` must exist in habits table
- `title` cannot be empty
- `color` must be valid hex color
- `order` must be non-negative integer
- `weeklyProgress.completed` <= 7 (max days in week)
- `weeklyProgress.target` must match `HabitRow.weeklyTarget` when present

**State Transitions**:
- Completion: When user taps habit in widget → `completed` count increments
- Weekly Reset: At start of new week → `completed` resets to 0, `target` remains stable

---

### WidgetViewState (Unchanged)

**Purpose**: Aggregate state representing what should be displayed in widget at current moment.

**Attributes**:
- `incompleteHabits: HabitWidgetItem[]` - Habits not yet checked today, sorted by priority, limited by capacity
- `totalIncomplete: number` - Count of all active incomplete habits (may exceed capacity)
- `allComplete: boolean` - True if all active habits checked today
- `hasHabits: boolean` - True if any active habits exist
- `generatedAt: Date` - Timestamp of state snapshot

**Derived Data**:
- `overflowCount = totalIncomplete - incompleteHabits.length` - Number of habits hidden due to capacity limit

---

## Data Flow

### Widget Render Flow

```
┌─────────────┐
│ iOS Widget  │
│   Renders   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ HabitWidget.tsx     │
│ ('widget' directive)│
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│ createWidgetStore()  │
│ (Shared SQLite)      │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────┐
│ getWidgetViewState()    │
│ - Query active habits   │
│ - Filter incomplete     │
│ - Calculate weekly data │
│ - Sort by order         │
│ - Limit by capacity     │
└──────┬──────────────────┘
       │
       ▼
┌────────────────────────┐
│ Render layout:         │
│ - Small: 4 habits      │
│ - Medium: 4 + weekly   │
│ - Large: 8 + weekly    │
└────────────────────────┘
```

### Widget Update Flow

```
┌──────────────┐
│ User Action  │
│ (in main app)│
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Habit Modified   │
│ in SQLite        │
└──────┬───────────┘
       │
       ▼
┌────────────────────────┐
│ refreshWidgetTimeline()│
│ (called from app)      │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ updateTimeline([...])  │
│ - Schedules refresh    │
│   at 15/30/45/60 min   │
│   + next midnight      │
└────────────────────────┘
       │
       ▼
┌────────────────────────┐
│ iOS System schedules   │
│ widget re-render at    │
│ specified times        │
└────────────────────────┘
```

### Weekly Progress Calculation

**Input**: 
- `habitId: string`
- `weeklyTarget: number | null` (from HabitRow)
- `checks` table (CheckRow entries)

**Algorithm**:
```typescript
1. Get start of current week (Sunday 00:00)
2. Get end of current week (Saturday 23:59)
3. Query checks table:
   - WHERE habitId = habitId
   - AND date >= weekStart
   - AND date <= weekEnd
4. Count distinct date keys
5. Return { completed: count, target: weeklyTarget }
```

**Edge Cases**:
- If `weeklyTarget` is null → omit weeklyProgress field (undefined)
- Week starts Sunday (iOS calendar convention)
- Count distinct dates only (multiple checks same day = 1)

---

## Size Constraints

### Widget Capacity Limits

| Widget Size | Max Habits | Display Fields |
|-------------|------------|----------------|
| systemSmall | 4 | name + status |
| systemMedium | 4 | name + status + weekly |
| systemLarge | 8 | name + status + weekly |

**Overflow Handling**:
- Display "+N more" text when `totalIncomplete > capacity`
- Example: 10 incomplete habits in Small widget → show 4 + "+6 more"

---

## Type Definitions (Contracts)

See [contracts/widget-types.ts](contracts/widget-types.ts) for TypeScript interfaces.
