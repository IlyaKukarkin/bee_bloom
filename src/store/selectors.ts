import { Store } from 'tinybase';
import { HabitRow } from './types';
import { getActiveHabits } from './habits';
import { getWeeklyChecks } from './checks';
import { todayKey } from '../lib/dates';

export type HabitWithWeeklyChecks = {
  habit: HabitRow;
  checks: Array<{ date: string; completed: boolean }>;
  completedCount: number;
};

export function getWeeklyData(store: Store): HabitWithWeeklyChecks[] {
  const habits = getActiveHabits(store);
  const now = new Date();

  return habits.map((habit) => {
    const weeklyChecks = getWeeklyChecks(store, habit.id, now);
    const completedCount = weeklyChecks.filter((c) => c.completed).length;

    return {
      habit,
      checks: weeklyChecks.map((c) => ({ date: c.date, completed: c.completed })),
      completedCount,
    };
  });
}

export function getWeeklyDataByGroup(store: Store): Map<string, HabitWithWeeklyChecks[]> {
  const weeklyData = getWeeklyData(store);
  const grouped = new Map<string, HabitWithWeeklyChecks[]>();

  weeklyData.forEach((item) => {
    const groupKey = item.habit.group || 'Other';
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey)!.push(item);
  });

  return grouped;
}

export function getLast7Days(startDate = new Date()): string[] {
  const dates: string[] = [];
  // Get the most recent Monday (or today if it's Monday)
  const now = new Date(startDate);
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
  
  // Calculate Monday's date components
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  
  // Generate 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month, date - daysFromMonday + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dates.push(dateStr);
  }
  return dates;
}
