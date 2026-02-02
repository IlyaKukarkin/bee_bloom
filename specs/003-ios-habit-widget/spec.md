# Feature Specification: iOS Home Screen Widget for Habit Tracking

**Feature Branch**: `003-ios-habit-widget`  
**Created**: 2026-02-02  
**Status**: Draft  
**Input**: User description: "let's add IOS widget to the app, that will display habits. Depending on the size we will fit as many as we can. Once user clicks on the habit to complete it. We will remove it from the list of todays habits"

**MVP Focus**: Capture only what is needed for the first usable path. Exclude performance targets, scalability goals, and future-proofing until after MVP validation. Automated tests are deferred until the MVP ships, unless critical defects require earlier coverage.

## Clarifications

### Session 2026-02-02
- Q: When showing incomplete habits in the widget, how should habits be ordered if the user has more habits than can fit? → A: Habits in the order shown in Today view (respecting user's chosen organization)
- Q: What specific message should the widget display when no habits exist? → A: "Add your first habit in BeeBloom" and clicking the widget should open the app
- Q: What specific message should the widget display when all habits are completed for the day? → A: "All habits completed today! 🌸"
- Q: How long should the widget wait before retrying if it fails to update after a habit is completed in the main app? → A: Retry every 5 seconds up to 3 times (15 seconds total)
- Q: When there are more habits than can fit in the widget, what format should the overflow indicator use? → A: "+N more" (e.g., "+3 more")

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Today's Habits on Home Screen (Priority: P1)

A user adds the BeeBloom widget to their iOS home screen and immediately sees their incomplete habits for today without opening the app.

**Why this priority**: Delivers the core widget value - quick visibility of pending habits directly on the home screen, reducing friction to stay engaged with habits.

**Independent Test**: Add widget to home screen with existing habits, verify incomplete habits display correctly, and confirm the widget updates when habits are completed in the main app.

**Acceptance Scenarios**:

1. **Given** the user has multiple habits with some completed and some incomplete today, **When** they add the BeeBloom widget to their home screen, **Then** only today's incomplete habits display in the widget.
2. **Given** the widget is showing habits, **When** the user completes a habit in the main app, **Then** that habit disappears from the widget within a few seconds and remaining habits shift up.
3. **Given** all habits are completed for today, **When** the widget refreshes, **Then** the widget displays supportive completion message instead of habits list.

---

### User Story 2 - Complete Habit from Widget (Priority: P1)

A user taps on a habit in the widget to mark it complete without opening the full app.

**Why this priority**: Core widget interaction that provides the quick-action capability users expect from widgets - completing habits with a single tap.

**Independent Test**: Tap a habit in the widget, confirm it marks as complete, disappears from the widget, and persists as completed when opening the main app.

**Acceptance Scenarios**:

1. **Given** the widget displays incomplete habits, **When** the user taps on a habit, **Then** the habit marks as complete, immediately disappears from the widget, and shows as completed in the main app.
2. **Given** a user taps to complete the last remaining habit in the widget, **When** the completion registers, **Then** the widget shows a supportive completion message.
3. **Given** a habit is completed via widget, **When** the user opens the main app, **Then** the habit displays with today's checkmark filled and the completion timestamp matches the widget tap time.

---

### User Story 3 - Adapt to Widget Size (Priority: P2)

A user selects different widget sizes (small, medium, large) and the widget displays an appropriate number of habits for each size.

**Why this priority**: Provides flexibility for users to choose how much information they want visible based on available home screen space.

**Independent Test**: Add widgets of different sizes to home screen and verify each displays the maximum appropriate number of habits without truncation or overflow.

**Acceptance Scenarios**:

1. **Given** the user adds a small widget, **When** it loads, **Then** it displays 2-3 habits maximum with titles visible and tap targets clear.
2. **Given** the user adds a medium widget, **When** it loads, **Then** it displays 4-6 habits with titles and optional group colors visible.
3. **Given** the user adds a large widget, **When** it loads, **Then** it displays 8-10 habits with full titles, group colors, and clear completion targets.
4. **Given** the user has more habits than fit in the widget size, **When** the widget loads, **Then** it shows the number that fits without scrolling and indicates additional habits exist using format "+N more" (e.g., "+3 more").

---

### User Story 4 - Open App When No Incomplete Habits (Priority: P3)

A user taps the widget when there are no incomplete habits (all completed or no habits), and the app opens to the Today view.

**Why this priority**: Provides navigation to full app for users who want more detail or to perform actions not available in the widget.

**Independent Test**: With no incomplete habits, tap the widget and verify the app opens to Today view.

**Acceptance Scenarios**:

1. **Given** the widget has no incomplete habits, **When** the user taps the widget, **Then** the app opens to the Today view.

### Edge Cases

- What happens when no habits exist? → Widget displays "Add your first habit in BeeBloom" and tapping the widget opens the app to Today view.
- What happens when all habits are completed? → Widget displays "All habits completed today! 🌸"
- What happens at midnight when the day rolls over? → Widget refreshes to show today's habits (all incomplete again) and respects local timezone.
- What happens when the app is in background and widget taps occur? → Completions register immediately without requiring app to be in foreground.
- What happens if device is offline? → Widget continues to function with local data; completions sync to local storage immediately.
- What happens when habit is deleted in app? → Widget updates within seconds to remove the deleted habit.
- What happens when widget size has more capacity than available habits? → Widget shows all habits without empty placeholders.
- What happens when habit titles are very long? → Titles truncate with ellipsis while maintaining readability.
- What happens when user has many habit groups? → Widget shows habits in Today view order (respecting group order and habit creation order within groups) up to widget size limit.
- What happens if the widget fails to update after changes in the main app? → Widget retries every 5 seconds up to 3 times (15 seconds total), then waits for next scheduled refresh.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Widget MUST display only today's incomplete habits, excluding habits already completed today, in the same order as shown in the Today view (respecting group order and habit creation order within groups).
- **FR-002**: Widget MUST support three size variants: small (2-3 habits), medium (4-6 habits), and large (8-10 habits).
- **FR-003**: Widget MUST allow users to mark a habit complete by tapping on the habit item in the widget.
- **FR-004**: Widget MUST immediately remove completed habits from the widget display after tap.
- **FR-005**: Widget MUST reflect habit completions made in the main app within 5 seconds, with retry attempts every 5 seconds up to 3 times if update fails.
- **FR-006**: Widget MUST persist completion data to local storage when user taps to complete a habit.
- **FR-007**: Widget MUST display habit titles clearly with truncation for long names using ellipsis.
- **FR-008**: Widget MUST show habit group colors (if assigned) as visual indicators alongside habit names.
- **FR-009**: Widget MUST display "All habits completed today! 🌸" when all habits are completed for today.
- **FR-010**: Widget MUST display "Add your first habit in BeeBloom" when no habits exist, and tapping the widget opens the app.
- **FR-011**: Widget MUST refresh at midnight (local timezone) to reset to new day's habit list.
- **FR-012**: Widget MUST open the main app to Today view only when there are no incomplete habits and the user taps the widget (no habits or all completed).
- **FR-013**: Widget MUST function offline using local storage without requiring network access.
- **FR-014**: Widget MUST maintain visual consistency with app's gentle, garden-like aesthetic using soft colors and supportive copy.
- **FR-015**: When habits exceed widget capacity, widget MUST indicate additional habits exist using format "+N more" where N is the count of hidden habits (e.g., "+3 more").
- **FR-016**: Widget MUST update within 5 seconds when habits are created, edited, or deleted in the main app.

### Key Entities *(include if feature involves data)*

- **Widget Display**: Rendered view showing subset of today's incomplete habits, formatted for specific widget size.
- **Habit Reference**: Pointer to habit data from main app storage including title, group color, completion state for today.
- **Widget Interaction**: Tap event on habit item that triggers completion and removes from display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a habit from the widget in under 3 seconds from unlock to tap.
- **SC-002**: Widget displays accurate habit list within 5 seconds of app data changes (completion, creation, deletion).
- **SC-003**: 90% of widget interactions result in successful habit completion without requiring app launch.
- **SC-004**: Widget visual design receives positive feedback from 80% of pilot users for matching app's gentle aesthetic.
- **SC-005**: Users with widgets installed complete at least 20% more habits per day compared to app-only users (measured over 14 days).

## Assumptions *(mandatory)*

- Users have iOS 14 or later (minimum iOS version supporting modern widgets with interactivity).
- Users understand standard iOS widget behaviors (tap to interact, long-press to configure).
- Widget will use the same local storage mechanism as the main app for data consistency.
- Widget updates use iOS WidgetKit timeline mechanism with appropriate refresh intervals.
- Small widget size is approximately 2x2 home screen cells, medium is 4x2, large is 4x4 (standard iOS sizes).
- Widget will prioritize habits by the same order shown in Today view (respecting group order and creation order).
- Completion from widget has identical effect as completion from main app (same timestamp, same state change).
- Widget performance should not noticeably impact device battery life with standard refresh intervals.

## Out of Scope for MVP *(mandatory)*

- Widget configuration options (custom habit selection, manual ordering in widget).
- Multiple widgets showing different habit groups simultaneously.
- Android widget support (focus on iOS first to validate concept).
- Widget statistics or progress visualizations beyond simple completion state.
- Undo completion action directly from widget.
- Swipe gestures or complex interactions beyond simple tap-to-complete.
- Lock screen widgets or StandBy mode widgets.
- Interactive charts or weekly view in widget.
- Customizable widget themes or color schemes independent of app settings.
- Widget animations beyond standard fade transitions.
