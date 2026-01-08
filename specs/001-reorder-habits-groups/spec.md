# Feature Specification: Habit and Group Reordering

**Feature Branch**: `[001-reorder-habits-groups]`  
**Created**: January 5, 2026  
**Status**: Draft  
**Input**: User description: "I want to be able to change the order of habits. And change the order of HabitGroups. By holding the habit it should appear as draggable, then user can drag it to another position and even to another group. Same with groups, by holding down the group all habits should be hidden and only groups visible. then user can drag and drop habit group to a different position"

**MVP Focus**: Capture only what is needed for the first usable path. Exclude performance targets, scalability goals, and future-proofing until after MVP validation. Automated tests are deferred until the MVP ships, unless critical defects require earlier coverage.

## Clarifications

### Session 2026-01-05
- Q: How should ungrouped habits be treated during reordering? → A: Treat "Ungrouped" as a first-class bucket with its own order; users can drag habits into or out of it.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Reorder habits (Priority: P1)

As a habit tracker, I want to press-and-hold a habit to drag it to a new position within a group or into another group so that my daily routine order matches how I work.

**Why this priority**: Ordering habits unlocks immediate personal value and removes friction for the core daily workflow.

**Independent Test**: A single habit can be held, dragged, and dropped to a new position (same group or different group) with the new order persisting on reload.

**Acceptance Scenarios**:

1. **Given** a group with multiple habits, **When** I hold a habit until it becomes draggable and drop it elsewhere in the same group, **Then** the list reorders and the new position persists after reopening the app.
2. **Given** two groups each with habits, **When** I drag a habit from its current group onto another group and place it, **Then** the habit moves to the target group at the chosen position and is removed from the original group.

---

### User Story 2 - Reorder groups (Priority: P2)

As a planner, I want to press-and-hold a HabitGroup to enter a group-only view and drag groups to new positions so I can arrange categories in the order I review them.

**Why this priority**: Group ordering sets the structure for all habits and reduces navigation friction across the app.

**Independent Test**: A group can be long-pressed to hide habits, dragged to a new position among groups, dropped, and the new order remains after returning to normal view and after relaunch.

**Acceptance Scenarios**:

1. **Given** multiple HabitGroups, **When** I hold one group to enter group drag mode and drop it into a new position, **Then** the groups re-sequence and stay ordered after exiting drag mode and reopening the app.

---

### User Story 3 - Clear drag feedback and cancel (Priority: P3)

As a user, I want obvious visual feedback while dragging and a way to cancel without committing changes so I do not accidentally reorder items.

**Why this priority**: Clear feedback reduces mistakes and support issues while protecting user trust.

**Independent Test**: While dragging, placeholders and highlights show intended drop targets; releasing outside a target cancels the move and restores the prior order.

**Acceptance Scenarios**:

1. **Given** I start dragging a habit, **When** I release it outside any valid drop zone, **Then** the habit snaps back to its original place and the list remains unchanged.
2. **Given** I start dragging a group, **When** I drag near other groups, **Then** I see a preview position or highlight before dropping, and dropping outside returns the group to its original order.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Dragging the only habit in a group should still allow moving it to another group; the source group may become empty but must remain visible if empty groups are allowed.
- Dropping a habit or group outside any valid target should cancel the move and retain the prior order.
- Moving a habit into an empty group should place it at position one and show the new order immediately.
- Auto-scroll should occur when dragging near list edges so items can be placed in long lists without obstruction.
- Reordering must be disabled if the item is in a read-only or locked state (e.g., while syncing), and the user should see non-intrusive feedback.
- Ungrouped bucket behaves like a group: it is rendered as its own section, supports intra-bucket reordering, and accepts drops from any group; moving out removes the habit from the bucket.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Users MUST be able to press-and-hold (or use an affordance) on a habit to enter drag mode without triggering habit completion or navigation.
- **FR-002**: System MUST allow reordering a habit within its current group via drag-and-drop, updating the on-screen order immediately.
- **FR-003**: System MUST allow moving a habit between groups via drag-and-drop, inserting it at the drop position and removing it from the source group.
- **FR-004**: System MUST persist the updated habit order and group assignment so the new order appears after app relaunch or navigation away/return.
- **FR-005**: Users MUST be able to cancel a drag (e.g., release outside targets or use a cancel/escape action) with no change to ordering.
- **FR-006**: System MUST provide drag feedback (e.g., placeholder, highlight, or ghost) that shows the pending drop target before release for both habits and groups.
- **FR-007**: Users MUST be able to press-and-hold a HabitGroup to enter group-only drag mode where habits are hidden and groups become draggable.
- **FR-008**: System MUST allow reordering groups in group-only mode and persist the new group order across sessions.
- **FR-009**: System MUST restore normal viewing mode (habits visible) after completing or cancelling group drag mode without losing any habit data.
- **FR-010**: System SHOULD auto-scroll the list when dragging near the viewport edges so items can be moved to positions not currently visible.
- **FR-011**: System MUST expose an "Ungrouped" bucket that behaves like a group: visible section, intra-bucket reorder, and allows dragging habits into or out of it.

### Key Entities *(include if feature involves data)*

- **Habit**: User-defined routine item with attributes such as title, belonging group, and display order within that group.
- **HabitGroup**: Category container with attributes such as name, order among groups, and list of assigned habits. The "Ungrouped" bucket is treated as a first-class group-equivalent (null groupId) with its own order.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: At least 90% of test users can reorder a habit within the same group on the first attempt without guidance, with the change persisting after relaunch.
- **SC-002**: At least 90% of test users can move a habit to a different group within two attempts, with the new placement persisting after relaunch.
- **SC-003**: Group drag-and-drop completes with visible reordering feedback and updated order within 1 second of drop in 95% of interactions.
- **SC-004**: Fewer than 5% of recorded drag attempts result in an unintended reorder (i.e., cancelled drags leave ordering unchanged and confirmed drops match the user’s placement).

## Assumptions

- Reordering is available to signed-in users for their own habits and groups; shared or read-only views are out of scope.
- Long-press/hold is the primary trigger for drag on touch; desktop or pointer users may use click-and-drag with the same affordances.
- Persisted ordering is per user profile and does not require multi-device sync conflict resolution beyond last-write-wins.
- Ungrouped bucket is always available and behaves like a group for ordering and drop targets.
