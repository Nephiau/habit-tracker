// ===================================================================
// App.jsx — Root layout wiring HabitProvider, Header, Dashboard
// (MetricCards + ContributionMatrix + HabitList), AnalyticsView,
// and HabitModal. Manages active tab and modal state.
// ===================================================================

import { useState, useEffect } from "react";
import { HabitProvider } from "./context/HabitContext.jsx";
import Header from "./components/layout/Header.jsx";
import MetricCards from "./components/dashboard/MetricCards.jsx";
import ContributionMatrix from "./components/dashboard/ContributionMatrix.jsx";
import HabitList from "./components/habits/HabitList.jsx";
import HabitModal from "./components/habits/HabitModal.jsx";
import AnalyticsView from "./components/analytics/AnalyticsView.jsx";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  // Auto-dismiss import status toast after 3 seconds
  useEffect(() => {
    if (!importStatus) return;
    const timer = setTimeout(() => setImportStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [importStatus]);

  const handleQuickAdd = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingHabit(null);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAdd={handleQuickAdd}
        importStatus={importStatus}
        setImportStatus={setImportStatus}
      />

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {/* Import status toast */}
        {importStatus && (
          <div
            className={`mb-4 rounded-md border px-4 py-3 text-sm ${
              importStatus.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-rose-300 bg-rose-50 text-rose-700"
            }`}
          >
            {importStatus.message}
          </div>
        )}

        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            <MetricCards />
            <ContributionMatrix />
            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink">Today's Habits</h2>
              <HabitList onEdit={handleEdit} onAdd={handleQuickAdd} />
            </div>
          </div>
        ) : (
          <AnalyticsView />
        )}
      </main>

      <HabitModal isOpen={modalOpen} onClose={handleCloseModal} editingHabit={editingHabit} />

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 text-center">
        <p className="text-xs text-ink-muted">
          Habit Tracker & Contribution Heatmap Studio · Local-first, no cloud
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}
