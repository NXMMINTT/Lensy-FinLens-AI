/** "YYYY-MM-DD" in the viewer's own timezone. `toISOString()` is UTC, which is yesterday in Thailand before 07:00. */
export function localIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
