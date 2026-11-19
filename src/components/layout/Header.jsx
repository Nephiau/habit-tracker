// ===================================================================
// Header.jsx — App title, Quick Add Habit button, JSON export/import
// controls, and Dashboard/Analytics tab navigation.
// ===================================================================

import { useRef } from "react";
import { Plus, Download, Upload, Activity } from "lucide-react";
import { useHabits } from "../../context/HabitContext.jsx";

export default function Header({
  activeTab,
  onTabChange,
  onQuickAdd,
  importStatus,
  setImportStatus,
}) {
  const { state, importData } = useHabits();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const data = {
      habits: state.habits,
      habitOrder: state.habitOrder,
      completions: state.completions,
      exportedAt: new Date().toISOString(),
      version: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.habits || !data.habitOrder || !data.completions) {
          setImportStatus({ type: "error", message: "Invalid backup file format." });
        } else {
          importData({
            habits: data.habits,
            habitOrder: data.habitOrder,
            completions: data.completions,
          });
          setImportStatus({ type: "success", message: "Backup imported successfully." });
        }
      } catch (err) {
        setImportStatus({ type: "error", message: "Failed to parse JSON file." });
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-ink md:text-lg">
                Habit Tracker
              </h1>
              <p className="text-xs leading-tight text-ink-muted">Contribution Heatmap Studio</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={handleExport}
              className="flex h-9 items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink md:px-3"
              title="Export JSON backup"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleImportClick}
              className="flex h-9 items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink md:px-3"
              title="Import JSON backup"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={onQuickAdd}
              className="flex h-9 items-center gap-1.5 rounded-md bg-accent px-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 md:px-3"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Habit</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="mt-3 flex gap-1">
          <TabButton
            label="Dashboard"
            isActive={activeTab === "dashboard"}
            onClick={() => onTabChange("dashboard")}
          />
          <TabButton
            label="Analytics"
            isActive={activeTab === "analytics"}
            onClick={() => onTabChange("analytics")}
          />
        </nav>
      </div>
    </header>
  );
}

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-surface text-ink border border-border-subtle"
          : "text-ink-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
