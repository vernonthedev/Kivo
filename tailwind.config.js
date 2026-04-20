/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem"
    },
    extend: {}
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#3b82f6",
          "primary-content": "#ffffff",
          "secondary": "#f3f4f6",
          "secondary-content": "#1f2937",
          "accent": "#e5e7eb",
          "accent-content": "#1f2937",
          "neutral": "#1f2937",
          "neutral-content": "#f9fafb",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "base-content": "#1f2937",
          "info": "#3b82f6",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444"
        },
        dark: {
          "primary": "#60a5fa",
          "primary-content": "#1f2937",
          "secondary": "#1f2937",
          "secondary-content": "#f9fafb",
          "accent": "#374151",
          "accent-content": "#f9fafb",
          "neutral": "#f9fafb",
          "neutral-content": "#1f2937",
          "base-100": "#111827",
          "base-200": "#1f2937",
          "base-300": "#374151",
          "base-content": "#f9fafb",
          "info": "#60a5fa",
          "success": "#4ade80",
          "warning": "#fbbf24",
          "error": "#f87171"
        }
      }
    ],
    darkTheme: "dark",
    base: true,
    utils: true,
    logs: false,
    themeRoot: ":root"
  }
};