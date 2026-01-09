export type HabitGroupRow = {
	id: string;
	title: string;
	color?: string | null;
	order: number;
	createdAt: string;
};

export type HabitRow = {
	id: string;
	title: string;
	description?: string | null;
	color: string;
	groupId?: string | null; // null = ungrouped
	order?: number; // Optional until migration completes
	createdAt: string;
	deletedAt?: string | null;
	weeklyTarget: number; // 1-7, default 7
};

export type DailyCheckRow = {
	habitId: string;
	date: string; // YYYY-MM-DD
	completed: boolean;
	updatedAt: string;
};
