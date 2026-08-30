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
          bg: "#f8fafc",
          card: "#ffffff",
          border: "#e2e8f0",
          subtle: "#64748b",
          accent: "#eab308",
          accentHover: "#ca8a04",
          accentLight: "#fef08a",
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

