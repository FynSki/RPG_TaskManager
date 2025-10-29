/**
 * Date utility functions for TaskQuest application
 */

/**
 * Get dates for the week containing the given date
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Array of 7 date strings (Monday to Sunday)
 */
export function getWeekDates(dateStr: string): string[] {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        dates.push(currentDate.toISOString().slice(0, 10));
    }
    return dates;
}

/**
 * Get all dates for a given month (including empty slots for calendar alignment)
 * @param dateStr - Date string in YYYY-MM format
 * @returns Array of date strings (empty strings for padding)
 */
export function getMonthDates(dateStr: string): string[] {
    const [year, month] = dateStr.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const dates: string[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < adjustedFirstDay; i++) {
        dates.push("");
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const monthStr = month.toString().padStart(2, "0");
        const dayStr = d.toString().padStart(2, "0");
        dates.push(`${year}-${monthStr}-${dayStr}`);
    }

    return dates;
}

/**
 * Get the short day name for a given date
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Short day name (e.g., "Mon", "Tue")
 */
export function getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
}

/**
 * Format date to DD.MM
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date (e.g., "15.03")
 */
export function formatShortDate(dateStr: string): string {
    if (!dateStr) return "";
    const [, month, day] = dateStr.split("-");
    return `${day}.${month}`;
}

/**
 * Format full date and time
 * @param dateStr - ISO date string
 * @returns Formatted date and time in Polish format
 */
export function formatFullDateTime(dateStr: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
}

/**
 * Add days to a date
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param days - Number of days to add (can be negative)
 * @returns New date string in YYYY-MM-DD format
 */
export function addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}

/**
 * Add months to a date
 * @param monthStr - Date string in YYYY-MM format
 * @param months - Number of months to add (can be negative)
 * @returns New month string in YYYY-MM format
 */
export function addMonths(monthStr: string, months: number): string {
    const [year, month] = monthStr.split("-").map(Number);
    const date = new Date(year, month - 1 + months, 1);
    return date.toISOString().slice(0, 7);
}
