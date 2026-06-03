import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          primary: "rgb(var(--accent-primary-rgb) / <alpha-value>)",    // Dynamic Neutral (White in Dark, Dark Gray in Light)
          secondary: "rgb(var(--accent-secondary-rgb) / <alpha-value>)",  // Royal/Electric Blue
          tertiary: "rgb(var(--accent-tertiary-rgb) / <alpha-value>)",   // Muted Teal/Cyan (Premium Analytics)
          solar: "rgb(var(--accent-solar-rgb) / <alpha-value>)",      // Balanced Amber
          budget: "rgb(var(--accent-budget-rgb) / <alpha-value>)",     // Deep Emerald
          system: "rgb(var(--accent-system-rgb) / <alpha-value>)",     // Steel/Zinc Gray (System Console)
          routine: "rgb(var(--accent-routine-rgb) / <alpha-value>)",    // Refined Indigo
        },
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
