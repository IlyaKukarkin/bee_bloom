import * as SQLite from "expo-sqlite";
import { createStore, type Store } from "tinybase";
import { createExpoSqlitePersister } from "tinybase/persisters/persister-expo-sqlite";
import { todayKey } from "../lib/dates";
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

const getCheckRowId = (habitId: string, date: string) => `${habitId}:${date}`;

export function createWidgetStore() {
	const store = createStore();
	// biome-ignore lint/suspicious/noExplicitAny: TinyBase schema requires any type
	store.setSchema(schema as any);

	const persister = createExpoSqlitePersister(
		store,
		SQLite.openDatabaseSync(DB_NAME),
	);

	let loaded = false;
	const loadPromise = persister
		.load()
		.then(() => {
			loaded = true;
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

export function getTodayDateKey(now = new Date()): string {
	return todayKey(now);
}

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

		const checkId = getCheckRowId(habitId, dateKey);
		const check = store.getRow("checks", checkId) as
			| { completed?: boolean }
			| undefined;

		if (check?.completed) return;

		const group = habit.groupId ? groups[habit.groupId] : null;
		items.push({
			id: habitId,
			title: habit.title,
			color: habit.color,
			groupId: habit.groupId ?? null,
			groupTitle: group?.title ?? null,
			order: habit.order ?? 0,
		});
	});

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

export function setHabitComplete(
	store: Store,
	habitId: string,
	now = new Date(),
): void {
	const dateKey = getTodayDateKey(now);
	const checkId = getCheckRowId(habitId, dateKey);
	const updatedAt = now.toISOString();

	store.setRow("checks", checkId, {
		habitId,
		date: dateKey,
		completed: true,
		updatedAt,
	});
}
