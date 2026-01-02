# Data Model: BeeBloom Gentle Habit MVP

## Entities

### Habit
- `id`: string (UUID)
- `title`: string (1-80 chars, required)
- `description`: string (0-200 chars, optional)
- `color`: string (enum from palette, required)
- `group`: string (0-40 chars, optional; used for grouping label)
- `createdAt`: ISO datetime (device local captured, stored in UTC)
- `deletedAt`: ISO datetime | null

### DailyCheck
- `habitId`: string (FK → Habit.id)
- `date`: string (YYYY-MM-DD, device local day)
- `completed`: boolean
- `updatedAt`: ISO datetime (UTC)

## Relationships
- Habit 1 — many DailyCheck (per-day records)
- Grouping is derived from `group` + `color` on Habit; no separate table

## Validation Rules
- Habit title required; trim whitespace.
- Color must be in predefined palette; default provided at create.
- Only one DailyCheck per (habitId, date).
- Backfill allowed only for `date` in {today, yesterday}; future dates forbidden.
- Deleting a habit removes associated DailyChecks.

## State Transitions
- Create Habit → inserts Habit.
- Edit Habit → updates title/description/color/group; does not touch DailyChecks.
- Delete Habit → marks deletedAt and hides; purge associated DailyChecks.
- Toggle DailyCheck → upsert DailyCheck for today or yesterday only; `completed` flips; `updatedAt` set.

## Derived Views
- Today view: all active Habits with DailyCheck for today (default false if missing).
- Weekly view: per Habit, last 7 days of DailyCheck rows (default false if missing).
