import { Store } from 'tinybase';
import { HabitRow, HabitGroupRow } from './types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Migration: Add habitGroups table and order fields
 * - Create groups from existing habit `group` strings
 * - Assign sequential orders to groups and habits (by createdAt)
 * - Set groupId on habits (null for ungrouped)
 */
export function migrateToGroupsAndOrdering(store: Store): void {
  const habitsTable = store.getTable('habits');
  const existingGroups = store.getTable('habitGroups');

  // Skip if migration already ran (habitGroups exist or habits have order field)
  if (Object.keys(existingGroups).length > 0) {
    console.log('Migration already applied, skipping');
    return;
  }

  const firstHabit = Object.values(habitsTable)[0] as any;
  if (firstHabit && typeof firstHabit.order === 'number') {
    console.log('Habits already have order field, skipping migration');
    return;
  }

  // Collect unique group names from existing habits
  const groupNames = new Set<string>();
  const habitsByGroup = new Map<string | null, HabitRow[]>();

  Object.values(habitsTable).forEach((row: any) => {
    if (row.deletedAt) return; // Skip deleted habits

    const groupName = row.group?.trim() || null;
    if (groupName) groupNames.add(groupName);

    if (!habitsByGroup.has(groupName)) {
      habitsByGroup.set(groupName, []);
    }
    habitsByGroup.get(groupName)!.push(row as HabitRow);
  });

  // Create HabitGroup rows from unique group names, sorted alphabetically
  const sortedGroupNames = Array.from(groupNames).sort();
  const groupIdMap = new Map<string, string>();

  sortedGroupNames.forEach((groupName, index) => {
    const groupId = generateId();
    groupIdMap.set(groupName, groupId);

    const groupRow: HabitGroupRow = {
      id: groupId,
      title: groupName,
      color: null,
      order: index * 10, // Spacing for easy inserts
      createdAt: new Date().toISOString(),
    };

    store.setRow('habitGroups', groupId, groupRow);
  });

  // Update each habit: set groupId and order within its group
  habitsByGroup.forEach((habits, groupName) => {
    const groupId = groupName ? groupIdMap.get(groupName) || null : null;

    // Sort habits by createdAt to preserve visual order
    habits.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    habits.forEach((habit, index) => {
      store.setPartialRow('habits', habit.id, {
        groupId,
        order: index * 10,
      });

      // Remove old `group` field if it exists
      store.delCell('habits', habit.id, 'group');
    });
  });

  console.log(`Migration complete: created ${sortedGroupNames.length} groups`);
}
