# Feature Specification: Weekly Habit Target

**Feature Branch**: `002-weekly-habit-target`  
**Created**: January 9, 2026  
**Status**: Draft  
**Input**: User description: "Add ability to set target number of times per week for each habit with dropdown selection and progress display"

**MVP Focus**: Capture only what is needed for the first usable path. Exclude performance targets, scalability goals, and future-proofing until after MVP validation. Automated tests are deferred until the MVP ships, unless critical defects require earlier coverage.

## Clarifications

### Session 2026-01-09

- Q: How should existing habits (created before this feature) receive the weekly target field? → A: Apply default retroactively via one-time migration when feature launches
- Q: When a user is on the habit creation/edit screen with the weekly target dropdown, should they be required to explicitly select a value, or can they proceed with the pre-selected default (7)? → A: Allow saving with pre-selected default (no explicit interaction required)
- Q: Should the dropdown follow native platform patterns (iOS picker wheel, Android dropdown) or use a custom cross-platform design? → A: Use from EXPO UI
- Q: Should there be any visual distinction when users meet or exceed their target? → A: No visual distinction, show fraction only (e.g., "3/7", "7/7")
- Q: Should the system enforce the 1-7 constraint at the data storage level, or only at the UI level? → A: Enforce at both UI and data storage level (validation on save/update)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Weekly Target for New Habit (Priority: P1)

When creating a new habit, users need to specify how many times per week they intend to perform it. For example, "Brush teeth" might be 7 times per week, while "Gym" could be 3 times per week. The interface provides a dropdown menu with values from 1 to 7, with 7 as the default selection.

**Why this priority**: This is the foundational capability - without being able to set targets on new habits, the entire feature has no value. This is the minimum viable implementation.

**Independent Test**: Can be fully tested by creating a new habit, selecting a target from the dropdown, saving, and verifying the target is stored. Delivers immediate value by allowing users to set expectations for new habits.

**Acceptance Scenarios**:

1. **Given** user is on the new habit creation screen, **When** they open the weekly target field, **Then** they see a dropdown with options 1 through 7
2. **Given** user is creating a new habit, **When** they haven't selected a weekly target, **Then** the dropdown defaults to 7 times per week
3. **Given** user has selected a weekly target from the dropdown, **When** they save the habit, **Then** the habit is created with the selected target value
4. **Given** user has created a habit with a weekly target, **When** they view the habit details, **Then** the selected target is displayed correctly

---

### User Story 2 - Edit Weekly Target for Existing Habit (Priority: P2)

Users need to adjust weekly targets for habits they've already created. Life circumstances change, and a gym routine that was 5 times per week might need to be adjusted to 3 times per week. The habit edit screen provides the same dropdown interface for modifying the target.

**Why this priority**: This enables flexibility and adaptation. While important, users can work around this limitation temporarily by deleting and recreating habits if needed during MVP testing.

**Independent Test**: Can be tested by editing an existing habit, changing the weekly target via dropdown, saving, and verifying the updated value persists. Provides value by allowing habit goal adjustments without starting over.

**Acceptance Scenarios**:

1. **Given** user is editing an existing habit, **When** they view the weekly target field, **Then** they see the currently saved target pre-selected in the dropdown
2. **Given** user is editing a habit, **When** they select a different weekly target from the dropdown, **Then** the new value is reflected in the UI
3. **Given** user has changed the weekly target, **When** they save the habit, **Then** the habit is updated with the new target value
4. **Given** user has changed the weekly target, **When** they cancel editing, **Then** the original target value is retained

---

### User Story 3 - View Weekly Progress on Weekly Screen (Priority: P1)

On the weekly overview screen, users see their progress toward each habit's weekly target displayed as a fraction (e.g., "3/5" means 3 completions out of 5 target). This provides immediate visual feedback on which habits are on track and which need attention.

**Why this priority**: This is the primary user-facing value of the feature. Without progress display, setting targets has no practical benefit. This must ship with P1 for the feature to be meaningful.

**Independent Test**: Can be tested by creating habits with different targets, marking some as complete for the week, and verifying the weekly screen shows correct progress fractions (e.g., 2/3, 5/7). Delivers immediate value by making habit progress visible at a glance.

**Acceptance Scenarios**:

