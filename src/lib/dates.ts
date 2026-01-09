export function todayKey(date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function yesterdayKey(date = new Date()): string {
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getWeekStartingMonday(startDate: Date = new Date()): string[] {
	const dates: string[] = [];
	// Calculate back to this week's Monday, then generate all 7 days (Monday through Sunday)
	const now = new Date(startDate);
	const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days

	// Calculate Monday's date components
	const year = now.getFullYear();
	const month = now.getMonth();
	const date = now.getDate();

	// Generate 7 days starting from Monday
	for (let i = 0; i < 7; i++) {
		const d = new Date(year, month, date - daysFromMonday + i);
		dates.push(todayKey(d));
	}
	return dates;
}

export function isTodayOrYesterday(key: string, now = new Date()): boolean {
	const t = todayKey(now);
	const y = yesterdayKey(now);
	return key === t || key === y;
}

/**
 * Get the start of the current week (Monday at 00:00) as a date key
 */
export function getWeekStart(date: Date = new Date()): string {
	const now = new Date(date);
	const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days

	const year = now.getFullYear();
	const month = now.getMonth();
	const dateNum = now.getDate();

	const monday = new Date(year, month, dateNum - daysFromMonday);
	return todayKey(monday);
}

/**
 * Get the end of the current week (Sunday) as a date key
 */
export function getWeekEnd(date: Date = new Date()): string {
	const now = new Date(date);
	const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
	const daysToSunday = 6 - daysFromMonday;

	const year = now.getFullYear();
	const month = now.getMonth();
	const dateNum = now.getDate();

	const sunday = new Date(year, month, dateNum + daysToSunday);
	return todayKey(sunday);
}
