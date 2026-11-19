// ===================================================================
// initialSeed.js — Default starter habits and 30-day sample
// completion logs to populate the app on first launch.
// ===================================================================

import { getLocalDateKey, addDaysToKey, generateUUID } from "../utils/dateUtils.js";

/**
 * Default starter habits (4 habits across different categories).
 * Each gets a unique colorTheme from the Sage & Paper palette.
 */
const seedHabits = [
  {
    id: "habit-deep-work",
    title: "Deep Work",
    description: "90 minutes of focused, distraction-free work",
    category: "Productivity",
    colorTheme: "indigo",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: "habit-morning-run",
    title: "Morning Run",
    description: "20-minute run or brisk walk outdoors",
    category: "Health",
    colorTheme: "emerald",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: "habit-read",
    title: "Read",
    description: "Read at least 20 pages of a book",
    category: "Mind",
    colorTheme: "amber",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: "habit-meditate",
    title: "Meditate",
    description: "10 minutes of mindfulness meditation",
    category: "Mind",
    colorTheme: "rose",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
];

/**
 * Generate sample completion logs for the last 30 days.
 * Uses a deterministic pattern per habit to create realistic streaks
 * and gaps for the heatmap to look interesting on first launch.
 *
 * @returns {{habits: Object, habitOrder: string[], completions: Object}}
 */
export function getInitialSeedData() {
  const habits = {};
  const habitOrder = [];

  for (const habit of seedHabits) {
    habits[habit.id] = { ...habit };
    habitOrder.push(habit.id);
  }

  // Build completions: iterate backward 30 days, apply per-habit pattern
  const completions = {};
  const todayKey = getLocalDateKey();

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const dateKey = addDaysToKey(todayKey, -dayOffset);
    const dow = new Date(dateKey).getDay(); // 0=Sunday

    // Deep Work: ~85% completion (skip some Sundays)
    if (!(dow === 0 && dayOffset > 0 && dayOffset % 7 === 0) && Math.random() > 0.12) {
      completions[`habit-deep-work_${dateKey}`] = true;
    }

    // Morning Run: ~65% completion (skip more often, heavier on weekends)
    if (dow >= 1 && dow <= 5 && Math.random() > 0.3) {
      completions[`habit-morning-run_${dateKey}`] = true;
    } else if (Math.random() > 0.6) {
      completions[`habit-morning-run_${dateKey}`] = true;
    }

    // Read: ~75% completion
    if (Math.random() > 0.22) {
      completions[`habit-read_${dateKey}`] = true;
    }

    // Meditate: ~55% completion (more sporadic)
    if (Math.random() > 0.42) {
      completions[`habit-meditate_${dateKey}`] = true;
    }
  }

  // Ensure today has at least 2 completions for a good first impression
  let todayCount = 0;
  for (const habitId of habitOrder) {
    if (completions[`${habitId}_${todayKey}`]) todayCount++;
  }
  if (todayCount < 2) {
    completions[`habit-deep-work_${todayKey}`] = true;
    completions[`habit-read_${todayKey}`] = true;
  }

  return { habits, habitOrder, completions };
}
