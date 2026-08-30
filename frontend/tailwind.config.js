/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: "#080c14",
          card: "#121826",
          border: "#1f293d",
          subtle: "#334155",
          accent: "#eab308",
          accentHover: "#ca8a04",
          accentLight: "#facc15",
          accentDark: "#a16207",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};

