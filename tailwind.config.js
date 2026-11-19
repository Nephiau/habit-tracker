/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Sage & Paper Minimalist Design System
        canvas: "#F4F6F4", // Cool sage-tinted background
        surface: "#FFFFFF", // Card and modal surfaces
        ink: "#1A2E22", // Deep forest ink for headings and active text
        "ink-muted": "#5C7365", // Secondary labels and calendar grid borders
        "border-subtle": "#D6DFD7", // Structural 1px dividers
        accent: "#2D6A4F", // Primary forest emerald for completed check-ins and active states
        "accent-subtle": "#D8F3DC", // Lightest square intensity in the contribution heatmap
        // Heatmap intensity steps (0 = empty, 1-4 = increasing intensity)
        "heat-0": "#EBF0EC", // Empty / no activity
        "heat-1": "#D8F3DC", // Lightest intensity
        "heat-2": "#95D5B2", // Medium-light
        "heat-3": "#52B788", // Medium-dark
        "heat-4": "#2D6A4F", // Darkest intensity (accent)
      },
      borderRadius: {
        md: "0.375rem", // inputs and action buttons
        lg: "0.5rem", // cards, modals, heatmap wrappers
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
