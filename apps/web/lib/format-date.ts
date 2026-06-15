const formatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
export function formatDateRange(start: Date | string, end: Date | string) {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  if (
    s.getUTCFullYear() === e.getUTCFullYear() &&
    s.getUTCMonth() === e.getUTCMonth()
  ) {
    // 8–15 Jun 2025
    const monthYear = formatter.format(e).replace(/^\d+\s/, ''); // "Jun 2025"
    return `${s.getUTCDate()}–${e.getUTCDate()} ${monthYear}`;
  }
  return `${formatter.format(s)} – ${formatter.format(e)}`;
}
