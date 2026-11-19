// ===================================================================
// ContributionMatrix.jsx — 52-week GitHub-style contribution heatmap.
// 52 columns (weeks) × 7 rows (Sun-Sat). Intensity 0-4 mapped to
// Sage & Paper heat colors. Includes hover tooltip, month labels,
// day labels, and legend.
// ===================================================================

import { useMemo, useState } from "react";
import { useHabits } from "../../context/HabitContext.jsx";
import { generateHeatmapMatrix, getMonthName, getDayName } from "../../utils/dateUtils.js";

const INTENSITY_COLORS = [
  "bg-heat-0", // 0: no activity
  "bg-heat-1", // 1: lightest
  "bg-heat-2", // 2: medium-light
  "bg-heat-3", // 3: medium-dark
  "bg-heat-4", // 4: darkest (full)
];

export default function ContributionMatrix() {
  const { state } = useHabits();
  const { habitOrder, completions } = state;
  const [hoveredCell, setHoveredCell] = useState(null);

  const matrix = useMemo(
    () => generateHeatmapMatrix(completions, habitOrder),
    [completions, habitOrder]
  );

  // Calculate total contributions for the year
  const totalCompletions = useMemo(() => {
    let count = 0;
    for (const week of matrix) {
      for (const cell of week) {
        count += cell.completions;
      }
    }
    return count;
  }, [matrix]);

  // Month labels: show month name at the top of the first week that starts a new month
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = null;
    matrix.forEach((week, weekIdx) => {
      const firstDay = week[0]; // Sunday
      const month = getMonthName(firstDay.date, true);
      if (month !== lastMonth) {
        labels.push({ weekIdx, label: month });
        lastMonth = month;
      }
    });
    return labels;
  }, [matrix]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Contribution Activity</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            <span className="font-mono tabular-nums">{totalCompletions}</span> completions in the last year
          </p>
        </div>
      </div>

      {/* Heatmap scroll container */}
      <div className="overflow-x-auto">
        <div className="relative inline-block min-w-full">
          {/* Month labels row */}
          <div className="ml-8 flex" style={{ height: "1.25rem" }}>
            {monthLabels.map(({ weekIdx, label }) => (
              <span
                key={weekIdx}
                className="text-xs text-ink-muted"
                style={{ position: "absolute", left: `${weekIdx * 15 + 32}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-1.5">
            {/* Day-of-week labels column */}
            <div className="flex flex-col gap-1 pt-0.5" style={{ width: "2rem" }}>
              {dayLabels.map((day, idx) => (
                <div
                  key={day}
                  className="flex h-3 items-center text-xs text-ink-muted"
                  style={{ visibility: idx % 2 === 1 ? "visible" : "hidden" }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid: 52 columns × 7 rows */}
            <div className="flex gap-1">
              {matrix.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((cell, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`h-3 w-3 rounded-sm transition-colors ${
                        cell.isFuture
                          ? "bg-transparent"
                          : INTENSITY_COLORS[cell.intensity] || INTENSITY_COLORS[0]
                      } ${cell.isToday ? "ring-1 ring-accent ring-offset-0" : ""}`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {hoveredCell && !hoveredCell.isFuture && (
            <div className="absolute z-10 pointer-events-none rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-sm"
              style={{
                left: "50%",
                top: "100%",
                transform: "translateX(-50%)",
                marginTop: "8px",
              }}
            >
              <p className="font-medium text-ink">
                {hoveredCell.completions}/{hoveredCell.total} habits
              </p>
              <p className="text-ink-muted">
                {getDayName(hoveredCell.date, false)}, {getMonthName(hoveredCell.date)}{" "}
                {parseDateKeyDay(hoveredCell.date)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <span className="text-xs text-ink-muted">Less</span>
        <div className={`h-3 w-3 rounded-sm ${INTENSITY_COLORS[0]}`} />
        <div className={`h-3 w-3 rounded-sm ${INTENSITY_COLORS[1]}`} />
        <div className={`h-3 w-3 rounded-sm ${INTENSITY_COLORS[2]}`} />
        <div className={`h-3 w-3 rounded-sm ${INTENSITY_COLORS[3]}`} />
        <div className={`h-3 w-3 rounded-sm ${INTENSITY_COLORS[4]}`} />
        <span className="text-xs text-ink-muted">More</span>
      </div>
    </div>
  );
}

// Helper to get day of month from date key
function parseDateKeyDay(key) {
  return parseInt(key.split("-")[2], 10);
}
