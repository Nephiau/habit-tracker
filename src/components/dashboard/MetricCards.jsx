// ===================================================================
// MetricCards.jsx — Dashboard overview metrics: total completion rate,
// current active streak, best streak, and total habits.
// ===================================================================

import { useMemo } from "react";
import { Target, Flame, Trophy, Layers } from "lucide-react";
import { useHabits } from "../../context/HabitContext.jsx";
import { calculateStreaks, getCompletionRate } from "../../utils/dateUtils.js";

export default function MetricCards() {
  const { state } = useHabits();
  const { habits, habitOrder, completions } = state;

  const metrics = useMemo(() => {
    // Total completion rate across all habits (last 30 days)
    let totalCompleted = 0;
    let totalPossible = 0;
    let maxCurrentStreak = 0;
    let maxLongestStreak = 0;

    for (const habitId of habitOrder) {
      const rate = getCompletionRate(habitId, completions, 30);
      totalCompleted += rate.completed;
      totalPossible += rate.total;

      const streaks = calculateStreaks(habitId, completions);
      if (streaks.currentStreak > maxCurrentStreak) {
        maxCurrentStreak = streaks.currentStreak;
      }
      if (streaks.longestStreak > maxLongestStreak) {
        maxLongestStreak = streaks.longestStreak;
      }
    }

    const totalRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      totalRate,
      totalCompleted,
      totalPossible,
      maxCurrentStreak,
      maxLongestStreak,
      habitCount: habitOrder.length,
    };
  }, [habitOrder, completions]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {/* Total Completion Rate */}
      <MetricCard
        icon={Target}
        label="Completion Rate"
        value={`${metrics.totalRate}%`}
        subtext={`${metrics.totalCompleted}/${metrics.totalPossible} last 30d`}
        accent="accent"
      />

      {/* Current Active Streak */}
      <MetricCard
        icon={Flame}
        label="Active Streak"
        value={`${metrics.maxCurrentStreak}`}
        subtext={metrics.maxCurrentStreak === 1 ? "day" : "days"}
        accent="amber"
      />

      {/* Best Streak */}
      <MetricCard
        icon={Trophy}
        label="Best Streak"
        value={`${metrics.maxLongestStreak}`}
        subtext={metrics.maxLongestStreak === 1 ? "day" : "days"}
        accent="indigo"
      />

      {/* Total Habits */}
      <MetricCard
        icon={Layers}
        label="Habits"
        value={`${metrics.habitCount}`}
        subtext="tracked"
        accent="emerald"
      />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, accent }) {
  const accentMap = {
    accent: { icon: "text-accent", ring: "bg-accent-subtle" },
    amber: { icon: "text-amber-600", ring: "bg-amber-100" },
    indigo: { icon: "text-indigo-600", ring: "bg-indigo-100" },
    emerald: { icon: "text-emerald-600", ring: "bg-emerald-100" },
  };
  const a = accentMap[accent] || accentMap.accent;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${a.ring}`}>
          <Icon className={`h-5 w-5 ${a.icon}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-muted">{label}</p>
          <p className="font-mono text-2xl font-bold tabular-nums text-ink">{value}</p>
        </div>
      </div>
      <p className="mt-2 pl-13 text-xs text-ink-muted" style={{ paddingLeft: "3.25rem" }}>
        {subtext}
      </p>
    </div>
  );
}
