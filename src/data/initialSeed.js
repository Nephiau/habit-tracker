// ===================================================================
// initialSeed.js — Default starter habits to populate the app on
// first launch. Completion history starts empty.
// ===================================================================

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
 * Generate the initial workspace: starter habits with no completions.
 * The heatmap and metrics start empty until the user checks in.
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

  const completions = {};

  return { habits, habitOrder, completions };
}
