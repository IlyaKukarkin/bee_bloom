import type { Store } from "tinybase";
import type { HabitRow } from "./types";

// Default colors from garden-tone palette
const DEFAULT_COLORS = [
	"#3c7c5a", // accent green
	"#8fb89e", // muted green
	"#d88c4a", // warm orange
	"#7a9cb8", // soft blue
	"#b8a89e", // taupe
];

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getDefaultColor(index: number): string {
	return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export function createHabit(
	store: Store,
	habit: Omit<HabitRow, "id" | "createdAt" | "deletedAt" | "order">,
): string {
	const id = generateId();
	const createdAt = new Date().toISOString();

	// Get current habit count for color rotation
	const habitCount = Object.keys(store.getTable("habits")).filter((hId) => {
		const deleted = store.getCell("habits", hId, "deletedAt");
		return !deleted;
	}).length;

	const color = habit.color || getDefaultColor(habitCount);

	// Calculate next order within target group
	const groupId = habit.groupId?.trim() || null;
	const groupHabits = (
		Object.values(store.getTable("habits")) as HabitRow[]
	).filter((h) => h.groupId === groupId && !h.deletedAt);
	const maxOrder = groupHabits.reduce(
		(max, h) => Math.max(max, h.order || 0),
		-10,
	);

	store.setRow("habits", id, {
		id,
		title: habit.title.trim(),
		description: habit.description?.trim() || null,
		color,
		groupId,
		order: maxOrder + 10,
		createdAt,
		deletedAt: null,
	});

	return id;
}

export function updateHabit(
	store: Store,
	id: string,
	updates: Partial<
		Pick<HabitRow, "title" | "description" | "color" | "groupId">
	>,
): void {
	const existing = store.getRow("habits", id);
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
	if (updates.groupId !== undefined) {
		newRow.groupId = updates.groupId?.trim() || null;
	}

	store.setPartialRow("habits", id, newRow);
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
