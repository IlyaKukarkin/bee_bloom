import { useEffect, useState } from "react";
import type { Store } from "tinybase";
import { useStore } from "tinybase/ui-react";
import { getWeekStartingMonday } from "../lib/dates";
import { getWeeklyChecks } from "./checks";
import type { HabitGroupRow, HabitRow } from "./types";

export type HabitWithWeeklyChecks = {
	habit: HabitRow;
	checks: Array<{ date: string; completed: boolean }>;
	completedCount: number;
};

export type GroupedHabits = {
	group: HabitGroupRow | null; // null = Ungrouped
	habits: HabitRow[];
};

export type WeeklyProgress = {
	habitId: string;
	current: number;
	target: number;
	display: string;
	percentComplete: number;
};

/**
 * Get all active habits, ordered by order within their groupId
 */
export function getOrderedHabits(store: Store): HabitRow[] {
	const table = store.getTable("habits");
	return Object.values(table)
		.filter((row): row is HabitRow => !row.deletedAt)
		.sort((a, b) => {
			// Sort by groupId first (null last), then by order
			if ((a.groupId || "") !== (b.groupId || "")) {
				return (a.groupId || "").localeCompare(b.groupId || "");
			}
			return (a.order || 0) - (b.order || 0);
		});
}

/**
 * Get all habit groups, ordered by their order field
 */
export function getOrderedGroups(store: Store): HabitGroupRow[] {
	const table = store.getTable("habitGroups");
	return (Object.values(table) as HabitGroupRow[]).sort(
		(a, b) => (a.order || 0) - (b.order || 0),
	);
}

/**
 * Get habits grouped by their group, including Ungrouped bucket
 * Returns ordered groups with ordered habits within each
 */
export function getGroupedHabits(store: Store): GroupedHabits[] {
	const groups = getOrderedGroups(store);
	const habits = getOrderedHabits(store);

	const result: GroupedHabits[] = [];

	// Add each group with its habits
	groups.forEach((group) => {
		const groupHabits = habits.filter((h) => h.groupId === group.id);
		if (groupHabits.length > 0) {
			result.push({ group, habits: groupHabits });
		}
	});

	// Add ungrouped bucket if there are ungrouped habits
	const ungroupedHabits = habits.filter((h) => !h.groupId);
	if (ungroupedHabits.length > 0) {
		result.push({ group: null, habits: ungroupedHabits });
	}

	return result;
}

function getWeeklyProgress(
	store: Store,
	habitId: string,
	now = new Date(),
): WeeklyProgress {
	const habit = store.getRow("habits", habitId) as HabitRow | undefined;

	if (!habit || habit.deletedAt) {
		return {
			habitId,
			current: 0,
			target: 7,
			display: "0/7",
			percentComplete: 0,
		};
	}

	// Use getWeeklyChecks for efficient filtering by habitId and date range
	const weeklyChecks = getWeeklyChecks(store, habitId, now);
	const current = weeklyChecks.reduce(
		(count, check) => (check.completed ? count + 1 : count),
		0,
	);

	const target = habit.weeklyTarget ?? 7;
	const percentComplete = target > 0 ? (current / target) * 100 : 0;
	return {
		habitId,
		current,
		target,
		display: `${current}/${target}`,
		percentComplete,
	};
}

export function useWeeklyProgress(habitId: string): WeeklyProgress {
	const store = useStore();
	const [progress, setProgress] = useState<WeeklyProgress>({
		habitId,
		current: 0,
		target: 7,
		display: "0/7",
		percentComplete: 0,
	});

	useEffect(() => {
		if (!store) return;

		const update = () => setProgress(getWeeklyProgress(store, habitId));
		update();

		// Listen to specific tables instead of all tables for better performance
		const checksListenerId = store.addTableListener("checks", () => {
			update();
		});
		const habitsListenerId = store.addTableListener("habits", () => {
			update();
		});

		// Set up a timer to update at the next week transition (Monday midnight)
		const setupWeekTransitionTimer = () => {
			const now = new Date();
			const nextMonday = new Date(now);
			const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
			const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Days until next Monday

			nextMonday.setDate(now.getDate() + daysUntilMonday);
			nextMonday.setHours(0, 0, 0, 0);

			const msUntilMonday = nextMonday.getTime() - now.getTime();

			return setTimeout(() => {
				update();
				// Set up the next timer after this one fires
				const timerId = setupWeekTransitionTimer();
				return timerId;
			}, msUntilMonday);
		};

		const transitionTimerId = setupWeekTransitionTimer();

		return () => {
			store.delListener(checksListenerId);
			store.delListener(habitsListenerId);
			if (transitionTimerId) {
				clearTimeout(transitionTimerId);
			}
		};
	}, [store, habitId]);

	return progress;
}

export function getWeeklyData(store: Store): HabitWithWeeklyChecks[] {
	const habits = getOrderedHabits(store);
	const now = new Date();

	return habits.map((habit) => {
		const weeklyChecks = getWeeklyChecks(store, habit.id, now);
		const completedCount = weeklyChecks.filter((c) => c.completed).length;

		return {
			habit,
			checks: weeklyChecks.map((c) => ({
				date: c.date,
				completed: c.completed,
			})),
			completedCount,
		};
	});
}

export type GroupedWeeklyData = {
	groupTitle: string;
	habits: HabitWithWeeklyChecks[];
};

export function getWeeklyDataByGroup(store: Store): GroupedWeeklyData[] {
	const groups = getOrderedGroups(store);
	const now = new Date();
	const result: GroupedWeeklyData[] = [];

	// Add each group with its weekly data
	groups.forEach((group) => {
		const groupHabits = getOrderedHabits(store).filter(
			(h) => h.groupId === group.id,
		);
		if (groupHabits.length > 0) {
			const habitsWithWeeklyChecks = groupHabits.map((habit) => {
				const weeklyChecks = getWeeklyChecks(store, habit.id, now);
				const completedCount = weeklyChecks.filter((c) => c.completed).length;

				return {
					habit,
					checks: weeklyChecks.map((c) => ({
						date: c.date,
						completed: c.completed,
					})),
					completedCount,
				};
			});
			result.push({ groupTitle: group.title, habits: habitsWithWeeklyChecks });
		}
	});

	// Add ungrouped bucket if there are ungrouped habits
	const ungroupedHabits = getOrderedHabits(store).filter((h) => !h.groupId);
	if (ungroupedHabits.length > 0) {
		const habitsWithWeeklyChecks = ungroupedHabits.map((habit) => {
			const weeklyChecks = getWeeklyChecks(store, habit.id, now);
			const completedCount = weeklyChecks.filter((c) => c.completed).length;

			return {
				habit,
				checks: weeklyChecks.map((c) => ({
					date: c.date,
					completed: c.completed,
				})),
				completedCount,
			};
		});
		result.push({ groupTitle: "Ungrouped", habits: habitsWithWeeklyChecks });
	}

	return result;
}

// Returns the current week (Monday through Sunday) based on the provided date
export function getWeekDaysFromMonday(startDate = new Date()): string[] {
	return getWeekStartingMonday(startDate);
}
