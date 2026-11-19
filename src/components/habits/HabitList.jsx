// ===================================================================
// HabitList.jsx — Daily checklist with interactive check-in circles
// and mini 7-day streak pills. Each habit shows its current streak
// count and the last 7 days of completion as colored dots.
// ===================================================================

import { useMemo, useState } from "react";
import { Check, Flame, Pencil, Trash2, Plus } from "lucide-react";
import { useHabits } from "../../context/HabitContext.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import {
  getLocalDateKey,
  addDaysToKey,
  calculateStreaks,
  getDayName,
} from "../../utils/dateUtils.js";
import { getTheme } from "../../utils/colorThemes.js";

export default function HabitList({ onEdit, onAdd }) {
  const { state, toggleCompletion, deleteHabit } = useHabits();
  const { habits, habitOrder, completions } = state;
  const todayKey = getLocalDateKey();
  const [pendingDelete, setPendingDelete] = useState(null);

  if (habitOrder.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface p-8 text-center">
        <p className="text-sm text-ink-muted">No habits yet. Create your first habit to start tracking.</p>
        <button
          onClick={onAdd}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {habitOrder.map((habitId) => {
          const habit = habits[habitId];
          if (!habit) return null;
          return (
            <HabitRow
              key={habitId}
              habit={habit}
              habitId={habitId}
              completions={completions}
              todayKey={todayKey}
              onToggle={() => toggleCompletion(habitId, todayKey)}
              onEdit={() => onEdit(habit)}
              onDelete={() => setPendingDelete(habit)}
            />
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete Habit"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This will also remove all completion history for this habit. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          deleteHabit(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function HabitRow({ habit, habitId, completions, todayKey, onToggle, onEdit, onDelete }) {
  const theme = getTheme(habit.colorTheme);
  const isCompletedToday = !!completions[`${habitId}_${todayKey}`];

  // Calculate streaks
  const streaks = useMemo(
    () => calculateStreaks(habitId, completions),
    [habitId, completions]
  );

  // Last 7 days for the mini streak pills
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dateKey = addDaysToKey(todayKey, -i);
      days.push({
        dateKey,
        dayLabel: getDayName(dateKey, true)[0], // First letter
        completed: !!completions[`${habitId}_${dateKey}`],
        isToday: dateKey === todayKey,
      });
    }
    return days;
  }, [habitId, completions, todayKey]);

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-3 transition-colors hover:border-ink-muted/30 md:gap-4 md:p-4">
      {/* Check-in circle */}
      <button
        onClick={onToggle}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all md:h-10 md:w-10 ${
          isCompletedToday
            ? `${theme.checkBg} ${theme.checkBorder} text-white`
            : `border-border-subtle bg-transparent text-transparent hover:${theme.border}`
        }`}
        aria-label={isCompletedToday ? "Mark as not done" : "Mark as done"}
      >
        <Check className={`h-5 w-5 ${isCompletedToday ? "opacity-100" : "opacity-0"}`} />
      </button>

      {/* Habit info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-ink md:text-base">{habit.title}</h3>
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${theme.badge}`}>
            {habit.category}
          </span>
        </div>
        {habit.description && (
          <p className="mt-0.5 truncate text-xs text-ink-muted md:text-sm">{habit.description}</p>
        )}
      </div>

      {/* 7-day streak pills */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {last7Days.map((day) => (
          <div key={day.dateKey} className="flex flex-col items-center gap-1">
            <span className="text-xs text-ink-muted">{day.dayLabel}</span>
            <div
              className={`h-5 w-5 rounded-full transition-colors ${
                day.completed ? theme.dot : "bg-border-subtle"
              } ${day.isToday ? "ring-2 ring-offset-1 ring-ink-muted/40" : ""}`}
            />
          </div>
        ))}
      </div>

      {/* Current streak */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Flame className={`h-4 w-4 ${streaks.currentStreak > 0 ? "text-amber-500" : "text-ink-muted/30"}`} />
        <span className="font-mono text-sm font-bold tabular-nums text-ink">
          {streaks.currentStreak}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink"
          aria-label="Edit habit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-rose-50 hover:text-rose-600"
          aria-label="Delete habit"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
