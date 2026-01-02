import { Store } from 'tinybase';
import { HabitRow } from './types';

// Default colors from garden-tone palette
const DEFAULT_COLORS = [
  '#3c7c5a', // accent green
  '#8fb89e', // muted green
  '#d88c4a', // warm orange
  '#7a9cb8', // soft blue
  '#b8a89e', // taupe
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getDefaultColor(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export function createHabit(
  store: Store,
  habit: Omit<HabitRow, 'id' | 'createdAt' | 'deletedAt'>
): string {
  const id = generateId();
  const createdAt = new Date().toISOString();

  // Get current habit count for color rotation
  const habitCount = Object.keys(store.getTable('habits')).filter((hId) => {
    const deleted = store.getCell('habits', hId, 'deletedAt');
    return !deleted;
  }).length;

  const color = habit.color || getDefaultColor(habitCount);

  store.setRow('habits', id, {
    id,
    title: habit.title.trim(),
    description: habit.description?.trim() || null,
    color,
    group: habit.group?.trim() || null,
    createdAt,
    deletedAt: null,
  });

  return id;
}

export function updateHabit(
  store: Store,
  id: string,
  updates: Partial<Pick<HabitRow, 'title' | 'description' | 'color' | 'group'>>
): void {
  const existing = store.getRow('habits', id);
  if (!existing || existing.deletedAt) {
    throw new Error(`Habit ${id} not found or deleted`);
  }

  const newRow: Partial<HabitRow> = {};
  if (updates.title !== undefined) {
    newRow.title = updates.title.trim();
  }
  if (updates.description !== undefined) {
    newRow.description = updates.description?.trim() || null;
  }
  if (updates.color !== undefined) {
    newRow.color = updates.color;
  }
  if (updates.group !== undefined) {
    newRow.group = updates.group?.trim() || null;
  }

  store.setPartialRow('habits', id, newRow);
}

export function deleteHabit(store: Store, id: string): void {
  const existing = store.getRow('habits', id);
  if (!existing || existing.deletedAt) {
    throw new Error(`Habit ${id} not found or already deleted`);
  }

  // Soft delete: set deletedAt timestamp
  store.setCell('habits', id, 'deletedAt', new Date().toISOString());

  // Remove all associated daily checks
  const checkIds = Object.keys(store.getTable('checks')).filter((checkId) => {
    return store.getCell('checks', checkId, 'habitId') === id;
  });

  checkIds.forEach((checkId) => {
    store.delRow('checks', checkId);
  });
}

export function getActiveHabits(store: Store): HabitRow[] {
  const table = store.getTable('habits');
  return Object.values(table)
    .filter((row: any) => !row.deletedAt)
    .sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt)) as HabitRow[];
}

export function getHabitById(store: Store, id: string): HabitRow | null {
  const row = store.getRow('habits', id) as any;
  if (!row || row.deletedAt) {
    return null;
  }
  return row as HabitRow;
}
