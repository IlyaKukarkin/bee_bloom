import type { Store } from "tinybase";
import { createHabitGroup, findHabitGroupByTitle } from "./groups";
import { generateId } from "./id";
import type { HabitRow } from "./types";

// Default colors from garden-tone palette
const DEFAULT_COLORS = [
	"#3c7c5a", // accent green
	"#8fb89e", // muted green
	"#d88c4a", // warm orange
	"#7a9cb8", // soft blue
	"#b8a89e", // taupe
];

function getDefaultColor(index: number): string {
	return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function sanitizeWeeklyTarget(target?: number): number {
	const value = target ?? 7;
	if (!Number.isInteger(value)) return 7;
	if (value < 1) return 1;
	if (value > 7) return 7;
	return value;
}

type HabitCreateInput = {
	title: string;
	description: string | null;
	color?: string | null;
	groupId?: string | null;
	group?: string | null;
	weeklyTarget?: number; // 1-7, defaults to 7
};

type HabitUpdateInput = Partial<
	Pick<HabitRow, "title" | "description" | "color" | "groupId" | "weeklyTarget">
> & { group?: string | null };

function resolveGroupId(
	store: Store,
	groupId?: string | null,
	groupTitle?: string | null,
): string | null | undefined {
	if (groupTitle !== undefined) {
		const trimmed = groupTitle?.trim() || "";
		if (!trimmed) return null;

		const existing = findHabitGroupByTitle(store, trimmed);
		if (existing) return existing.id;

		return createHabitGroup(store, { title: trimmed, color: null });
	}

	if (groupId !== undefined) {
		return groupId?.trim() || null;
	}

	return undefined;
}

export function createHabit(store: Store, habit: HabitCreateInput): string {
	const id = generateId();
	const createdAt = new Date().toISOString();
	const weeklyTarget = sanitizeWeeklyTarget(habit.weeklyTarget);

	const title = habit.title.trim();
	if (!title) {
		throw new Error("Habit title cannot be empty");
	}

	// Get current habit count for color rotation
	const habitCount = Object.keys(store.getTable("habits")).filter((hId) => {
		const deleted = store.getCell("habits", hId, "deletedAt");
		return !deleted;
	}).length;

	const color = habit.color || getDefaultColor(habitCount);

	// Calculate next order within target group (auto-create if group title provided)
	const groupId = resolveGroupId(store, habit.groupId, habit.group) ?? null;
	const groupHabits = (
		Object.values(store.getTable("habits")) as HabitRow[]
	).filter((h) => h.groupId === groupId && !h.deletedAt);
	const maxOrder = groupHabits.reduce(
		(max, h) => Math.max(max, h.order || 0),
		-10,
	);

	store.setRow("habits", id, {
		id,
		title,
		description: habit.description?.trim() || null,
		color,
		groupId,
		order: maxOrder + 10,
		createdAt,
		deletedAt: null,
		weeklyTarget,
	});

	return id;
}

export function updateHabit(
	store: Store,
	id: string,
	updates: HabitUpdateInput,
): void {
	const existing = store.getRow("habits", id);
	if (!existing || existing.deletedAt) {
		throw new Error(`Habit ${id} not found or deleted`);
	}

	const newRow: Partial<HabitRow> = {};
	if (updates.title !== undefined) {
		const trimmedTitle = updates.title.trim();
		if (!trimmedTitle) {
			throw new Error("Habit title cannot be empty");
		}
		newRow.title = trimmedTitle;
	}
	if (updates.description !== undefined) {
		newRow.description = updates.description?.trim() || null;
	}
	if (updates.color !== undefined) {
		newRow.color = updates.color;
	}
	if (updates.weeklyTarget !== undefined) {
		newRow.weeklyTarget = sanitizeWeeklyTarget(updates.weeklyTarget);
	}

	const resolvedGroupId = resolveGroupId(store, updates.groupId, updates.group);
	const groupChanged = resolvedGroupId !== undefined;

	if (Object.keys(newRow).length > 0) {
		store.setPartialRow("habits", id, newRow);
	}

	if (groupChanged) {
		const targetGroupId = resolvedGroupId ?? null;
		const targetGroupHabits = (
			Object.values(store.getTable("habits")) as HabitRow[]
		).filter((h) => h.groupId === targetGroupId && !h.deletedAt && h.id !== id);

		// Place at end of target group and compact source group via move helper
		moveHabitToGroup(store, id, targetGroupId, targetGroupHabits.length);
	}
}

export function deleteHabit(store: Store, id: string): void {
	const existing = store.getRow("habits", id);
	if (!existing || existing.deletedAt) {
		throw new Error(`Habit ${id} not found or already deleted`);
	}

	// Soft delete: set deletedAt timestamp
	store.setCell("habits", id, "deletedAt", new Date().toISOString());

	// Remove all associated daily checks
	const checkIds = Object.keys(store.getTable("checks")).filter((checkId) => {
		return store.getCell("checks", checkId, "habitId") === id;
	});

	checkIds.forEach((checkId) => {
		store.delRow("checks", checkId);
	});
}

export function getActiveHabits(store: Store): HabitRow[] {
	const table = store.getTable("habits");
	return Object.values(table)
		.filter((row): row is HabitRow => !row.deletedAt)
		.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getHabitById(store: Store, id: string): HabitRow | null {
	const row = store.getRow("habits", id) as HabitRow | undefined;
	if (!row || row.deletedAt) {
		return null;
	}
	return row;
}

/**
 * Reorder a habit within its current group by moving it to targetIndex
 */
export function reorderHabitWithinGroup(
	store: Store,
	habitId: string,
	targetIndex: number,
): void {
	const habit = store.getRow("habits", habitId) as HabitRow | undefined;
	if (!habit || habit.deletedAt) {
		throw new Error(`Habit ${habitId} not found or deleted`);
	}

	const groupId = habit.groupId || null;
	const groupHabits = (Object.values(store.getTable("habits")) as HabitRow[])
		.filter((h) => h.groupId === groupId && !h.deletedAt && h.id !== habitId)
		.sort((a, b) => a.order - b.order);

	// Insert at targetIndex
	groupHabits.splice(targetIndex, 0, habit);

	// Resequence orders
	groupHabits.forEach((h, index) => {
		store.setCell("habits", h.id, "order", index * 10);
	});
}

/**
 * Move a habit to a different group at targetIndex
 */
export function moveHabitToGroup(
	store: Store,
	habitId: string,
	targetGroupId: string | null,
	targetIndex: number,
): void {
	const habit = store.getRow("habits", habitId) as HabitRow | undefined;
	if (!habit || habit.deletedAt) {
		throw new Error(`Habit ${habitId} not found or deleted`);
	}

	const oldGroupId = habit.groupId || null;

	// Update habit groupId
	store.setCell("habits", habitId, "groupId", targetGroupId);

	// Compact old group
	if (oldGroupId !== targetGroupId) {
		const oldGroupHabits = (
			Object.values(store.getTable("habits")) as HabitRow[]
		)
			.filter(
				(h) => h.groupId === oldGroupId && !h.deletedAt && h.id !== habitId,
			)
			.sort((a, b) => a.order - b.order);

		oldGroupHabits.forEach((h, index) => {
			store.setCell("habits", h.id, "order", index * 10);
		});
	}

	// Insert into new group at targetIndex
	const newGroupHabits = (Object.values(store.getTable("habits")) as HabitRow[])
		.filter(
			(h) => h.groupId === targetGroupId && !h.deletedAt && h.id !== habitId,
		)
		.sort((a, b) => a.order - b.order);

	newGroupHabits.splice(targetIndex, 0, habit);

	newGroupHabits.forEach((h, index) => {
		store.setCell("habits", h.id, "order", index * 10);
	});
}

/**
 * Resequence habit orders within a group to normalize gaps
 */
export function resequenceHabitOrders(
	store: Store,
	groupId: string | null,
): void {
	const groupHabits = (Object.values(store.getTable("habits")) as HabitRow[])
		.filter((h) => h.groupId === groupId && !h.deletedAt)
		.sort((a, b) => a.order - b.order);

	groupHabits.forEach((h, index) => {
		store.setCell("habits", h.id, "order", index * 10);
	});
}
