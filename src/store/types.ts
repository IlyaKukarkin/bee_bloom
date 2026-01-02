export type HabitRow = {
  id: string;
  title: string;
  description?: string | null;
  color: string;
  group?: string | null;
  createdAt: string;
  deletedAt?: string | null;
};

export type DailyCheckRow = {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  updatedAt: string;
};
