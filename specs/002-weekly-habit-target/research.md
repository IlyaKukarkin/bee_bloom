# Research: Weekly Habit Target

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: 2026-01-09

## Research Questions

### 1. TinyBase Schema Evolution Pattern

**Question**: How do we add a new field to an existing TinyBase table schema with data migration?

**Decision**: Add field to schema.ts, create migration function in migrations.ts, run migration on app startup

**Rationale**: 
- TinyBase doesn't enforce schemas at runtime (it's TypeScript-only typing)
- Existing migration pattern in `migrations.ts` shows how to add fields retroactively
- Migration runs once on app load, checks if already applied, then updates all existing rows

**Alternatives considered**:
- Schema versioning with TinyBase schemas module → Rejected: adds complexity, current pattern works
- Manual migration prompt to user → Rejected: violates MVP simplicity, should be transparent

**Implementation approach**:
1. Update `schema.ts` to add `weeklyTarget: { type: "number" }` to habits table
2. Update `HabitRow` type in `types.ts` to include `weeklyTarget: number`
3. Create `migrateToWeeklyTarget()` function in `migrations.ts`
4. Call migration from store initialization

**References**: 
- Existing pattern: `migrateToGroupsAndOrdering()` in `src/store/migrations.ts`
- TinyBase docs: No schema enforcement at runtime, just TypeScript types

---

### 2. Expo/React Native Picker Component Selection

**Question**: Which Expo/React Native component should we use for the weekly target dropdown (1-7 selection)?

**Decision**: Use React Native's built-in `Picker` component from `@react-native-picker/picker` (community package)

**Rationale**:
- Provides native picker UI on iOS (wheel) and Android (dropdown)
- Widely used, well-maintained community standard
- Meets accessibility requirements automatically
- Touch-friendly by default (≥44pt targets)
- Already common in Expo projects

**Alternatives considered**:
- Custom dropdown with FlatList → Rejected: reinventing wheel, accessibility concerns
- ActionSheet with buttons → Rejected: only 7 options, picker is more appropriate
- TextInput with number keyboard → Rejected: spec requires dropdown, not manual entry

**Implementation approach**:
1. Install: `npx expo install @react-native-picker/picker`
2. Create `WeeklyTargetPicker` component in `src/components/ui.tsx`
3. Use `<Picker>` with 7 `<Picker.Item>` elements (values 1-7)
4. Set `selectedValue` and `onValueChange` props
5. Style to match existing UI theme

**References**:
- Package: https://github.com/react-native-picker/picker
- Expo compatibility: Listed in Expo SDK compatibility

---

### 3. Weekly Progress Calculation Logic

**Question**: How do we calculate and display weekly progress (X/Y format) efficiently?

**Decision**: Create selector function in `selectors.ts` that queries checks table for current week

**Rationale**:
- TinyBase already tracks all checks in `checks` table with date stamps
- Week boundaries calculated using existing date utilities in `lib/dates.ts`
- Selector pattern keeps logic separate from UI components
- Reactive updates when checks change (TinyBase hooks re-render automatically)

**Alternatives considered**:
- Pre-aggregate weekly counts in separate table → Rejected: premature optimization, adds sync complexity
- Calculate on-demand in component → Rejected: violates separation of concerns
- Cache in React state → Rejected: TinyBase already optimized for reactive queries

**Implementation approach**:
1. Add `getWeeklyProgress(habitId: string)` selector in `selectors.ts`
2. Query checks table filtering by `habitId` and current week date range
3. Count completed checks where `completed === true`
4. Return `{ current: count, target: habit.weeklyTarget }`
5. Use in weekly.tsx to display "X/Y" format

**Week boundary logic**:
- Use existing date utilities or add `getWeekStart()` and `getWeekEnd()` helpers
- Assume week starts Monday (or check existing app behavior in date utils)
- Handle week transitions by comparing current date to week range

**References**:
- Existing selectors pattern in `src/store/selectors.ts`
- Checks schema: `{ habitId, date, completed, updatedAt }`

---

### 4. Migration Strategy for Existing Habits

**Question**: How should we apply the default weeklyTarget=7 to existing habits?

**Decision**: One-time migration sets `weeklyTarget: 7` for all existing habits missing the field

**Rationale**:
- Ensures data consistency - all habits have the field after migration
- Matches spec requirement (FR-013) for retroactive default application
- Follows existing migration pattern in codebase
- Transparent to users - no action required

**Alternatives considered**:
- Leave field undefined, calculate 7 at runtime → Rejected: inconsistent data model per clarification
- Prompt user to set targets → Rejected: violates MVP simplicity
- Only new habits get field → Rejected: creates two classes of habits

**Implementation approach**:
```typescript
export function migrateToWeeklyTarget(store: Store): void {
  const habitsTable = store.getTable("habits");
  
  // Check if migration already ran
  const firstHabit = Object.values(habitsTable)[0];
  if (firstHabit && typeof firstHabit.weeklyTarget === "number") {
    console.log("Weekly target migration already applied");
    return;
  }
  
  // Apply weeklyTarget: 7 to all habits
  Object.entries(habitsTable).forEach(([habitId, habit]) => {
    if (!habit.deletedAt) {
      store.setCell("habits", habitId, "weeklyTarget", 7);
    }
  });
  
  console.log("Applied weeklyTarget default to existing habits");
}
```

**Trigger point**: Call from store initialization after TinyBase loads from persistence

---

### 5. Form State Management for Dropdown

**Question**: How should we manage the weekly target value in habit create/edit forms?

**Decision**: Use React local state (useState) for form input, persist on save

**Rationale**:
- Matches existing pattern in app (habit forms use local state before saving)
- Simple and direct - no form library needed for single field
- Default value (7) set on component mount
- Value persisted to TinyBase only when user saves habit

**Alternatives considered**:
- Controlled directly by TinyBase → Rejected: creates intermediate state for unsaved changes
- Form library (react-hook-form) → Rejected: overkill for single additional field
- Uncontrolled input → Rejected: harder to set default, picker needs controlled value

**Implementation approach**:
1. In `new.tsx`: `const [weeklyTarget, setWeeklyTarget] = useState(7)`
2. In `[id].tsx`: `const [weeklyTarget, setWeeklyTarget] = useState(habit.weeklyTarget)`
3. Pass to `WeeklyTargetPicker` as `value={weeklyTarget}` and `onValueChange={setWeeklyTarget}`
4. On save, include weeklyTarget in store update call

**Edge case handling**:
- New habit: Default to 7
- Edit habit: Pre-populate with current value
- Cancel: Discard local state, don't persist

---

## Summary

All technical unknowns resolved:

1. **Schema/Migration**: Extend TinyBase schema, add migration function following existing pattern
2. **UI Component**: Use `@react-native-picker/picker` for native platform pickers
3. **Progress Calc**: Selector function queries checks table for current week
4. **Data Migration**: One-time migration applies default (7) to existing habits
5. **Form State**: React useState for form input, persist to TinyBase on save

No blockers identified. Ready for Phase 1 (data model and contracts).
