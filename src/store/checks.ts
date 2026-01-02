import { Store } from 'tinybase';
import { DailyCheckRow } from './types';
import { todayKey, yesterdayKey, isTodayOrYesterday } from '../lib/dates';

function generateCheckId(habitId: string, date: string): string {
  return `${habitId}:${date}`;
}

export function toggleDailyCheck(
  store: Store,
  habitId: string,
  date: string,
  now = new Date()
): boolean {
  // Enforce backfill rule: only today or yesterday allowed
  if (!isTodayOrYesterday(date, now)) {
    throw new Error(`Cannot toggle check for ${date}. Only today or yesterday allowed.`);
  }

  // Verify habit exists and is not deleted
  const habit = store.getRow('habits', habitId);
  if (!habit || habit.deletedAt) {
    throw new Error(`Habit ${habitId} not found or deleted`);
  }

  const checkId = generateCheckId(habitId, date);
  const existing = store.getRow('checks', checkId) as DailyCheckRow | undefined;

  const newCompleted = !existing?.completed;
  const updatedAt = new Date().toISOString();

  store.setRow('checks', checkId, {
    habitId,
    date,
    completed: newCompleted,
    updatedAt,
  });

  return newCompleted;
}

export function getDailyCheck(
  store: Store,
  habitId: string,
  date: string
): DailyCheckRow | null {
  const checkId = generateCheckId(habitId, date);
  const row = store.getRow('checks', checkId) as DailyCheckRow | undefined;
  return row || null;
}

export function getChecksForHabit(
  store: Store,
  habitId: string,
  dates: string[]
): Map<string, DailyCheckRow> {
  const checks = new Map<string, DailyCheckRow>();

  dates.forEach((date) => {
    const check = getDailyCheck(store, habitId, date);
    if (check) {
      checks.set(date, check);
    }
  });

  return checks;
}

export function getTodayChecks(store: Store): Map<string, DailyCheckRow> {
  const today = todayKey();
  const table = store.getTable('checks');
  const checks = new Map<string, DailyCheckRow>();

  Object.values(table).forEach((row: any) => {
    if (row.date === today) {
      checks.set(row.habitId, row as DailyCheckRow);
    }
  });

  return checks;
}

export function getWeeklyChecks(
  store: Store,
  habitId: string,
  startDate: Date = new Date()
): DailyCheckRow[] {
  // Get last 7 days from startDate (inclusive)
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startDate);
    d.setDate(d.getDate() - i);
    dates.push(todayKey(d));
  }

  const checks = getChecksForHabit(store, habitId, dates);
  return dates.map((date) => checks.get(date) || { habitId, date, completed: false, updatedAt: '' });
}
