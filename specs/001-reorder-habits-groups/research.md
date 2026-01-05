# Research – Habit and Group Reordering

## Drag-and-drop approach (Expo RN)
- Decision: Use Expo-friendly gesture/reanimated stack with `react-native-draggable-flatlist` for both habit and group lists; trigger via long press.
- Rationale: Works with Expo SDK 54, supports placeholders, auto-scroll, and cancellation; minimizes custom gesture math while allowing custom renderers for habit/group items.
- Alternatives considered: Custom PanResponder/Reanimated implementation (more code and edge cases), `react-native-drax` (heavier API surface), `@shopify/flash-list` + manual DnD (requires more infra for drag overlays).

## Ordering data model
- Decision: Add `order` (number) to habits; introduce `habitGroups` table with `id`, `title`, optional `color`, `order`; habits reference groups by `groupId` (nullable for ungrouped).
- Rationale: Explicit ordering per entity enables deterministic rendering and cross-group moves; separate group table is required to reorder groups and to keep group metadata.
- Alternatives considered: Deriving order from array position (no persistence, fragile), storing per-group order arrays (complex sync with Tinybase rows), keeping implicit groups as strings (cannot reorder groups).

## Persistence and migration
- Decision: Keep Tinybase + Expo SQLite/AsyncStorage persister; migrate existing data by creating groups from distinct habit `group` strings, assigning sequential `order` to groups and habits based on existing appearance (createdAt or current listing), and defaulting ungrouped habits to a null group.
- Rationale: Reuses current offline-first setup with minimal risk; migration can run once on startup before rendering the new UI.
- Alternatives considered: New storage layer (overkill for MVP), remote sync (out of scope), complex multi-version migrations (unneeded for single-step schema addition).

## UX safeguards
- Decision: Long-press to enter drag mode; show lifted card + placeholder; drop outside valid zones cancels; enable auto-scroll near edges; show group-only mode when dragging groups (habits hidden); allow escape/cancel gesture.
- Rationale: Reduces accidental moves, clarifies drop targets, and keeps flows touch-friendly.
- Alternatives considered: Tap-to-reorder with arrows (slower UX), always-on drag handles (risk of accidental drags), disabling auto-scroll (blocks long lists).
