export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function yesterdayKey(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTodayOrYesterday(key: string, now = new Date()): boolean {
  const t = todayKey(now);
  const y = yesterdayKey(now);
  return key === t || key === y;
}
