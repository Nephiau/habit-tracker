// ===================================================================
// HabitContext.jsx — Global state via useReducer with debounced
// localStorage persistence. Actions: ADD_HABIT, EDIT_HABIT,
// DELETE_HABIT, TOGGLE_COMPLETION, IMPORT_DATA.
// ===================================================================

import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { generateUUID } from "../utils/dateUtils.js";
import { getInitialSeedData } from "../data/initialSeed.js";

const STORAGE_KEY = "habit_tracker_workspace_v1";
const DEBOUNCE_MS = 300;

// -------------------------------------------------------------------
// Action Types
// -------------------------------------------------------------------
export const ACTIONS = {
  ADD_HABIT: "ADD_HABIT",
  EDIT_HABIT: "EDIT_HABIT",
  DELETE_HABIT: "DELETE_HABIT",
  TOGGLE_COMPLETION: "TOGGLE_COMPLETION",
  IMPORT_DATA: "IMPORT_DATA",
};

// -------------------------------------------------------------------
// Reducer — MUST be pure (no side effects, no localStorage writes here)
// -------------------------------------------------------------------
function habitReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_HABIT: {
      const { title, description, category, colorTheme } = action.payload;
      const newHabit = {
        id: generateUUID(),
        title: title.trim(),
        description: (description || "").trim(),
        category: category || "General",
        colorTheme: colorTheme || "emerald",
        createdAt: Date.now(),
      };
      return {
        ...state,
        habits: { ...state.habits, [newHabit.id]: newHabit },
        habitOrder: [...state.habitOrder, newHabit.id],
      };
    }

    case ACTIONS.EDIT_HABIT: {
      const { id, updates } = action.payload;
      const existing = state.habits[id];
      if (!existing) return state;
      return {
        ...state,
        habits: {
          ...state.habits,
          [id]: {
            ...existing,
            ...updates,
            title: updates.title !== undefined ? updates.title.trim() : existing.title,
            description:
              updates.description !== undefined
                ? updates.description.trim()
                : existing.description,
          },
        },
      };
    }

    case ACTIONS.DELETE_HABIT: {
      const { id } = action.payload;
      // Remove from habits dict
      const { [id]: _removed, ...restHabits } = state.habits;
      // Remove from order array
      const newOrder = state.habitOrder.filter((hId) => hId !== id);
      // Remove all completion entries for this habit
      const prefix = `${id}_`;
      const newCompletions = {};
      for (const key in state.completions) {
        if (!key.startsWith(prefix)) {
          newCompletions[key] = state.completions[key];
        }
      }
      return {
        habits: restHabits,
        habitOrder: newOrder,
        completions: newCompletions,
      };
    }

    case ACTIONS.TOGGLE_COMPLETION: {
      const { habitId, dateKey } = action.payload;
      const compKey = `${habitId}_${dateKey}`;
      const isCompleted = state.completions[compKey];
      const newCompletions = { ...state.completions };
      if (isCompleted) {
        delete newCompletions[compKey];
      } else {
        newCompletions[compKey] = true;
      }
      return { ...state, completions: newCompletions };
    }

    case ACTIONS.IMPORT_DATA: {
      const { habits, habitOrder, completions } = action.payload;
      // Validate imported shape, fallback to current if invalid
      if (!habits || !habitOrder || !completions) return state;
      return {
        habits: habits,
        habitOrder: habitOrder,
        completions: completions,
      };
    }

    default:
      return state;
  }
}

// -------------------------------------------------------------------
// Load from localStorage or seed defaults
// -------------------------------------------------------------------
function loadInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.habits && parsed.habitOrder && parsed.completions) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load from localStorage, seeding defaults:", e);
  }
  // Seed with initial data
  return getInitialSeedData();
}

// -------------------------------------------------------------------
// Context
// -------------------------------------------------------------------
const HabitContext = createContext(null);

// -------------------------------------------------------------------
// Provider component
// -------------------------------------------------------------------
export function HabitProvider({ children }) {
  const [state, dispatch] = useReducer(habitReducer, undefined, loadInitialState);

  // Debounced localStorage persistence (300ms after last change)
  const debounceRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip the initial mount save (data was loaded from localStorage or seeded)
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error("Failed to persist to localStorage:", e);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state]);

  // Action dispatchers (convenience wrappers)
  const addHabit = (habitData) => dispatch({ type: ACTIONS.ADD_HABIT, payload: habitData });
  const editHabit = (id, updates) => dispatch({ type: ACTIONS.EDIT_HABIT, payload: { id, updates } });
  const deleteHabit = (id) => dispatch({ type: ACTIONS.DELETE_HABIT, payload: { id } });
  const toggleCompletion = (habitId, dateKey) =>
    dispatch({ type: ACTIONS.TOGGLE_COMPLETION, payload: { habitId, dateKey } });
  const importData = (data) => dispatch({ type: ACTIONS.IMPORT_DATA, payload: data });

  const value = {
    state,
    dispatch,
    addHabit,
    editHabit,
    deleteHabit,
    toggleCompletion,
    importData,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

// -------------------------------------------------------------------
// Custom hook
// -------------------------------------------------------------------
export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return ctx;
}
