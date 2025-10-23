// src/utils/timeIntervals.ts
export function generateTimeIntervals(
  start = "06:00",
  end = "23:45",
  stepMinutes = 15
): string[] {
  const result: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m <= endM)) {
    result.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
    m += stepMinutes;
    if (m >= 60) {
      h += 1;
      m = m % 60;
    }
  }
  return result;
}
