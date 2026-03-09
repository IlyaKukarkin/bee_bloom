# Feature Specification: iOS Widget Display Recovery

**Feature Branch**: `001-fix-ios-widget-display`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "fix IOS widget for the app. Right now it's just all black and empty"

**MVP Focus**: Restore a reliable, user-visible home screen widget experience for iOS where the widget renders meaningful habit content instead of a black or empty state. Limit scope to the display and refresh behavior needed for a first usable widget release.

## Clarifications

### Session 2026-03-09

- Q: What defines an "eligible habit" for widget display? → A: Active habits only (non-archived, not deleted)
- Q: Which widget size should be the MVP priority for fixing the black screen issue? → A: All three sizes (systemSmall, systemMedium, systemLarge)
- Q: What specific habit information should the widget display for each habit? → A: Small - habit name and completion status for today; Medium and Large - habit name, completion status for today, weekly target progress
- Q: How many habits should the widget display at once? → A: Size dependent - systemSmall shows 4 habits, systemMedium shows 4 habits (with weekly data), systemLarge shows 8 habits (with weekly data)
- Q: How should habits be ordered when there are more eligible habits than the widget capacity? → A: User-defined priority/order from app

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Habit Info On Home Screen (Priority: P1)

As an iOS user, I can add the BeeBloom widget and immediately see readable habit information instead of a black or blank block.

**Why this priority**: The widget has no value unless content is visible. This is the core user outcome.

**Independent Test**: Add the widget to a device home screen with at least one active habit and confirm the widget displays text and visual structure without opening the app.

**Acceptance Scenarios**:

1. **Given** the user has active habits and adds the widget, **When** the widget is first rendered, **Then** it shows non-empty habit content and visible styling.
2. **Given** the widget is present on the home screen, **When** the user returns to the home screen later, **Then** the widget still displays readable content rather than a black or empty surface.

---

### User Story 2 - See Correct Empty State (Priority: P2)

As an iOS user with no eligible habits, I see a clear empty-state message in the widget rather than a blank display.

**Why this priority**: Users without data still need understandable feedback so the widget feels intentional and functional.

**Independent Test**: Clear or disable all eligible habits, then verify the widget shows a user-readable empty-state message.

**Acceptance Scenarios**:

1. **Given** no eligible habits are available for display, **When** the widget updates, **Then** it shows a clear placeholder message explaining what to do next.

---

### User Story 3 - Reflect Habit Changes (Priority: P3)

As an iOS user, when my habit list changes in the app, the widget updates within a reasonable time and remains readable.

**Why this priority**: A widget that stays stale or turns blank after updates undermines trust in the feature.

**Independent Test**: Change a habit in the app, return to the home screen, and verify the widget content refreshes and still renders correctly.

**Acceptance Scenarios**:

1. **Given** the widget already displays habit content, **When** the user edits relevant habit data in the app, **Then** the widget reflects the updated data on its next refresh cycle without becoming black or empty.

### Edge Cases

- Widget is added before the app has ever been opened after installation.
- User switches between light and dark system appearance and widget content remains readable.
- Shared data is temporarily unavailable; widget falls back to a non-blank error or placeholder state.
- Habit names are long; widget truncates safely without clipping all content.
- User has fewer eligible habits than the widget capacity (e.g., 2 habits in systemLarge which supports 8); widget displays available habits without blank spaces causing visual issues.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a non-blank, non-black default widget layout whenever the widget appears on the iOS home screen.
- **FR-002**: The system MUST display habit information according to widget size: systemSmall shows up to 4 habits (habit name and today's completion status); systemMedium shows up to 4 habits (habit name, today's completion status, and weekly target progress); systemLarge shows up to 8 habits (habit name, today's completion status, and weekly target progress).
- **FR-003**: The system MUST present a clear empty-state message when no eligible habit data is available.
- **FR-004**: The system MUST provide a fallback display state when shared data cannot be loaded, so the widget never appears visually empty.
- **FR-005**: The system MUST keep widget text and key visuals readable across supported iOS appearance modes.
- **FR-006**: The system MUST refresh displayed widget content after relevant habit changes within the normal widget refresh window.
- **FR-007**: The system MUST show consistent content structure across all three supported widget sizes: systemSmall, systemMedium, and systemLarge.
- **FR-008**: The system MUST ensure first-load widget rendering succeeds for users who add the widget before opening the app in the same session.
- **FR-009**: The system MUST order displayed habits according to user-defined priority/order from the app when more eligible habits exist than the widget capacity allows.

### Key Entities *(include if feature involves data)*

- **Widget Display Entry**: A single snapshot of content shown in the widget at a point in time, including title text, supporting text, status, and timestamp.
- **Eligible Habit Summary**: Minimal habit information suitable for widget display. Only active habits (non-archived, not deleted) are eligible. Required attributes: habit name, today's completion status, user-defined order/priority. Optional attributes (for medium/large widgets): weekly target progress.
- **Widget Display State**: The current mode shown by the widget (content, empty state, or fallback/error placeholder).

### Assumptions

- The feature addresses all three iOS widget families (systemSmall, systemMedium, systemLarge) configured in the project.
- The app maintains a user-defined habit order/priority that can be shared with the widget for display ordering.
- Standard iOS widget refresh constraints apply and are acceptable for MVP.

### Dependencies

- iOS widget entitlement and app group configuration remain valid for both app and widget targets.
- The app continues writing widget-consumable habit data to the shared location used by the widget.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of first-time widget placements show visible text/content within 5 seconds of placement.
- **SC-002**: In a 20-run regression pass, 0 runs show a fully black or fully blank widget state after placement or refresh.
- **SC-003**: For users with no eligible habits, 100% of tested placements show an explanatory empty state instead of blank output.
- **SC-004**: After a relevant habit change, updated widget content is visible within 15 minutes in at least 95% of test runs.
