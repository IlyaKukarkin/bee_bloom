export function todayKey(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d.toISOString().split('T')[0];
}

export function yesterdayKey(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function isTodayOrYesterday(key: string, now = new Date()): boolean {
  const t = todayKey(now);
  const y = yesterdayKey(now);
  return key === t || key === y;
}
