import type { Store } from "tinybase";
import type { HabitGroupRow, HabitRow } from "./types";

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createHabitGroup(
	store: Store,
	group: Omit<HabitGroupRow, "id" | "createdAt" | "order">,
): string {
	const id = generateId();
	const createdAt = new Date().toISOString();

	// Calculate next order
	const groups = Object.values(
		store.getTable("habitGroups"),
	) as HabitGroupRow[];
	const maxOrder = groups.reduce((max, g) => Math.max(max, g.order || 0), -10);

	const groupRow: HabitGroupRow = {
		id,
		title: group.title.trim(),
		color: group.color?.trim() || null,
		order: maxOrder + 10,
		createdAt,
	};

	store.setRow("habitGroups", id, groupRow);
	return id;
}

export function updateHabitGroup(
	store: Store,
	id: string,
	updates: Partial<Pick<HabitGroupRow, "title" | "color">>,
): void {
	const existing = store.getRow("habitGroups", id);
	if (!existing) {
		throw new Error(`HabitGroup ${id} not found`);
	}

	const newRow: Partial<HabitGroupRow> = {};
	if (updates.title !== undefined) {
		newRow.title = updates.title.trim();
	}
	if (updates.color !== undefined) {
		newRow.color = updates.color?.trim() || null;
	}

	store.setPartialRow("habitGroups", id, newRow);
}

export function deleteHabitGroup(store: Store, id: string): void {
	const existing = store.getRow("habitGroups", id);
	if (!existing) {
		throw new Error(`HabitGroup ${id} not found`);
	}

	// Move all habits in this group to ungrouped
	const habits = (Object.values(store.getTable("habits")) as HabitRow[]).filter(
		(h) => h.groupId === id && !h.deletedAt,
	);

	habits.forEach((h) => {
		store.setCell("habits", h.id, "groupId", null);
	});

	// Delete the group
	store.delRow("habitGroups", id);
}

/**
 * Reorder groups by moving groupId to targetIndex
 */
export function reorderGroupList(
	store: Store,
	groupId: string,
	targetIndex: number,
): void {
	const group = store.getRow("habitGroups", groupId);
	if (!group) {
		throw new Error(`HabitGroup ${groupId} not found`);
	}

	const allGroups = (
		Object.values(store.getTable("habitGroups")) as HabitGroupRow[]
	)
		.filter((g) => g.id !== groupId)
		.sort((a, b) => a.order - b.order);

	// Insert at targetIndex
	allGroups.splice(targetIndex, 0, group);

	// Resequence orders
	allGroups.forEach((g, index) => {
		store.setCell("habitGroups", g.id, "order", index * 10);
	});
}

/**
 * Resequence group orders to normalize gaps
 */
export function resequenceGroupOrders(store: Store): void {
	const groups = (
		Object.values(store.getTable("habitGroups")) as HabitGroupRow[]
	).sort((a, b) => a.order - b.order);

	groups.forEach((g, index) => {
		store.setCell("habitGroups", g.id, "order", index * 10);
	});
}

/**
 * Find an existing group by trimmed, case-insensitive title
 */
export function findHabitGroupByTitle(
	store: Store,
	title: string,
): HabitGroupRow | undefined {
	const target = title.trim().toLowerCase();
	if (!target) return undefined;

	return (Object.values(store.getTable("habitGroups")) as HabitGroupRow[]).find(
		(g) => g.title.trim().toLowerCase() === target,
	);
}
