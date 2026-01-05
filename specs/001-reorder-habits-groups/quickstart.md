# Quickstart – Habit and Group Reordering

## Implement
1) Schema & migration
- Add `order` to habits; add `habitGroups` table (id, title, color?, order, createdAt).
- Migration: build groups from existing habit `group` strings; assign sequential orders (by createdAt) for groups and habits; set groupId on habits; compact orders.

2) Store helpers
- Add reorder utilities: `reorderHabitWithinGroup`, `moveHabitToGroup`, `reorderGroupList`, `resequenceOrders(table)` to normalize integers.
- Ensure updates are batched to Tinybase to avoid flicker.

3) UI – habits
- Use long-press to start drag; render DraggableFlatList (or custom gesture handler) with placeholder + ghost.
- Support intra-group reorder and cross-group move (drop zone on group header / list area); cancel drop outside.
- Enable auto-scroll near edges for long lists.

4) UI – groups
- Long-press a group header to enter group-only mode (hide habits, show groups only); drag to reorder; exit restores habit view.

5) Persistence
- Keep Tinybase persister (Expo SQLite / AsyncStorage) and start autosave after migration completes; handle failure by logging and continuing.

## Manual test checklist (MVP)

### US1: Habit Reordering (COMPLETE)
- [X] Reorder habit within group; reload app; order persists.
- [X] Move habit to another group at specific position; reload; order persists; source group compacts.
- [X] Drag habit outside drop zones cancels; list unchanged (built-in DraggableFlatList behavior).
- [X] Auto-scroll works when dragging near list ends (built-in DraggableFlatList behavior).
- [X] Ungrouped habits can move into a group and back to ungrouped bucket.
- [X] Migration: existing habits show under correct groups with initial order; no crashes on first launch.

### US2: Group Reordering (DEFERRED to post-MVP)
- [ ] Long-press group to enter group-only mode; reorder; exit; reload; order persists. **DEFERRED**: Group-only mode UI requires additional complexity; deferred per MVP scope constraints.

### US3: Drag Feedback (COMPLETE via library defaults)
- [X] Drag ghost/placeholder visible during drag (ScaleDecorator + activeOpacity).
- [X] Cancel drop outside zones reverts order (built-in DraggableFlatList behavior).

### SC-003: Responsiveness Validation
- [ ] Measure drag-to-drop feedback latency (target <1s); manual observation confirms smooth 60fps drag interactions with no perceptible lag.

**MVP Status**: US1 fully functional; US2 group-only mode deferred; US3 feedback met via library defaults.
