export function isValidMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthRange(month: string): { start: Date; end: Date } {
  if (!isValidMonth(month)) {
    throw new Error(`Invalid month format "${month}". Expected YYYY-MM.`);
  }

  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10); // 1-12

  // Start of month (inclusive)
  const start = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));

  // Start of next month (exclusive)
  let nextYear = year;
  let nextMonth = monthNum; // in 0-indexed terms, monthNum is the next month
  if (nextMonth > 11) {
    nextYear += 1;
    nextMonth = 0;
  }
  const end = new Date(Date.UTC(nextYear, nextMonth, 1, 0, 0, 0, 0));

  return { start, end };
}

export function getLastNMonths(count: number, toMonth?: string): string[] {
  const target = toMonth && isValidMonth(toMonth) ? toMonth : getCurrentMonth();
  const [targetYear, targetMonth] = target.split('-').map(Number);

  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(targetYear, targetMonth - 1 - i, 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }
  return months;
}
