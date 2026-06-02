import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        accent: {
          primary: "#FFFFFF",    // White (Neutral/Control)
          secondary: "#3b82f6",  // Royal/Electric Blue
          tertiary: "#14b8a6",   // Muted Teal/Cyan (Premium Analytics)
          solar: "#f59e0b",      // Balanced Amber
          budget: "#10b981",     // Deep Emerald
          system: "#71717a",     // Steel/Zinc Gray (System Console)
          routine: "#6366f1",    // Refined Indigo
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
