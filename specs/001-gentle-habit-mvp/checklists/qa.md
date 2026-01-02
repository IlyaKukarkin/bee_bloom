# QA Checklist: BeeBloom Gentle Habit MVP

**Purpose**: Manual testing checklist for MVP validation before release
**Created**: 2026-01-02
**Feature**: BeeBloom Gentle Habit Tracker

## Offline Functionality

- [ ] App launches without network connection
- [ ] Can create habits offline
- [ ] Can mark today's check offline
- [ ] Can mark yesterday's check offline
- [ ] App restarts offline and retains all data
- [ ] Today view loads correctly offline
- [ ] Weekly view loads correctly offline

## Habit CRUD

- [ ] Can create a new habit with title only
- [ ] Can create a habit with title + description
- [ ] Can create a habit with title + group
- [ ] Can create a habit with custom color
- [ ] Can edit existing habit (title, description, color, group)
- [ ] Can delete a habit
- [ ] Delete confirmation shows correct copy
- [ ] Deleted habit is removed from Today view
- [ ] Deleted habit is removed from Weekly view

## Daily Check Toggles

- [ ] Can toggle today's check (mark complete)
- [ ] Can toggle today's check (mark incomplete)
- [ ] Can toggle yesterday's check (mark complete)
- [ ] Can toggle yesterday's check (mark incomplete)
- [ ] Cannot toggle checks for dates other than today/yesterday
- [ ] Toggle state persists after app restart
- [ ] Checkbox animation plays smoothly on toggle

## Today View

- [ ] Empty state shows supportive copy
- [ ] Habits are grouped by group name (if present)
- [ ] Group headers display correctly
- [ ] Ungrouped habits appear in "Other" section or without group header
- [ ] Color dots match habit color
- [ ] List rows fade in with gentle animation
- [ ] Tapping habit row navigates to edit screen
- [ ] Add button navigates to new habit screen

## Weekly View

- [ ] Shows last 7 days for each habit
- [ ] Days are labeled correctly (M, T, W, T, F, S, S)
- [ ] Completed days show filled dots with habit color
- [ ] Incomplete days show muted dots
- [ ] Habits are grouped by group name
- [ ] Group sections display in alphabetical order
- [ ] "Other" group appears last (if present)
- [ ] Empty state shows supportive copy

## Navigation

- [ ] Tab navigation switches between Today and Weekly
- [ ] New habit screen has Cancel and Save buttons
- [ ] Edit habit screen has Save and Remove buttons
- [ ] Back navigation returns to previous screen
- [ ] Tab bar colors match theme (active: green, inactive: muted)

## Data Persistence

- [ ] Habits persist after app restart
- [ ] Daily checks persist after app restart
- [ ] Habit edits persist after app restart
- [ ] Deleted habits remain deleted after app restart
- [ ] No data loss when switching between tabs

## Backfill Rule

- [ ] Can mark today's check
- [ ] Can mark yesterday's check
- [ ] Cannot mark checks for 2 days ago
- [ ] Cannot mark checks for future dates
- [ ] Error handling for invalid dates (if attempted programmatically)

## Gentle UX

- [ ] Empty state copy is supportive and calm
- [ ] Delete confirmation copy is gentle
- [ ] No harsh error messages or alerts
- [ ] Animations are smooth and subtle
- [ ] Color palette feels garden-like and calming
- [ ] Typography is readable and friendly

## Platform-Specific (iOS)

- [ ] App launches on iOS Simulator
- [ ] Touch interactions work correctly
- [ ] Tab bar renders correctly
- [ ] Safe area insets respected (notch, home indicator)
- [ ] Keyboard appears for text input
- [ ] Keyboard dismisses on background tap

## Platform-Specific (Android)

- [ ] App launches on Android Emulator
- [ ] Touch interactions work correctly
- [ ] Tab bar renders correctly
- [ ] Safe area insets respected
- [ ] Keyboard appears for text input
- [ ] Keyboard dismisses on background tap
- [ ] Back button navigation works

## Notes

**Smoke Test Instructions** (T031):

To complete platform smoke tests, run the following:

### iOS Simulator
```bash
npm run ios
```

Test flow:
1. Create a habit with title "Morning walk" and group "Morning"
2. Mark today's check (toggle checkbox)
3. Mark yesterday's check via edit screen or toggle again to uncheck today
4. Restart app (close and reopen)
5. Verify habit and checks persist
6. Navigate to Weekly tab to verify 7-day grid shows

### Android Emulator
```bash
npm run android
```

Test flow: Same as iOS above

**Expected Results**: All CRUD operations work, data persists after restart, navigation works, tabs render correctly.

_Add any observations, bugs, or issues discovered during testing here._