1. **Given** user has habits with weekly targets set, **When** they view the weekly screen, **Then** each habit displays progress in the format "X/Y" where X is completions and Y is the target
2. **Given** user has completed a habit 3 times with a target of 7, **When** they view the weekly screen, **Then** the habit shows "3/7"
3. **Given** user has completed a habit 5 times with a target of 5, **When** they view the weekly screen, **Then** the habit shows "5/5"
4. **Given** user hasn't completed a habit yet with a target of 4, **When** they view the weekly screen, **Then** the habit shows "0/4"
5. **Given** user completes a habit during the week, **When** they return to the weekly screen, **Then** the progress counter increases (e.g., from "2/7" to "3/7")

---

### Edge Cases

- What happens when a user has an old habit created before this feature (no target set)? A one-time migration applies the default target of 7 times per week to all existing habits when the feature launches.
- How does the system handle week transitions? Progress counters reset to 0/target at the start of each new week.
- What if a user completes a habit more times than their target? Display shows the actual count even if it exceeds target (e.g., "8/7").
- How does the dropdown behave on different device sizes? The dropdown must be usable on mobile devices with touch interfaces.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dropdown input for weekly target selection when creating a new habit
- **FR-002**: Dropdown MUST contain options for 1 through 7 times per week
- **FR-003**: System MUST default the weekly target to 7 times per week when creating a new habit
- **FR-004**: System MUST allow users to save the habit with the pre-selected default value without requiring explicit dropdown interaction
- **FR-005**: System MUST persist the selected weekly target value when the habit is saved
- **FR-005a**: System MUST validate that weekly target is an integer between 1 and 7 (inclusive) at both UI and data storage level
- **FR-006**: System MUST provide the same dropdown interface for editing existing habits
- **FR-007**: System MUST display the current weekly target value pre-selected when editing an existing habit
- **FR-008**: System MUST update the weekly target when changes are saved during editing
- **FR-009**: System MUST display weekly progress for each habit on the weekly screen in "X/Y" format without visual distinction for met/exceeded targets
- **FR-010**: System MUST calculate X as the number of times the habit was completed during the current week
- **FR-011**: System MUST use Y as the weekly target value set for that habit
- **FR-012**: System MUST update the progress display when a habit is marked complete
- **FR-013**: System MUST handle habits created before this feature by applying a default target of 7 times per week via a one-time migration when the feature launches
- **FR-014**: System MUST reset weekly progress counters to 0 at the start of each new week
- **FR-015**: System MUST display actual completion count even if it exceeds the weekly target (e.g., "8/7")
- **FR-016**: Dropdown MUST use Expo UI components and be usable on mobile devices with touch interfaces

### Key Entities

- **Habit**: Represents a user's habit that they track over time
  - Weekly Target (new attribute): Integer value from 1 to 7 representing how many times per week the user aims to perform this habit
  - Default value: 7 times per week
  - Required: Yes
  - Validation: Must be an integer between 1 and 7 (inclusive), enforced at both UI and storage level

- **Weekly Progress**: Represents tracking data for a habit within a specific week
  - Completion Count: Number of times the habit was completed during the current week
  - Target: The weekly target value from the associated habit
  - Display Format: "Completion Count / Target" (e.g., "3/7")

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new habit with a weekly target selected from a dropdown in under 30 seconds
- **SC-002**: Users can edit an existing habit's weekly target and see the change persist
- **SC-003**: Users can view weekly progress for all habits on the weekly screen with progress displayed as fractions (e.g., "3/7", "5/5")
- **SC-004**: 100% of habits display accurate progress counts that update immediately when completions are marked
- **SC-005**: The dropdown interface is usable on mobile devices with touch screens
- **SC-006**: Users completing the primary flow (create habit → set target → complete habit → view progress) successfully see their progress reflected within 5 seconds
- **SC-007**: Existing habits without targets automatically default to 7 times per week without user intervention

## Assumptions

- Users understand the concept of weekly goals and targets (common in habit tracking apps)
- A week starts on Monday and ends on Sunday (or follows system locale settings if already implemented)
- The dropdown will use Expo UI components and be styled consistently with the existing UI design system
- Users primarily use values 3, 5, and 7 for weekly targets based on common habit tracking patterns
- The weekly screen already has a mechanism to count habit completions per week
- Mobile touch targets for the dropdown will meet accessibility standards (minimum 44x44 points)

## Out of Scope

- Customizing the start day of the week (uses existing app behavior)
- Setting targets in formats other than "times per week" (e.g., daily, monthly)
- Targets with decimal values (e.g., 3.5 times per week)
- Advanced goal setting (streaks, milestones, rewards)
- Visual indicators beyond the fraction display (progress bars, color coding)
- Notifications or reminders based on target progress
- Historical tracking of how often users met their weekly targets
- Batch editing of targets for multiple habits at once
- Templates or suggested targets based on habit type
