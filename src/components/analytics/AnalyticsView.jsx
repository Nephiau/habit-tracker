// ===================================================================
// AnalyticsView.jsx — Detailed breakdown per habit with completion
// rate, current/longest streak, and day-of-week frequency charts.
// ===================================================================

import { useMemo } from "react";
import { useHabits } from "../../context/HabitContext.jsx";
import {
  calculateStreaks,
  getCompletionRate,
  getDayOfWeekFrequency,
} from "../../utils/dateUtils.js";
import { getTheme } from "../../utils/colorThemes.js";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsView() {
  const { state } = useHabits();
  const { habits, habitOrder, completions } = state;

  if (habitOrder.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface p-8 text-center">
        <p className="text-sm text-ink-muted">
          No habits to analyze. Create a habit to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">Analytics</h2>
      {habitOrder.map((habitId) => {
        const habit = habits[habitId];
        if (!habit) return null;
        return <HabitAnalyticsCard key={habitId} habit={habit} habitId={habitId} completions={completions} />;
      })}
    </div>
  );
}

function HabitAnalyticsCard({ habit, habitId, completions }) {
  const theme = getTheme(habit.colorTheme);

  const data = useMemo(() => {
    const rate = getCompletionRate(habitId, completions, 30);
    const streaks = calculateStreaks(habitId, completions);
    const dowFreq = getDayOfWeekFrequency(habitId, completions, 90);
    const maxFreq = Math.max(...dowFreq, 1);

    // SVG line chart geometry
    const VW = 700, VH = 140;
    const PAD_TOP = 18, PAD_BOTTOM = 24, PAD_X = 20;
    const plotW = VW - PAD_X * 2;
    const plotH = VH - PAD_TOP - PAD_BOTTOM;
    const baselineY = PAD_TOP + plotH;

    const points = dowFreq.map((count, idx) => {
      const x = PAD_X + (idx / (dowFreq.length - 1)) * plotW;
      const y = PAD_TOP + plotH - (count / maxFreq) * plotH;
      return { x, y, count };
    });

    const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const areaPath =
      `M ${points[0].x},${baselineY} ` +
      points.map((p) => `L ${p.x},${p.y}`).join(" ") +
      ` L ${points[points.length - 1].x},${baselineY} Z`;

    return {
      rate,
      streaks,
      dowFreq,
      maxFreq,
      points,
      linePoints,
      areaPath,
      baselineY,
      gradientId: `grad-${habitId}`,
    };
  }, [habitId, completions]);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4 md:p-5">
      {/* Header row */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${theme.dot}`} />
        <h3 className="text-base font-semibold text-ink">{habit.title}</h3>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${theme.badge}`}>
          {habit.category}
        </span>
      </div>

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="30-Day Rate" value={`${Math.round(data.rate.rate * 100)}%`} subtext={`${data.rate.completed}/${data.rate.total}`} />
        <Stat label="Current Streak" value={`${data.streaks.currentStreak}`} subtext={data.streaks.currentStreak === 1 ? "day" : "days"} />
        <Stat label="Longest Streak" value={`${data.streaks.longestStreak}`} subtext={data.streaks.longestStreak === 1 ? "day" : "days"} />
      </div>

      {/* Day-of-week frequency line chart */}
      <div>
        <p className="mb-2 text-xs font-medium text-ink-muted">Completion by Day of Week (last 90 days)</p>
        <svg viewBox="0 0 700 140" className="w-full">
          <defs>
            <linearGradient id={data.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.swatch} stopOpacity="0.2" />
              <stop offset="100%" stopColor={theme.swatch} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* baseline */}
          <line
            x1={20}
            y1={data.baselineY}
            x2={680}
            y2={data.baselineY}
            stroke="#D6DFD7"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          {/* area fill */}
          <path d={data.areaPath} fill={`url(#${data.gradientId})`} />
          {/* line */}
          <polyline
            points={data.linePoints}
            fill="none"
            stroke={theme.swatch}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* data points + count labels */}
          {data.points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="4" fill={theme.swatch} />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fill="#5C7365"
                style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}
              >
                {p.count}
              </text>
            </g>
          ))}
          {/* day labels */}
          {data.points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={134}
              textAnchor="middle"
              fill="#5C7365"
              style={{ fontSize: "11px" }}
            >
              {DAY_LABELS[idx]}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function Stat({ label, value, subtext }) {
  return (
    <div className="rounded-md border border-border-subtle bg-canvas p-3">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums text-ink">{value}</p>
      {subtext && <p className="mt-0.5 text-xs text-ink-muted">{subtext}</p>}
    </div>
  );
}
