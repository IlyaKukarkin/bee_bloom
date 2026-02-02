import { Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import { createStore, type Store } from "tinybase";
import { createExpoSqlitePersister } from "tinybase/persisters/persister-expo-sqlite";
import { todayKey } from "../lib/dates";
import { generateCheckId } from "./checks";
import { schema } from "./schema";
import type { HabitGroupRow, HabitRow } from "./types";

const DB_NAME = "beebloom.db";

export type WidgetSize = "small" | "medium" | "large";

export const WIDGET_CAPACITY: Record<WidgetSize, number> = {
	small: 3,
	medium: 6,
	large: 10,
};

export type HabitWidgetItem = {
	id: string;
	title: string;
	color: string;
	groupId: string | null;
	groupTitle: string | null;
	order: number;
};

export type WidgetViewState = {
	incompleteHabits: HabitWidgetItem[];
	totalIncomplete: number;
	allComplete: boolean;
	hasHabits: boolean;
	generatedAt: Date;
};

/**
 * Creates a widget-specific Tinybase store connected to the shared SQLite database.
 * Uses App Group container on iOS to share data with the main app.
 *
 * @returns Object containing store, persister, load promise, and isLoaded check
 */
export function createWidgetStore() {
	const store = createStore();
	// biome-ignore lint/suspicious/noExplicitAny: TinyBase schema requires any type
	store.setSchema(schema as any);

	// Use App Group directory on iOS to share database with main app
	const dbDirectory =
		Platform.OS === "ios"
			? Paths.appleSharedContainers["group.com.ilyakukarkinorg.beebloom"]?.uri
			: undefined;

	const persister = createExpoSqlitePersister(
		store,
		SQLite.openDatabaseSync(DB_NAME, undefined, dbDirectory),
	);

	let loaded = false;
	const loadPromise = persister
		.load()
		.then(async () => {
			loaded = true;
			// Auto-save to persist widget actions (habit completions) back to database
			await persister.startAutoSave();
		})
		.catch((error) => {
			console.warn("Widget store load failed", error);
		});

	return {
		store,
		persister,
		loadPromise,
		isLoaded: () => loaded,
	};
}

/**
 * Gets the date key for today in YYYY-MM-DD format.
 *
 * @param now - Optional date for testing, defaults to current date
 * @returns Date key string (e.g., "2026-02-02")
 */
export function getTodayDateKey(now = new Date()): string {
	return todayKey(now);
}

/**
 * Maps iOS widget family name to internal size category.
 *
 * @param family - iOS WidgetKit family name (systemSmall, systemMedium, systemLarge)
 * @returns Internal size category
 */
export function getWidgetSizeFromFamily(family: string): WidgetSize {
	if (family === "systemSmall") return "small";
	if (family === "systemMedium") return "medium";
	return "large";
}

function getGroupOrderMap(store: Store): Map<string, number> {
	const groups = store.getTable("habitGroups") as Record<string, HabitGroupRow>;
	const map = new Map<string, number>();
	Object.values(groups).forEach((group) => {
		map.set(group.id, group.order ?? 0);
	});
	return map;
}

export function getTodayIncompleteHabits(
	store: Store,
	dateKey = getTodayDateKey(),
): HabitWidgetItem[] {
	const habits = store.getTable("habits") as Record<string, HabitRow>;
	const groups = store.getTable("habitGroups") as Record<string, HabitGroupRow>;
	const groupOrder = getGroupOrderMap(store);

	const items: HabitWidgetItem[] = [];

	Object.entries(habits).forEach(([habitId, habit]) => {
		if (habit.deletedAt) return;

		const checkId = generateCheckId(habitId, dateKey);
		const check = store.getRow("checks", checkId) as
			| { completed?: boolean }
			| undefined;

		if (check?.completed) return;

		items.push({
			id: habitId,
			title: habit.title,
			color: habit.color,
			groupId: habit.groupId ?? null,
			// Use optional chaining to handle missing groups gracefully
			groupTitle: habit.groupId ? (groups[habit.groupId]?.title ?? null) : null,
			order: habit.order ?? 0,
		});
	});

	// Sort by group order first, then habit order within group
	// Ungrouped habits get Number.MAX_SAFE_INTEGER to appear last,
	// matching the Today view behavior where ungrouped habits are at the bottom
	items.sort((a, b) => {
		const aGroupOrder = a.groupId
			? (groupOrder.get(a.groupId) ?? 0)
			: Number.MAX_SAFE_INTEGER;
		const bGroupOrder = b.groupId
			? (groupOrder.get(b.groupId) ?? 0)
			: Number.MAX_SAFE_INTEGER;

		if (aGroupOrder !== bGroupOrder) return aGroupOrder - bGroupOrder;
		return a.order - b.order;
	});

	return items;
}

/**
 * Generates a complete view state for widget rendering.
 *
 * @param store - Tinybase store instance
 * @param widgetSize - Widget size category (small/medium/large)
 * @returns View state with incomplete habits and metadata
 */
export function getWidgetViewState(
	store: Store,
	widgetSize: WidgetSize,
): WidgetViewState {
	const dateKey = getTodayDateKey();
	const maxDisplay = WIDGET_CAPACITY[widgetSize];
	const habits = store.getTable("habits") as Record<string, HabitRow>;
	const hasHabits = Object.values(habits).some((habit) => !habit.deletedAt);

	const incompleteHabits = getTodayIncompleteHabits(store, dateKey);

	return {
		incompleteHabits: incompleteHabits.slice(0, maxDisplay),
		totalIncomplete: incompleteHabits.length,
		allComplete: hasHabits && incompleteHabits.length === 0,
		hasHabits,
		generatedAt: new Date(),
	};
}

/**
 * Marks a habit as complete for today by creating/updating a check row.
 * Validates that the habit exists and is not deleted before writing.
 *
 * @param store - Tinybase store instance
 * @param habitId - ID of the habit to complete
 * @param now - Optional date for testing, defaults to current date
 * @throws Error if habit doesn't exist or is deleted
 */
export function setHabitComplete(
	store: Store,
	habitId: string,
	now = new Date(),
): void {
	// Validate habit exists and is not deleted
	const habit = store.getRow("habits", habitId);
	if (!habit || habit.deletedAt) {
		throw new Error(`Habit ${habitId} not found or deleted`);
	}

	const dateKey = getTodayDateKey(now);
	const checkId = generateCheckId(habitId, dateKey);
	// Use 'now' parameter consistently for both date fields
	const updatedAt = now.toISOString();

	store.setRow("checks", checkId, {
		habitId,
		date: dateKey,
		completed: true,
		updatedAt,
	});
}
