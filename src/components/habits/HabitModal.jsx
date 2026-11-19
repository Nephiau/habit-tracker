// ===================================================================
// HabitModal.jsx — Create / Edit habit form modal.
// Fields: Title (required), Description, Category, ColorTheme picker.
// ===================================================================

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useHabits } from "../../context/HabitContext.jsx";
import { COLOR_THEME_KEYS, getTheme } from "../../utils/colorThemes.js";

export default function HabitModal({ isOpen, onClose, editingHabit }) {
  const { addHabit, editHabit } = useHabits();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [colorTheme, setColorTheme] = useState("emerald");
  const [titleError, setTitleError] = useState("");

  // Populate form when editing, reset when creating
  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title || "");
      setDescription(editingHabit.description || "");
      setCategory(editingHabit.category || "General");
      setColorTheme(editingHabit.colorTheme || "emerald");
    } else {
      setTitle("");
      setDescription("");
      setCategory("General");
      setColorTheme("emerald");
    }
    setTitleError("");
  }, [editingHabit, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Habit name is required");
      return;
    }

    if (editingHabit) {
      editHabit(editingHabit.id, {
        title,
        description,
        category,
        colorTheme,
      });
    } else {
      addHabit({
        title,
        description,
        category,
        colorTheme,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border-subtle bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {editingHabit ? "Edit Habit" : "New Habit"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-canvas"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="e.g., Deep Work"
              className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 ${
                titleError
                  ? "border-rose-400 focus:ring-rose-300"
                  : "border-border-subtle focus:ring-accent/30"
              }`}
              autoFocus
            />
            {titleError && <p className="mt-1 text-xs text-rose-600">{titleError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this habit involve?"
              rows={2}
              className="w-full resize-none rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Health, Productivity, Mind"
              className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Color Theme Picker */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_THEME_KEYS.map((key) => {
                const t = getTheme(key);
                const isSelected = colorTheme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColorTheme(key)}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "border-ink/20 bg-canvas"
                        : "border-border-subtle hover:border-ink-muted/40"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full ${t.dot}`}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border-subtle px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              {editingHabit ? "Save Changes" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
