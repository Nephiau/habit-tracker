// ===================================================================
// dateUtils.js — Timezone-safe date utilities, heatmap matrix gen,
// and streak calculation engine for the Habit Tracker.
// All date keys use local calendar YYYY-MM-DD (never toISOString()).
// ===================================================================

/**
 * Generate a timezone-safe date key in YYYY-MM-DD format using local
 * calendar date components (getFullYear, getMonth, getDate).
 *
 * CRITICAL: Never use new Date().toISOString() for daily logs —
 * it returns UTC which can shift the date backwards in negative
 * timezone offsets.
 *
 * @param {Date} [date] - Optional Date object (defaults to now)
 * @returns {string} Local date key in "YYYY-MM-DD" format
 */
export function getLocalDateKey(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD date key into a Date object at local midnight.
 * @param {string} key - Date key in "YYYY-MM-DD" format
 * @returns {Date} Date object set to local midnight
 */
export function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Add days to a date key and return a new date key.
 * @param {string} key - Starting date key "YYYY-MM-DD"
 * @param {number} days - Number of days to add (can be negative)
 * @returns {string} New date key
 */
export function addDaysToKey(key, days) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

/**
 * Get the day of the week (0 = Sunday, 6 = Saturday) for a date key.
 * @param {string} key - Date key "YYYY-MM-DD"
 * @returns {number} Day of week index (0-6)
 */
export function getDayOfWeek(key) {
  return parseDateKey(key).getDay();
}

/**
 * Get a human-readable label for a date key.
 * @param {string} key - Date key "YYYY-MM-DD"
 * @param {boolean} [short] - Use short format (Mon) vs full (Monday)
 * @returns {string} Day name
 */
export function getDayName(key, short = true) {
  const days = short
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
  return days[getDayOfWeek(key)];
}

/**
 * Get month name for a date key.
 * @param {string} key - Date key "YYYY-MM-DD"
 * @param {boolean} [short] - Use abbreviated month name
 * @returns {string} Month name
 */
export function getMonthName(key, short = true) {
  const date = parseDateKey(key);
  return date.toLocaleDateString("en-US", {
    month: short ? "short" : "long",
  });
}

/**
 * Get the start-of-week date key (Sunday-based) for a given date.
 * @param {string} key - Date key "YYYY-MM-DD"
 * @returns {string} Sunday date key for that week
 */
export function getStartOfWeek(key) {
  const date = parseDateKey(key);
  const dayOfWeek = date.getDay(); // 0 = Sunday
  date.setDate(date.getDate() - dayOfWeek);
  return getLocalDateKey(date);
}

/**
 * Generate a 52-week contribution heatmap matrix aligned by day-of-week
 * (Sunday → Saturday, 7 rows × 52 columns).
 *
 * Each cell contains:
 *   { date: string, completions: number, total: number, intensity: 0-4 }
 *
 * The matrix spans from 52 weeks ago (Sunday start) to today's week.
 *
 * @param {Object<string, boolean>} completions - Completion map keyed by `${habitId}_${YYYY-MM-DD}`
 * @param {string[]} habitOrder - Ordered array of habit IDs
 * @returns {Array<Array<{date: string, completions: number, total: number, intensity: number}>>}
 *   Returns an array of 52 week-columns, each with 7 day-cells (Sun-Sat).
 */
export function generateHeatmapMatrix(completions, habitOrder) {
  const totalHabits = habitOrder.length;
  const todayKey = getLocalDateKey();
  const todayDow = getDayOfWeek(todayKey);

  // The current week's Sunday (end of the 52-week span)
  const currentWeekStart = addDaysToKey(todayKey, -todayDow);

  // 52 weeks before the current week's Sunday
  const matrixStart = addDaysToKey(currentWeekStart, -7 * 51);

  const matrix = [];

  for (let week = 0; week < 52; week++) {
    const weekColumn = [];
    for (let day = 0; day < 7; day++) {
      const cellDate = addDaysToKey(matrixStart, week * 7 + day);

      // Count completions for this date across all habits
      let completedCount = 0;
      for (const habitId of habitOrder) {
        if (completions[`${habitId}_${cellDate}`]) {
          completedCount++;
        }
      }

      // Determine intensity level (0-4)
      let intensity = 0;
      if (totalHabits > 0) {
        const ratio = completedCount / totalHabits;
        if (completedCount === 0) {
          intensity = 0;
        } else if (ratio <= 0.25) {
          intensity = 1;
        } else if (ratio <= 0.5) {
          intensity = 2;
        } else if (ratio <= 0.75) {
          intensity = 3;
        } else {
          intensity = 4;
        }
      }

      // Don't render future dates (they're empty placeholders)
      const isFuture = parseDateKey(cellDate) > parseDateKey(todayKey);

      weekColumn.push({
        date: cellDate,
        completions: completedCount,
        total: totalHabits,
        intensity: isFuture ? -1 : intensity,
        isFuture,
        isToday: cellDate === todayKey,
      });
    }
    matrix.push(weekColumn);
  }

  return matrix;
}

/**
 * Calculate streak data for a specific habit by iterating backward from today.
 *
 * Returns:
 *   - currentStreak: consecutive active days ending today (or yesterday if today
 *     is not completed — grace period of 0 days, so today must be done for >0)
 *   - longestStreak: maximum consecutive days ever recorded
 *   - lastCompletedDate: the most recent date this habit was completed
 *
 * @param {string} habitId - The habit ID to calculate streaks for
 * @param {Object<string, boolean>} completions - Completion map
 * @returns {{currentStreak: number, longestStreak: number, lastCompletedDate: string|null}}
 */
export function calculateStreaks(habitId, completions) {
  const todayKey = getLocalDateKey();
  let currentStreak = 0;
  let longestStreak = 0;
  let lastCompletedDate = null;

  // Build a sorted list of all completed dates for this habit (newest first)
  const completedDates = [];
  const prefix = `${habitId}_`;
  for (const key in completions) {
    if (completions[key] && key.startsWith(prefix)) {
      completedDates.push(key.slice(prefix.length));
    }
  }
  completedDates.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  lastCompletedDate = completedDates[0];

  // Calculate current streak: walk backward from today
  // If today is not completed, check yesterday (grace: if today is incomplete,
  // current streak still counts if yesterday was done, since the day isn't over)
  let checkDate = todayKey;
  if (!completions[`${habitId}_${checkDate}`]) {
    // Today not done — check from yesterday
    checkDate = addDaysToKey(checkDate, -1);
  }

  while (completions[`${habitId}_${checkDate}`]) {
    currentStreak++;
    checkDate = addDaysToKey(checkDate, -1);
  }

  // Calculate longest streak: iterate through sorted dates
  let tempStreak = 1;
  longestStreak = 1;
  for (let i = 1; i < completedDates.length; i++) {
    const prev = completedDates[i - 1];
    const curr = completedDates[i];
    // Check if consecutive (prev - 1 day == curr)
    const expected = addDaysToKey(prev, -1);
    if (curr === expected) {
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 1;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  return { currentStreak, longestStreak, lastCompletedDate };
}

/**
 * Calculate the completion rate for a habit over a given date range.
 * @param {string} habitId - The habit ID
 * @param {Object<string, boolean>} completions - Completion map
 * @param {number} [days] - Number of days to look back (default 30)
 * @returns {{completed: number, total: number, rate: number}}
 */
export function getCompletionRate(habitId, completions, days = 30) {
  let completed = 0;
  let total = 0;
  let checkDate = getLocalDateKey();

  for (let i = 0; i < days; i++) {
    total++;
    if (completions[`${habitId}_${checkDate}`]) {
      completed++;
    }
    checkDate = addDaysToKey(checkDate, -1);
  }

  return {
    completed,
    total,
    rate: total > 0 ? completed / total : 0,
  };
}

/**
 * Count completions by day-of-week (0=Sunday ... 6=Saturday) for a habit.
 * @param {string} habitId - The habit ID
 * @param {Object<string, boolean>} completions - Completion map
 * @param {number} [days] - Days to look back (default 90)
 * @returns {number[]} Array of 7 counts (index 0=Sunday, 6=Saturday)
 */
export function getDayOfWeekFrequency(habitId, completions, days = 90) {
  const freq = [0, 0, 0, 0, 0, 0, 0];
  let checkDate = getLocalDateKey();

  for (let i = 0; i < days; i++) {
    if (completions[`${habitId}_${checkDate}`]) {
      freq[getDayOfWeek(checkDate)]++;
    }
    checkDate = addDaysToKey(checkDate, -1);
  }

  return freq;
}

/**
 * Generate a UUID v4 identifier.
 * Uses crypto.randomUUID if available, falls back to manual implementation.
 * @returns {string} UUID v4 string
 */
export function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: manual UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
