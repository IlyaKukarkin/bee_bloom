# Feature Specification: BeeBloom Gentle Habit MVP

**Feature Branch**: `001-gentle-habit-mvp`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: User description: "BeeBloom is a 'for my girlfriend' app. BeeBloom is a gentle habit tracker that should feel like a quiet garden, not a productivity app. Offline-first habit tracker; No authentication; Daily habits with one checkmark per day; Create/edit/delete habits (title + optional description); Group habits by color and name; Today view; Weekly progress view; Local-only storage; Optional OS backup; No notifications; Gentle animations and supportive copy."

**MVP Focus**: Capture only what is needed for the first usable path. Exclude performance targets, scalability goals, and future-proofing until after MVP validation. Automated tests are deferred until the MVP ships, unless critical defects require earlier coverage.

## Clarifications

### Session 2026-01-02
- Q: How far back can users backfill daily checkmarks? → A: Allow backfill only for the previous day; no earlier days and no future days.
- Q: Which platforms are in scope for MVP? → A: Both iOS and Android; local-only first with cloud sync deferred.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log a Habit Today (Priority: P1)

A person opens BeeBloom offline, creates a habit, and marks today's checkmark so they feel they started.

**Why this priority**: Delivers the core promise of a gentle, offline habit tracker in one sitting.

**Independent Test**: Start fresh offline, create a habit, mark today's check, close and reopen the app offline, and confirm the habit and today's completion persist.

**Acceptance Scenarios**:

1. **Given** the user is offline with no habits, **When** they create a habit with a title and optional description, **Then** the habit saves locally and appears in the list immediately.
2. **Given** a habit exists, **When** the user taps today's checkmark, **Then** the day records as completed with a visible state change that persists after app restart.

---

### User Story 2 - See Today's Plan (Priority: P2)

The user views a Today screen that gently lists all habits with their daily check state and supportive copy.

**Why this priority**: Provides the daily anchor that encourages a calm return and quick action.

**Independent Test**: With at least one habit present, open Today and confirm habits display with single checkmarks and supportive messaging; toggling today's state updates immediately and survives app restart offline.

**Acceptance Scenarios**:

1. **Given** habits exist, **When** the user opens Today, **Then** all habits show with one check slot for the current day and supportive copy for empty states.
2. **Given** a habit is completed today, **When** the user revisits Today, **Then** the completed state remains without needing network access.

---

### User Story 3 - Review Week and Organize (Priority: P3)

The user reviews the past 7 days of completions per habit and groups habits by color/name for a calming overview.

**Why this priority**: Offers gentle progress reflection and simple organization without adding pressure.

**Independent Test**: With a few days of checkmarks recorded, open the weekly view to see a 7-day history per habit; assign a color and group name to habits and verify the grouping appears in both Today and weekly views offline.

**Acceptance Scenarios**:

1. **Given** a habit has history, **When** the user opens the weekly view, **Then** the last 7 days display with completed vs. missed indicators for that habit.
2. **Given** habits are assigned colors and group names, **When** the user views Today or weekly progress, **Then** habits appear with their color chips and grouped labels for gentle visual organization.

### Edge Cases

- Offline first launch and subsequent opens must fully work; no blocking network prompts.
- Toggling today's checkmark multiple times keeps a single final state (completed or not) for the day.
- Backfill allowed only for the previous calendar day; no future-day entries.
- Editing a habit's title/description/color/group does not erase past daily check history.
- Deleting a habit removes it and its recorded checkmarks from views.
- Date rolls at local midnight; daylight savings or time zone shifts still keep one check per calendar day.
- Optional OS-level backup/restore should carry habits and daily check history when the OS provides it; app should remain functional without backup configured.
- MVP supports iOS and Android; data remains local to each device with no cross-device sync in MVP.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide offline-first local storage for all habit data and daily checkmarks; all core actions must work without network.
- **FR-002**: Allow creating a habit with a required title and optional description.
- **FR-003**: Allow editing habit title, description, color, and group name without losing history.
- **FR-004**: Allow deleting a habit; deletion removes its check history and hides it from all views after user confirmation.
- **FR-005**: Support one checkmark per habit per calendar day, with a clear completed vs. not-completed state; allow backfill only for the previous day and forbid future days.
- **FR-006**: Present a Today view listing all habits with their current-day check state and supportive/gentle copy when nothing is completed.
- **FR-007**: Present a weekly progress view showing the past 7 days of completion per habit in a calm, readable layout.
- **FR-008**: Allow grouping habits by color and group name; show these identifiers in Today and weekly views for visual organization.
- **FR-009**: Persist data locally only; no authentication, accounts, or remote sync in MVP.
- **FR-010**: Offer optional OS-level backup/restore so the OS can back up local data when available; app functions without it.
- **FR-011**: Include gentle animations and supportive copy that reinforce a quiet, garden-like feel without urgency cues.
- **FR-012**: Do not include notifications or reminders in the MVP.
- **FR-013**: Ship on both iOS and Android with equivalent offline-first behavior; data stays local per device; cloud sync is explicitly out of MVP.

### Key Entities *(include if feature involves data)*

- **Habit**: Title (required), description (optional), color, group name, created/deleted timestamps.
- **DailyCheck**: Habit reference, calendar date, completion state, timestamp of last change.
- **HabitGroup (implicit via habit fields)**: Color and group name values used for grouping and display; no separate management UI beyond habit fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can create a habit and record today's completion offline in under 2 minutes from launch.
- **SC-002**: Today view shows all habits with current-day states within 2 seconds of opening the app from a cold start offline.
- **SC-003**: Weekly view displays the last 7 days of completion for each habit, and users can identify completion patterns for at least 3 habits within 10 seconds of opening the view.
- **SC-004**: At least 80% of pilot users complete daily check-ins on 5 of 7 days in their first week using the MVP without notifications.
