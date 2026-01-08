# Data Model – Habit and Group Reordering

## Entities

### HabitGroup
- id: string (UUID/slug)
- title: string (1-64 chars)
- color: string (hex), optional
- order: number (integer; unique per user list; 0-based or spaced values like 10, 20 for easy inserts)
- createdAt: ISO string

### Habit
- id: string
- title: string (1-120 chars)
- description: string, optional
- color: string (hex)
- groupId: string | null (references HabitGroup; null = ungrouped)
- order: number (integer; unique within group scope)
- createdAt: ISO string
- deletedAt: ISO string | null

### DailyCheck
- habitId: string (FK Habit)
- date: string (YYYY-MM-DD)
- completed: boolean
- updatedAt: ISO string

## Relationships
- HabitGroup 1—* Habit (by groupId; null group means ungrouped bucket rendered separately).
- DailyCheck *—1 Habit.

## Validation & Defaults
- HabitGroup.title required; trim whitespace.
- HabitGroup.order integer >= 0; maintain stable ordering without gaps after migrations; spacing (10,20,30) allowed for mid-insert.
- Habit.title required; trim; order integer >= 0 and unique within its groupId (null allowed).
- Color defaults: reuse existing palette rotation for new habits; groups may default to palette or neutral color.
- Migration default ordering: preserve existing visual order (createdAt ascending) when assigning initial order values.

## State Transitions
- Reorder habit within group: update `order` for affected habits in that group, keep groupId.
- Move habit across groups: update `groupId` and reassign `order` in target group; compact source group order.
- Reorder groups: update `order` for HabitGroup rows; habits retain groupId.
- Cancel drag: no state changes.

## Persistence Notes
- Tinybase schema gains `habitGroups` table and `order` fields on habits.
- Migration creates HabitGroups from existing unique habit group strings; assigns sequential `order` for groups and habits.
- Persister remains Expo SQLite on native and AsyncStorage on web; no remote sync.
