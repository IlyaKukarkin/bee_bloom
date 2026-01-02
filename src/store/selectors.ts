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
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startDate);
    d.setDate(d.getDate() - i);
    dates.push(todayKey(d));
  }
  return dates;
}
